import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'express';
import { Repository, Connection, QueryRunner, getManager } from 'typeorm';
import { S3 } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import { Readable } from 'stream';
import * as dayjs from 'dayjs';
import * as hummus from 'hummus';
import * as memoryStreams from 'memory-streams';

import {
  docusignNumberField,
  docusignStringField,
  docusignWithoutValue,
  EmbeddedEnvelopeSigningResponse,
  IAchAuthForm,
  IArgs,
  IEnvelopeArgs,
  IFinancingContractBorrowerData,
  IPersonalGuarantor,
} from '../loan-agreement/data.interface';
import { MailService } from '../../mail/mail.service';
import { DocusignService } from '../docusign/docusign.service';
import { LoanAgreementEntity } from '../../entities/loanAgreement.entity';
import { DocusignFinancingContractEntity } from '../../entities/docusignFinancingContract.entity';
import { DocusignAchFormEntity } from '../../entities/docusignAchForm.entity';
import { DocusignPersonalGuarantorEntity } from '../../entities/docusignPersonalGuarantor.entity';
import { EnvelopeStatus, PhaseFlag } from '../../configs/config.enum';
import { UserRepository } from '../../repository/users.repository';
import { Loan } from '../../entities/loan.entity';
import { CustomerEntity } from '../../entities/customer.entity';
import { InstallerEntity } from '../../entities/installer.entity';
import { DisbursementEntity } from '../../entities/disbursementSequence.entity';
import { ProductEntity } from '../../entities/products.entity';
import { LendingLimitEntity } from '../../entities/lendingLimit.entity';
import { LoanStatus, Flags } from '../../configs/config.enum';
import { UserEntity } from '../../entities/users.entity';
import { PlaidMasterEntity } from '../../entities/plaidMaster.entity';
import { BankAccount } from '../../entities/bankAccount.entity';
import { UserBankAccount } from '../../entities/userBankAccount.entity';
import { PlaidAuthEntity } from '../../entities/plaidAuth.entity';

interface SelectedBankAccountInfo {
  accountNumber: string;
  accountType: string;
  bankName: string;
  bankCity: string;
  bankState: string;
  bankZipCode: string;
  nameOnAccount: string;
  routingNumber: string;
}

@Injectable()
export class LoanAgreementService {
  private s3: S3;

  constructor(
    @InjectRepository(LoanAgreementEntity)
    private loanAgreementRepository: Repository<LoanAgreementEntity>,
    @InjectRepository(DocusignFinancingContractEntity)
    private docusignFinancingContractRepository: Repository<DocusignFinancingContractEntity>,
    @InjectRepository(DocusignAchFormEntity)
    private docusignAchFormRepository: Repository<DocusignAchFormEntity>,
    @InjectRepository(DocusignPersonalGuarantorEntity)
    private docusignPersonalGuarantorRepository: Repository<DocusignPersonalGuarantorEntity>,
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
    @InjectRepository(Loan)
    private readonly loanRepository: Repository<Loan>,
    @InjectRepository(CustomerEntity)
    private readonly customerRepository: Repository<CustomerEntity>,
    @InjectRepository(InstallerEntity)
    private readonly installerRepository: Repository<InstallerEntity>,
    @InjectRepository(DisbursementEntity)
    private readonly disbursementRepository: Repository<DisbursementEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    @InjectRepository(LendingLimitEntity)
    private readonly lendingLimitRepository: Repository<LendingLimitEntity>,
    @InjectRepository(PlaidMasterEntity)
    private readonly plaidMasterRepository: Repository<PlaidMasterEntity>,
    @InjectRepository(BankAccount)
    private readonly bankAccountRepository: Repository<BankAccount>,
    @InjectRepository(UserBankAccount)
    private readonly userBankAccountRepository: Repository<UserBankAccount>,
    @InjectRepository(PlaidAuthEntity)
    private readonly plaidAuthRepository: Repository<PlaidAuthEntity>,
    private readonly docusignService: DocusignService,
    private readonly configService: ConfigService,
    private readonly connection: Connection,
    private readonly mailService: MailService
  ) {
    this.s3 = new S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });
  }

  public async create(loanId: string): Promise<EmbeddedEnvelopeSigningResponse> {
    const loan = await this.findApprovedLoan(loanId);
    const customerUser = await this.userRepository.findOne({ id: loan.user_id });
    const docusignApiToken = (await this.docusignService.checkToken()).access_token;
    const existingLoanAgreement = await this.loanAgreementRepository.findOne({ loanId });
    const docusignData: IArgs = {
      accessToken: docusignApiToken,
      viewerEmail: customerUser.email,
      viewerName: `${customerUser.firstName} ${customerUser.lastName || ''}`,
      dsReturnUrl: this.configService.get<string>('FRONTEND_URL'),
      envelopeId: existingLoanAgreement?.envelopeId
    };

    if (!existingLoanAgreement) {
      docusignData.envelopeArgs = await this.createDocuSignEnvelopeArgsObject(loan, customerUser);
    }

    const embeddedEnvelopeSigningResponse = await this.docusignService.sendEnvelopeForEmbeddedSigning(docusignData);

    if (!existingLoanAgreement) {
      await this.persistEnvelopeData(
        loan,
        docusignData.envelopeArgs,
        embeddedEnvelopeSigningResponse.envelopeId
      );
    }

    // await this.changeLoanPhaseToContracting(loan);

    return embeddedEnvelopeSigningResponse;
  }

  public async getAdminEnvelope(email: string, loanId: string) {
    const ceoUser = await this.findCeoUser(email);
    const loan = await this.findApprovedLoan(loanId);
    const { access_token } = await this.docusignService.checkToken();
    const { envelopeId, totalAdditionalGuarantors, envelopeStatus } = await this.findLoanAgreement(loan.id);
    const isEnvelopeSignedByGuarantors = totalAdditionalGuarantors === 0 ? 
      envelopeStatus === EnvelopeStatus.MAIN_CUSTOMER_PG_1_SIGNED : 
      envelopeStatus === `${EnvelopeStatus[`PG_${totalAdditionalGuarantors + 1}_SIGNED`]}`;

    if (!envelopeId || !isEnvelopeSignedByGuarantors) {
      throw new ConflictException({
        statusCode: 409,
        message: 'Loan Envelope not found or envelope not signed yet by other recipients'
      });
    }

    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const args: IArgs = {
      accessToken: access_token,
      viewerEmail: ceoUser.email,
      viewerName: `${ceoUser.firstName} ${ceoUser?.lastName}`,
      dsReturnUrl: `${frontendUrl}`,
      envelopeId,
    };
    const embeddedEnvelopeSigningResponse = await this.docusignService.sendEnvelopeForEmbeddedSigning(args);

    return embeddedEnvelopeSigningResponse;
  }

  public async docusignWebhook(id: string, bodyData: any, headerSignature: string) {

    console.log('id--->',id)
    const matchId = this.configService.get<string>('DOCUSIGN_RANDOM_ID');
    const isIdMatch = id === matchId;
    if (!isIdMatch) {
      console.log('Invalid docusign webhook call');
      return 'Bad Request';
    }

    const isWebhookValid = await this.docusignService.isWebhookValid(
      bodyData,
      headerSignature,
    );
    if (!isWebhookValid) {
      console.log('Invalid webhook');
      return;
    }

    const data = bodyData.data;

    const envelopeId = data?.envelopeId || '';
    const { access_token } = await this.docusignService.checkToken();
    const args = {
      accessToken: access_token,
      envelopeId,
    };
    try {
      if (envelopeId) {
        const exEnvelope = await this.loanAgreementRepository.findOne({
          select: [
            'id',
            'envelopeId',
            'envelopeStatus',
            'isAchAuthFormAvailable',
            'completedEnvelopeS3DocKey',
            'loanId',
          ],
          where: {
            envelopeId,
          },
        });

        if (exEnvelope) {
          const isAchauth = exEnvelope.isAchAuthFormAvailable;
          const exStatus = exEnvelope.envelopeStatus;
          const envSummary = data['envelopeSummary'];
          const signers = envSummary['recipients']['signers'];

          if (
            exStatus === EnvelopeStatus.ENVELOPE_CREATED &&
            signers[0]['status'] === 'completed'
          ) {
            args['documentId'] = 1;
            let result = await this.docusignService.getEnvelopeDocPdf(args);
            const buffer1 = Buffer.from(result, 'binary');
            let loanDocKey = `${envelopeId}-financing-contract.pdf`;
            await this.uploadDocS3(buffer1, loanDocKey);

            await this.docusignFinancingContractRepository.update(
              {
                envelopeId,
              },
              {
                customerSigned: true,
                s3DocKey: loanDocKey,
                customerSignedDate: signers[0]['signedDateTime'],
                borrowerRecipientIdGuid: signers[0]['recipientIdGuid'],
              },
            );
            if (isAchauth) {
              args['documentId'] = 2;
              result = await this.docusignService.getEnvelopeDocPdf(args);
              const buffer2 = Buffer.from(result, 'binary');
              loanDocKey = `${envelopeId}-ach-auth-form.pdf`;
              await this.uploadDocS3(buffer2, loanDocKey);
              await this.docusignAchFormRepository.update(
                {
                  envelopeId,
                },
                {
                  customerSigned: true,
                  s3DocKey: loanDocKey,
                  customerSignedDate: signers[0]['signedDateTime'],
                  recipientIdGuid: signers[0]['recipientIdGuid'],
                },
              );
            }

            args['documentId'] = isAchauth ? 3 : 2;
            result = await this.docusignService.getEnvelopeDocPdf(args);
            const buffer3 = Buffer.from(result, 'binary');
            loanDocKey = `${envelopeId}-PG-1.pdf`;
            await this.uploadDocS3(buffer3, loanDocKey);
            await this.docusignPersonalGuarantorRepository.update(
              {
                envelopeId,
                guarantorEmail: signers[0]['email'],
              },
              {
                s3DocKey: loanDocKey,
                guarantorSigned: true,
                guarantorSignedDate: signers[0]['signedDateTime'],
                recipientIdGuid: signers[0]['recipientIdGuid'],
              },
            );
            exEnvelope.envelopeStatus =
              EnvelopeStatus.MAIN_CUSTOMER_PG_1_SIGNED;
          
            await this.loanAgreementRepository.save(exEnvelope);

            // const entityManager = getManager();

            
          //  /*******************************TESTING PURPOSE EMAIL FOR DOCUSIGN**************************/
          //   let customerFinanceDetails = await entityManager.query(`select t1."email" from tblcustomer t1 
          //   where t2."loanId"='${exEnvelope.loanId}'`)
          //    //let fromMaildocusign =`${process.env.OrkaCeoMail}`
          //   let fromMaildocusign =customerFinanceDetails[0]['email']
          //   /*******************************TESTING PURPOSE EMAIL FOR DOCUSIGN**************************/

          //   const sendInstallerData = await entityManager.query(`select t3."legalName",
          //   (select "firstName"  from tbluser where id=t.ins_user_id)
          //    as salesrepFname,(select email  from tbluser where id=t.ins_user_id) as sendemail from tblloan t 
          //   left join tbluser t2 on t2.id =t.user_id 
          //   left join tblcustomer t3 on t3."loanId" =t.id 
          //   where t.id='${exEnvelope.loanId}'`)

          //   const sendDataMainInstaller =  await entityManager.query(`select t2."mainInstallerId" as partnerId  from tblloan t 
          //   left join tbluser t2 on t2.id =t.user_id 
          //   where t.id='${exEnvelope.loanId}'`)

          //   if(sendDataMainInstaller[0]['partnerId']==null){
          //       const Partnername =  await entityManager.query(`select t2."firstName" as partnerName from tblloan t 
          //       left join tbluser t2 on t2.id =t.user_id 
          //       where t.id='${exEnvelope.loanId}'`)
          //       const data={
          //       'installerName':sendInstallerData[0]['salesrepfname'],
          //       'businessName':sendInstallerData[0]['legalName'],
          //       'linkUrl':`${process.env.OrkaUrl}/admin/pending-counter-signature`
          //       }
          //       this.mailService.docusignBorrowerEmail(fromMaildocusign,data)
               
          //   }else{
          //       const Partnername =  await entityManager.query(`select t."firstName" as partnerName from tbluser
          //       t where t.id ='${sendDataMainInstaller[0]['partnerId']}'`)
          //       const data={
          //       'installerName':sendInstallerData[0]['salesrepfname'],
          //       'businessName':sendInstallerData[0]['legalName'],
          //       'linkUrl':`${process.env.OrkaUrl}/admin/pending-counter-signature`
          //       }
          //       this.mailService.docusignBorrowerEmail(fromMaildocusign,data)
          //   }
          }

          if (
            exStatus === EnvelopeStatus.MAIN_CUSTOMER_PG_1_SIGNED &&
            (signers.length === 3 || signers.length === 4) &&
            signers[1]['status'] === 'completed'
          ) {
            args['documentId'] = isAchauth ? 4 : 3;
            const result = await this.docusignService.getEnvelopeDocPdf(args);
            const buffer = Buffer.from(result, 'binary');
            const loanDocKey = `${envelopeId}-pg-2.pdf`;
            await this.uploadDocS3(buffer, loanDocKey);
            await this.docusignPersonalGuarantorRepository.update(
              {
                envelopeId,
                guarantorEmail: signers[1]['email'],
              },
              {
                s3DocKey: loanDocKey,
                guarantorSigned: true,
                guarantorSignedDate: signers[1]['signedDateTime'],
                recipientIdGuid: signers[1]['recipientIdGuid'],
              },
            );
            exEnvelope.envelopeStatus = EnvelopeStatus.PG_2_SIGNED;
            await this.loanAgreementRepository.save(exEnvelope);
          }

          if (
            signers.length === 4 &&
            signers[1]['status'] === 'completed' &&
            signers[2]['status'] === 'completed'
          ) {
            if (exStatus !== EnvelopeStatus.PG_3_SIGNED) {
              args['documentId'] = isAchauth ? 5 : 4;
              const result = await this.docusignService.getEnvelopeDocPdf(args);
              const buffer = Buffer.from(result, 'binary');
              const loanDocKey = `${envelopeId}-pg-3.pdf`;
              await this.uploadDocS3(buffer, loanDocKey);
              await this.docusignPersonalGuarantorRepository.update(
                {
                  envelopeId,
                  guarantorEmail: signers[2]['email'],
                },
                {
                  s3DocKey: loanDocKey,
                  guarantorSigned: true,
                  guarantorSignedDate: signers[2]['signedDateTime'],
                  recipientIdGuid: signers[2]['recipientIdGuid'],
                },
              );
              exEnvelope.envelopeStatus = EnvelopeStatus.PG_3_SIGNED;
              await this.loanAgreementRepository.save(exEnvelope);
            }
          }

          if (
            signers.length === 3 &&
            exStatus === EnvelopeStatus.PG_2_SIGNED &&
            signers[2]['status'] === 'completed'
          ) {
            await this.saveCeoWebhookData(
              args,
              envelopeId,
              signers,
              exEnvelope,
              1,
              2,
            );
          }

          if (
            signers.length === 2 &&
            exStatus === EnvelopeStatus.MAIN_CUSTOMER_PG_1_SIGNED &&
            signers[1]['status'] === 'completed'
          ) {
            await this.saveCeoWebhookData(
              args,
              envelopeId,
              signers,
              exEnvelope,
              1,
              1,
            );
          }

          if (
            signers.length === 4 &&
            exStatus === EnvelopeStatus.PG_3_SIGNED &&
            signers[3]['status'] === 'completed'
          ) {
            await this.saveCeoWebhookData(
              args,
              envelopeId,
              signers,
              exEnvelope,
              1,
              3,
            );
          }

          return 'Envelope is up to date';
        } else {
          return 'Envelope not found';
        }
      }
    } catch (error) {
      console.log('Error', error);
      return 'Failed to update envelope status';
    }
  }

  public async getFinancingAgreementDoc(email: string, loanId: string, res) {
    const user = await this.userRepository.findOne({
      select: ['id'],
      where: {
        email,
      },
    });

    if (!user) {
      return {
        statusCode: 404,
        message: 'User not found',
      };
    }
    const userId = user.id;

    try {
      const exEnvelope = await this.isEnvelopeExist(loanId, userId);
      //@ts-ignore
      const envelopeId = exEnvelope ? exEnvelope?.envelopeId : null;
      const envStatus = exEnvelope ? exEnvelope?.envelopeStatus : null;

      if (envelopeId && envStatus === EnvelopeStatus.CEO_SIGNED) {
        const fc = await this.docusignFinancingContractRepository.findOne({
          select: ['id', 's3DocKey'],
          where: {
            envelopeId,
          },
        });
        if (fc?.s3DocKey) {
          await this.downloadDocS3(`${fc.s3DocKey}`, res);
          return;
        } else {
          return {
            statusCode: 404,
            message: 'Loan Document not found',
          };
        }
      }

      return {
        statusCode: 404,
        message: 'Loan not found or documents not completely signed',
      };
    } catch (error) {
      return {
        statusCode: 400,
        message: error?.message,
      };
    }
  }

  public async getAchAuthFormDoc(email: string, loanId: string, res) {
    const user = await this.userRepository.findOne({
      select: ['id'],
      where: {
        email,
      },
    });

    if (!user) {
      return {
        statusCode: 404,
        message: 'User not found',
      };
    }
    const userId = user.id;
    try {
      const exEnvelope = await this.isEnvelopeExist(loanId, userId);
      //@ts-ignore
      const envelopeId = exEnvelope ? exEnvelope?.envelopeId : null;
      const envStatus = exEnvelope ? exEnvelope?.envelopeStatus : null;

      if (envelopeId && envStatus === EnvelopeStatus.CEO_SIGNED) {
        const ach = await this.docusignAchFormRepository.findOne({
          select: ['id', 's3DocKey'],
          where: {
            envelopeId,
          },
        });
        if (ach?.s3DocKey) {
          await this.downloadDocS3(`${ach.s3DocKey}`, res);
          return;
        } else {
          return {
            statusCode: 404,
            message: 'ACH Form Document not found',
          };
        }
      }

      return {
        statusCode: 404,
        message: 'Loan not found or documents not completely signed',
      };
    } catch (error) {
      return {
        statusCode: 400,
        message: error?.message,
      };
    }
  }

  public async getCompletedEnvelopeDoc(loanId: string, res) {
    const loanAg = await this.loanAgreementRepository.findOne({
      select: ['id', 'envelopeStatus', 'completedEnvelopeS3DocKey'],
      where: {
        loanId,
      },
    });

    if (!loanAg || loanAg.envelopeStatus !== EnvelopeStatus.CEO_SIGNED) {
      return {
        statusCode: 400,
        message: 'Loan Aggrement not found or not completely signed',
      };
    }
    try {
      if (loanAg?.completedEnvelopeS3DocKey) {
        await this.downloadDocS3(`${loanAg?.completedEnvelopeS3DocKey}`, res);
        return;
      } else {
        return {
          statusCode: 404,
          message: 'Envelope Document not found',
        };
      }
    } catch (error) {
      return {
        statusCode: 400,
        message: error?.message,
      };
    }
  }

  public async getBorrowerGurarantorDoc(email: string, loanId: string, res) {
    const user = await this.userRepository.findOne({
      select: ['id', 'email'],
      where: {
        email,
      },
    });

    if (!user) {
      return {
        statusCode: 404,
        message: 'User not found',
      };
    }
    const userId = user.id;
    try {
      const exEnvelope = await this.isEnvelopeExist(loanId, userId);
      //@ts-ignore
      const envelopeId = exEnvelope ? exEnvelope?.envelopeId : null;
      const envStatus = exEnvelope ? exEnvelope?.envelopeStatus : null;

      if (envelopeId && envStatus === EnvelopeStatus.CEO_SIGNED) {
        const allPgs = await this.docusignPersonalGuarantorRepository.find({
          select: ['id', 's3DocKey'],
          where: {
            envelopeId,
          },
        });

        if (allPgs?.length > 0) {
          for (const pg of allPgs) {
            if (!pg.s3DocKey) {
              return {
                statusCode: 400,
                message: 'All Personal Guarantor Docs are not available',
              };
            }
          }
          let alreadyCombined = true;
          const prevDocKey = allPgs[0].s3DocKey;
          for (const pg of allPgs) {
            if (pg.s3DocKey !== prevDocKey) {
              alreadyCombined = false;
            }
          }

          if (!alreadyCombined) {
            const allBuffer = [];
            for (const pg of allPgs) {
              const data = await this.downloadDocS3(
                `${pg.s3DocKey}`,
                res,
                true,
              );
              allBuffer.push(data.Body);
            }
            const cb = await this.combinePDFBuffers(allBuffer, res);
            const loanDocKey = `${envelopeId}-all-personal-guarantors.pdf`;
            await this.uploadDocS3(cb, loanDocKey);
            for (const pg of allPgs) {
              await this.deleteDocS3(pg.s3DocKey);
              pg.s3DocKey = loanDocKey;
              await pg.save();
            }
            Readable.from(cb).pipe(res);
            return;
          }
          await this.downloadDocS3(`${prevDocKey}`, res);
          return;
        } else {
          return {
            statusCode: 404,
            message: 'Personal Guarantor Documents not found',
          };
        }
      }

      return {
        statusCode: 404,
        message: 'Loan not found or documents not completely signed',
      };
    } catch (error) {
      return {
        statusCode: 400,
        message: error?.message,
      };
    }
  }

  private async findApprovedLoan(loanId: string): Promise<Loan> {
    const loan = await this.loanRepository.findOne({ id: loanId });

    if (!loan) {
      throw new NotFoundException({ statusCode: 404, message: 'Loan not found' });
    }

    if (loan.statusFlag !== LoanStatus.approved) {
      throw new ConflictException({ statusCode: 409, message: 'Loan not approved yet' });
    }

    return loan;
  }

  private async createDocuSignEnvelopeArgsObject(
    loan: Loan,
    customerUser: UserEntity
  ): Promise<IEnvelopeArgs> {
    const customer = await this.customerRepository.findOne({ loanId: loan.id });
    const envelopeArgsObj: IEnvelopeArgs = {
      borrowerEmail: customerUser.email,
      borrowerName: `${customerUser.firstName} ${customerUser.lastName}`,
      ceoEmail: this.configService.get<string>('OrkaCeoMail'),
      ceoName: this.configService.get<string>('OrkaCeoName'),
      roleName1: 'Main Customer / PG 1',
      roleName2: 'PG 2',
      roleName3: 'PG 3',
      roleName4: 'Orka Signer',
      isAchAuthFormAvailable: false,
      totalAdditionalGuarantor: 0,
      loanAgreementTemplateId: this.configService.get<string>('LOAN_AGREEMENT_TEMPLATE_ID'),
      financingContractDocData: await this.createDocuSignFinancingContractObj(loan, customer),
      borrowerGuarantorTemplateId: this.configService.get<string>('PG1_TEMPLATE_ID'),
      borrowerGuarantorData: this.createDocuSignPersonalGuarantorContractObj(customer, 'owner'),
      orkaCeoContractData: {
        orkaCeoSignature: {
          type: 'SignHere',
          tabLabel: 'Signature_Page__Orka_signature',
        },
        orkaCeoSignedData: {
          type: 'DateSigned',
          tabLabel: 'Signature_Page__Orka_signed_date',
        },
        orkaCeoFullName: {
          type: 'Text',
          tabLabel: 'Signature_Page__Orka_signer_name',
          value: 'Ted Fawcett',
        },
        orkaCeoTitle: {
          type: 'Text',
          tabLabel: 'Signature_Page__Orka_signer_title',
          value: 'CEO',
        },
      },
    };
    
    if (loan.selectedBankAccountId) {
      envelopeArgsObj.isAchAuthFormAvailable = true;
      envelopeArgsObj.achAuthFormTemplateId = this.configService.get<string>('ACH_AUTH_FORM_TEMPLATE_ID');
      envelopeArgsObj.achAuthFormData = await this.createAchContractObj(loan, customer);
    }

    if (customer.owner2 === Flags.Y) {
      envelopeArgsObj.totalAdditionalGuarantor = 1;
      envelopeArgsObj.guarantySignerEmail1 = customer.owner2Email;
      envelopeArgsObj.guarantySignerName1 = `${customer.owner2FirstName} ${customer.owner2LastName}`;
      envelopeArgsObj.additionalGuarantor1TemplateId = this.configService.get<string>('PG2_TEMPLATE_ID');
      envelopeArgsObj.additionalGuarantor1Data = this.createDocuSignPersonalGuarantorContractObj(customer, 'owner2');
    }

    if (customer.owner3 === Flags.Y) {
      envelopeArgsObj.totalAdditionalGuarantor = 2;
      envelopeArgsObj.guarantySignerEmail2 = customer.owner3Email;
      envelopeArgsObj.guarantySignerName2 = `${customer.owner3FirstName} ${customer.owner3LastName}`;
      envelopeArgsObj.additionalGuarantor2TemplateId = this.configService.get<string>('PG3_TEMPLATE_ID');
      envelopeArgsObj.additionalGuarantor1Data = this.createDocuSignPersonalGuarantorContractObj(customer, 'owner3');
    }

    return envelopeArgsObj;
  }

  private async createDocuSignFinancingContractObj(
    loan: Loan,
    customer: CustomerEntity
  ): Promise<IFinancingContractBorrowerData> {
    const partnerAdminUser = await this.userRepository.findOne({ id: loan.insUserId });
    const product = await this.productRepository.findOne({ productId: Number(loan.productId) });
    const lendingLimit = await this.lendingLimitRepository.findOne({
      loanId: loan.id,
      productId: String(product.productId)
    });
    const partner = await this.installerRepository.findOne({ userId: partnerAdminUser.id });
    const [m1Amount, m2Amount, m3Amount] = await this.calculateMilestoneAmounts(
      Number(partner.disbursementSequenceId),
      Number(lendingLimit.financingApproved)
    );
    const [
      checkMonthlyPayment,
      achMonthlyPayment,
      prepayment
    ] = this.calculatePayments(Number(lendingLimit.financingApproved), product);

    const financingContractDataObj: IFinancingContractBorrowerData = {
      borrowerCmpName: {
        type: 'Text',
        tabLabel: 'header__Borrower_(Company)_Name',
        value: customer.legalName
      },
      contractorName: {
        type: 'Text',
        tabLabel: 'header__Contractor_Name',
        value: partner.businessName
      },
      documentNumber: {
        type: 'Text',
        tabLabel: 'header__Document_Number',
        value: `${loan.refNo}.1` // Change the number "1" with the sequence number created for the agreements of that loan when implementing the change order feature
      },
      envelopeCreationDate: {
        type: 'Text',
        tabLabel: 'header__Date',
        value: dayjs(new Date()).format('YYYY-MM-DD'),
      },
      maxLoanAmt: {
        type: 'Text',
        tabLabel: 'Loan_Summary_block__Max_loan_amount',
        value: Number(lendingLimit.financingApproved)
      },
      originationFee: {
        type: 'Text',
        tabLabel: 'Loan_Summary_block__Origination_Fee_%',
        value: Number(product.originationFee)
      },
      interestRate: {
        type: 'Text',
        tabLabel: 'Loan_Summary_block__Interest_rate_%',
        value: Number(loan.interestRate)
      },
      loanTermMonths: {
        type: 'Text',
        tabLabel: 'Loan_Summary_block__Loan_term_months',
        value: Number(loan.financingTermRequested)
      },
      m1Amt: {
        type: 'Text',
        tabLabel: 'Loan_Summary_block__M1_$_amount',
        value: m1Amount
      },
      m2Amt: {
        type: 'Text',
        tabLabel: 'Loan_Summary_block__M2_$_amount',
        value: m2Amount
      },
      m3Amt: {
        type: 'Text',
        tabLabel: 'Loan_Summary_block__M3_$_amount',
        value: m3Amount
      },
      checkMonthlyPmt: {
        type: 'Text',
        tabLabel: 'Loan_Summary_block__Check_monthly_pmt',
        value: checkMonthlyPayment
      },
      achMonthlyPmt: {
        type: 'Text',
        tabLabel: 'Loan_Summary_block__ACH__monthly_pmt',
        value: achMonthlyPayment
      },
      targetPrepay1: {
        type: 'Text',
        tabLabel: 'Loan_Summary_block__Target_prepay_$',
        value: prepayment
      },
      targetPrepay2: {
        type: 'Text',
        tabLabel: 'Loan_Summary_block__Target_prepay_$',
        value: prepayment
      },
      reamortXTimesPerYear: {
        type: 'Text',
        tabLabel: 'Loan_Summary_block__Reamort_x_times_per_year',
        value: Number(product.flexReamMaxAnnualFrequency)
      },
      prepayToReamortDollar: {
        type: 'Text',
        tabLabel: 'Loan_Summary_block__Prepay_to_reamort,_$',
        value: Number(product.flexReamPrepayAmount)
      },
      prepayToReamortPercentage: {
        type: 'Text',
        tabLabel: 'Loan_Summary_block__Prepay_to_reamort,_%',
        value: Number(product.flexReamPrepayPercentofPrincipal)
      },
      projectContractorName: {
        type: 'Text',
        tabLabel: 'Project_Summary_block__Contractor_Name',
        value: partner.businessName
      },
      projectLocation: {
        type: 'Text',
        tabLabel: 'Project_Summary_block__Project_location_(address)',
        value: customer.businessInstallAddress
      },
      moduleMfg: {
        type: 'Text',
        tabLabel: 'Project_Summary_block__Module__mfg',
        value: customer.panelManufacturer
      },
      inverterMfg: {
        type: 'Text',
        tabLabel: 'Project_Summary_block__Inverter__mfg',
        value: customer.inverterManufacturer
      },
      batteryMfg: {
        type: 'Text',
        tabLabel: 'Project_Summary_block__Battery__mfg',
        value: customer.batteryManufacturer
      },
      totalInstallmentContract: {
        type: 'Text',
        tabLabel: 'Project_Summary_block__Total_Installation_Contract_$',
        value: Number(customer.totalProjectCost)
      },
      optionalTargetPrepay: {
        type: 'Text',
        tabLabel: 'Optional_Prepayments_paragraph__Target_prepay_$',
        value: prepayment
      },
      optionalReamortXTimesPerYear: {
        type: 'Text',
        tabLabel: 'Optional_Prepayments_paragraph__Remort_x_times_per_year',
        value: Number(product.flexReamMaxAnnualFrequency)
      },
      optionalPrepayToReamortDollar: {
        type: 'Text',
        tabLabel: 'Optional_Prepayments_paragraph__Prepay_to_reamort,_$',
        value: Number(product.flexReamPrepayAmount)
      },
      optionalPrepayToReamortPercentage: {
        type: 'Text',
        tabLabel: 'Optional_Prepayments_paragraph__Prepay_to_reamort,_%',
        value: Number(product.flexReamPrepayPercentofPrincipal)
      },
      signedBorrowerCmpName: {
        type: 'Text',
        tabLabel: 'Signature_Page__Borrower_(Company)_Name',
        value: customer.legalName
      },
      customerSignature: {
        type: 'SignHere',
        tabLabel: 'Signature_Page__Customer_signature',
      },
      customerSignedDate: {
        type: 'DateSigned',
        tabLabel: 'Signature_Page__Customer_signed_date',
      },
      customerSignerName: {
        type: 'Text',
        tabLabel: 'Signature_Page__Customer_signer_name',
        value: `${customer.ownerFirstName} ${customer.ownerLastName}`
      },
      customerSignerTitle: {
        type: 'Text',
        tabLabel: 'Signature_Page__Customer_signer_title',
        value: customer.ownerProfessionalTitle
      },
      additionalGuarantor1Placeholder: {
        type: 'Text',
        tabLabel: 'blank placeholder for doc vis',
        value: '',
      },
      additionalGuarantor2Placeholder: {
        type: 'Text',
        tabLabel: 'blank placeholder for doc vis',
        value: '',
      }
    };

    return financingContractDataObj;
  }

  private async findCeoUser(requestUserEmail: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({ email: requestUserEmail, delete_flag: Flags.N });

    if (!user) {
      throw new NotFoundException({ statusCode: 409, message: 'User not found' });
    }

    if (
      user.email !== this.configService.get<string>('OrkaCeoMail') ||
      `${user.firstName} ${user.lastName}` !== this.configService.get<string>('OrkaCeoName')
    ) {
      throw new ConflictException({ statusCode: 409, message: `Only ORKA's CEO can countersign loan agreements` });
    }

    return user;
  }

  private async findLoanAgreement(loanId: string): Promise<LoanAgreementEntity> {
    const loanAgreement = await this.loanAgreementRepository.findOne({ loanId });

    if (!loanAgreement) {
      throw new NotFoundException({ statusCode: 404, message: 'Loan Envelope not found' });
    }

    return loanAgreement;
  }

  private async calculateMilestoneAmounts(
    disbursementSequenceId: number,
    loanAmount: number
  ): Promise<[number, number, number]> {
    const disbursementSequence = await this.disbursementRepository.findOne({
      ref_no: disbursementSequenceId
    });
    const m1PercentageInDecimalForm = Number(disbursementSequence.m1_percent) / 100;
    const m2PercentageInDecimalForm = Number(disbursementSequence.m2_percent) / 100;
    const m3PercentageInDecimalForm = Number(disbursementSequence.m3_percent) / 100;
    const m1Amount = Number(
      (loanAmount * m1PercentageInDecimalForm).toFixed(2)
    );
    const m2Amount = Number(
      (
        (loanAmount * (m1PercentageInDecimalForm + m2PercentageInDecimalForm)) - m1Amount
      ).toFixed(2)
    );
    const m3Amount = (loanAmount * (m1PercentageInDecimalForm + m2PercentageInDecimalForm + m3PercentageInDecimalForm)) - m1Amount - m2Amount;

    return [m1Amount, m2Amount, m3Amount];
  }

  private calculatePayments(loanAmount: number, product: ProductEntity): [number, number, number] {
    const checkMonthlyPayment = Number((loanAmount * Number(product.mpfCheckWItcPrepay) / 100).toFixed(2));
    const achMonthlyPayment = Number((loanAmount * Number(product.mpfAchWItcPrepay) / 100).toFixed(2));
    const prepayment = Number((loanAmount * Number(product.prepayment) / 100).toFixed(2));

    return [checkMonthlyPayment, achMonthlyPayment, prepayment];
  }

  private createDocuSignPersonalGuarantorContractObj(
    customer: CustomerEntity,
    owner: 'owner' | 'owner2' | 'owner3'
  ): IPersonalGuarantor {
    const personalGuarantorContractObj: IPersonalGuarantor = {
      envelopeCreationDate: {
        type: 'Text',
        tabLabel: 'intro__date',
        value: dayjs(new Date()).format('YYYY-MM-DD'),
      },
      guarantorName: {
        type: 'Text',
        tabLabel: 'intro__Guarantor_name',
        value: `${customer[`${owner}FirstName`]} ${customer[`${owner}LastName`]}`
      },
      envelopeCreationDate2: {
        type: 'Text',
        tabLabel: 'intro__date',
        value: dayjs(new Date()).format('YYYY-MM-DD'),
      },
      borrowerCmpName: {
        type: 'Text',
        tabLabel: 'intro__Borrower_(Company)_Name',
        value: customer.legalName
      },
      guarantorSignature: {
        type: 'SignHere',
        tabLabel: 'signing_block__Guarantor_signature',
      },
      guarantorSignedDate: {
        type: 'DateSigned',
        tabLabel: 'signing_block__Guarantor_signed_date',
      },
      guarantorName2: {
        type: 'Text',
        tabLabel: 'signing_block__Guarantor_name',
        value: `${customer[`${owner}FirstName`]} ${customer[`${owner}LastName`]}`
      },
      guarantorAddress: {
        type: 'Text',
        tabLabel: 'signing_block__Guarantor_Address',
        value: `${customer[`${owner}Address`]}`
      },
      guarantorPhone: {
        type: 'Text',
        tabLabel: 'signing_block__Guarantor_phone',
        value: `${customer[`${owner}Phone`]}`
      },
      guarantorEmail: {
        type: 'Text',
        tabLabel: 'signing_block__Guarantor_email',
        value: `${customer[`${owner}Email`] || customer.email}`
      },
      ceoPlaceholder: {
        type: 'Text',
        tabLabel: 'blank placeholder for doc vis',
        value: '',
      },
    };

    return personalGuarantorContractObj;
  }

  private async createAchContractObj(
    loan: Loan,
    customer: CustomerEntity
  ): Promise<IAchAuthForm> {
    const selectedBankAccount = await this.getSelectedBankAccountInfo(loan);
    const achContractObj: IAchAuthForm = {
      customerName: {
        type: 'Text',
        tabLabel: 'top__Customer_Name',
        value: `${customer.ownerFirstName} ${customer.ownerLastName}`
      },
      documentNumber: {
        type: 'Text',
        tabLabel: 'top__Document_Number',
        value: selectedBankAccount.accountNumber
      },
      nameOnAccount: {
        type: 'Text',
        tabLabel: 'account_info__Name_on_account',
        value: selectedBankAccount.nameOnAccount
      },
      bankAccNo: {
        type: 'Text',
        tabLabel: 'account_info__Bank_Account_#',
        value: selectedBankAccount.accountNumber
      },
      abaNo: {
        type: 'Text',
        tabLabel: 'account_info__ABA_Number',
        value: selectedBankAccount.routingNumber
      },
      bankName: {
        type: 'Text',
        tabLabel: 'account_info__Bank_Name',
        value: selectedBankAccount.bankName
      },
      bankCity: {
        type: 'Text',
        tabLabel: 'account_info__Bank_City',
        value: selectedBankAccount.bankCity
      },
      bankState: {
        type: 'Text',
        tabLabel: 'account_info__Bank_State',
        value: selectedBankAccount.bankState
      },
      bankZip: {
        type: 'Text',
        tabLabel: 'account_info__Bank_Zip_',
        value: selectedBankAccount.bankZipCode
      },
      accountType: {
        type: 'Text',
        tabLabel: 'account_info__Account_Type',
        value: selectedBankAccount.accountType
      },
      customerSignature: {
        type: 'SignHere',
        tabLabel: 'signing_block__Customer_signature',
      },
      customerName1: {
        type: 'Text',
        tabLabel: 'signing_block__Customer_Name',
        value: `${customer.ownerFirstName} ${customer.ownerLastName}`
      },
      customerSignedDate: {
        type: 'DateSigned',
        tabLabel: 'signing_block__Customer_signed_date',
      },
      ceoPlaceholder: {
        type: 'Text',
        tabLabel: 'blank placeholder for doc vis',
        value: '',
      },
    };

    return achContractObj;
  }

  private async getSelectedBankAccountInfo(loan: Loan): Promise<SelectedBankAccountInfo> {
    const customerBank = await this.plaidMasterRepository.findOne({ loan_id: loan.id });
    const plaidBankAccount = await this.bankAccountRepository.findOne({ id: loan.selectedBankAccountId });
    let plaidBankAccountAdditionalInformation: PlaidAuthEntity;
    let manuallyInputedBankAccount: UserBankAccount;

    if (plaidBankAccount) {
      plaidBankAccountAdditionalInformation = await this.plaidAuthRepository.findOne({ plaidAccountId: plaidBankAccount.plaidAccountId });
    } else {
      manuallyInputedBankAccount = await this.userBankAccountRepository.findOne({ id: loan.selectedBankAccountId });
    }

    return {
      accountNumber: plaidBankAccountAdditionalInformation?.accountNumber || manuallyInputedBankAccount.accountNumber,
      accountType: plaidBankAccount?.subtype || manuallyInputedBankAccount.accountType,
      bankName: customerBank.institutionName || manuallyInputedBankAccount.bankName,
      bankCity: manuallyInputedBankAccount?.bankCity,
      bankState: manuallyInputedBankAccount?.bankState,
      bankZipCode: manuallyInputedBankAccount?.bankZipCode,
      nameOnAccount: customerBank.bankHolderName || manuallyInputedBankAccount.holderName,
      routingNumber: plaidBankAccount?.routing || manuallyInputedBankAccount.routingNumber
    };
  }

  private async persistEnvelopeData(
    loan: Loan,
    envelopeArgs: IEnvelopeArgs,
    envelopeId: string
  ): Promise<void> {
    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    await this.persistLoanAgreement(
      loan,
      envelopeArgs,
      envelopeId,
      queryRunner
    );
    await this.persistDocuSignEnvelopeTemplateData(
      envelopeId,
      envelopeArgs.financingContractDocData,
      new DocusignFinancingContractEntity(),
      queryRunner
    );
    await this.persistDocuSignEnvelopeTemplateData(
      envelopeId,
      envelopeArgs.borrowerGuarantorData,
      new DocusignPersonalGuarantorEntity(),
      queryRunner
    );

    if (envelopeArgs.isAchAuthFormAvailable) {
      await this.persistDocuSignEnvelopeTemplateData(
        envelopeId,
        envelopeArgs.achAuthFormData,
        new DocusignAchFormEntity(),
        queryRunner
      )
    }

    if (envelopeArgs.additionalGuarantor1Data) {
      await this.persistDocuSignEnvelopeTemplateData(
        envelopeId,
        envelopeArgs.additionalGuarantor1Data,
        new DocusignPersonalGuarantorEntity(),
        queryRunner
      )
    }

    if (envelopeArgs.additionalGuarantor2Data) {
      await this.persistDocuSignEnvelopeTemplateData(
        envelopeId,
        envelopeArgs.additionalGuarantor2Data,
        new DocusignPersonalGuarantorEntity(),
        queryRunner
      )
    }

    await queryRunner.commitTransaction();
  }

  // private async changeLoanPhaseToContracting(loan: Loan): Promise<void> {
  //   loan.phaseFlag = PhaseFlag.contracting;

  //   await this.loanRepository.save(loan);
  // }

  private async persistLoanAgreement(
    loan: Loan,
    envelopeArgs: IEnvelopeArgs,
    envelopeId: string,
    queryRunner: QueryRunner
  ): Promise<void> {
    const loanAgreement = new LoanAgreementEntity();

    loanAgreement.loanId = loan.id;
    loanAgreement.userId = loan.user_id;
    loanAgreement.envelopeId = envelopeId;
    loanAgreement.isAchAuthFormAvailable = envelopeArgs.isAchAuthFormAvailable;
    loanAgreement.totalAdditionalGuarantors = envelopeArgs.totalAdditionalGuarantor;
    loanAgreement.documentNumber = `${loan.refNo}.1`; // Change the number "1" with the sequence number created for the agreements of that loan when implementing the change order feature

    await queryRunner.manager.save(loanAgreement);
  }

  private async persistDocuSignEnvelopeTemplateData(
    envelopeId: string,
    templateData: IFinancingContractBorrowerData | IPersonalGuarantor | IAchAuthForm,
    entity: DocusignFinancingContractEntity | DocusignAchFormEntity | DocusignPersonalGuarantorEntity,
    queryRunner: QueryRunner
  ): Promise<void> {
    for (const [key, value] of Object.entries(templateData)) {
      const typedValue = value as docusignStringField | docusignNumberField | docusignWithoutValue

      if (typedValue.type === 'Text') {
        entity[key] = (typedValue as docusignStringField).value;
      }
    }

    entity.envelopeId = envelopeId;
    
    await queryRunner.manager.save(entity);
  }

  private async isEnvelopeExist(loanId: string, userId?: string) {
    const result = await this.loanAgreementRepository.findOne({
      select: ['envelopeId', 'id', 'envelopeStatus'],
      where: {
        loanId,
        userId,
      },
    });

    return result ? result : false;
  }

  private async saveCeoWebhookData(
    args: any,
    envelopeId: any,
    signers: any,
    exEnvelope: any,
    documentId: number,
    signerNo: number,
  ) {
    args['documentId'] = documentId;
    const result = await this.docusignService.getEnvelopeDocPdf(args);
    const buffer = Buffer.from(result, 'binary');
    const loanDocKey = `${envelopeId}-financing-contract.pdf`;
    await this.uploadDocS3(buffer, loanDocKey);
    const res11 = await this.docusignService.getEnvelopeCompletePdf(
      envelopeId,
      args.accessToken,
    );
    const buffer1 = Buffer.from(res11, 'binary');
    let loanDocKey1 = `${envelopeId}-final.pdf`;
    await this.uploadDocS3(buffer1, loanDocKey1);
    await this.docusignFinancingContractRepository.update(
      {
        envelopeId,
      },
      {
        s3DocKey: loanDocKey,
        orkaCeoSigned: true,
        orkaCeoSignedDate: signers[signerNo]['signedDateTime'],
        orkaCeoRecipientIdGuid: signers[signerNo]['recipientIdGuid'],
      },
    );

    exEnvelope.completedEnvelopeS3DocKey = loanDocKey1;
    exEnvelope.envelopeStatus = EnvelopeStatus.CEO_SIGNED;
    await this.loanAgreementRepository.save(exEnvelope);
  }

  private async uploadDocS3(file, fileName: string) {
    const bucketName = process.env.STAGING_URL;
    const params = {
      Bucket: bucketName,
      Key: fileName,
      Body: file,
    };
    try {
      const stored = await this.s3.upload(params).promise();
      return stored;
    } catch (err) {
      console.log(err);
    }
  }

  private async deleteDocS3(fileName: string) {
    const bucketName = process.env.STAGING_URL;
    const params = {
      Bucket: bucketName,
      Key: fileName,
    };
    try {
      const stored = await this.s3.deleteObject(params).promise();
      return stored;
    } catch (err) {
      console.log(err);
    }
  }

  private async downloadDocS3(fileName: string, res: Response, binary = false) {
    const bucketName = process.env.STAGING_URL;

    const params = {
      Bucket: bucketName,
      Key: fileName,
    };
    if (binary) {
      const data = await this.s3.getObject(params).promise();
      return data;
    }

    this.s3.getObject(params, function(err, data) {
      if (err) {
        return {
          success: false,
          error: err,
          msg: 'Error in downloading file',
        };
      }
      const stream = this.s3
        .getObject(params)
        .createReadStream()
        .pipe(res);
    });
  }

  private async combinePDFBuffers(allBuffers: Buffer[], res: any) {
    const outStream = new memoryStreams.WritableStream();

    try {
      const bufferPDFStream = [];
      for (const buffer of allBuffers) {
        const pdfStream = new hummus.PDFRStreamForBuffer(buffer);
        bufferPDFStream.push(pdfStream);
      }
      if (bufferPDFStream.length > 0) {
        const pdfWriter = hummus.createWriterToModify(
          bufferPDFStream[0],
          new hummus.PDFStreamForResponse(outStream),
        );
        for (let i = 1; i < bufferPDFStream.length; i++) {
          pdfWriter.appendPDFPagesFromPDF(bufferPDFStream[i]);
        }
        pdfWriter.end();
        const newBuffer = outStream.toBuffer();
        outStream.end();
        return newBuffer;
      }
    } catch (e) {
      outStream.end();
      throw new Error('Error during PDF combination: ' + e.message);
    }
  }

  async getDocusigndatesubmitted(id) {
        const entityManager = getManager();
        try{
            let data = await entityManager.query(`select t2."updatedAt" as achdate,t3."updatedAt" as financingdate,t4."updatedAt" as pgdate from tblloanagreement t 
            left join tbldocusignachform t2 on t2."envelopeId" =t."envelopeId" 
            left join tbldocusignfinancingcontract t3 on t3."envelopeId" =t."envelopeId" 
            left join tbldocusignpersonalguarantor t4 on t4."envelopeId" = t."envelopeId" 
            where t."loanId"='${id}' and t."envelopeStatus" ='CEO_SIGNED' order by t."updatedAt" desc`)
            return {
                statusCode:200,
                data,
            }
        }
        catch(error)
        {
            console.log(error)
            let resp = new InternalServerErrorException(error).getResponse();
            if (Object.keys(resp).includes('name'))
                resp = Object.values(resp)[Object.keys(resp).indexOf('name')];
            return {
                statusCode: 500,
                message: [resp],
                error: 'Bad Request',
            };
        }
  }
}
