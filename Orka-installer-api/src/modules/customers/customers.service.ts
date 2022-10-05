import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FilesEntity } from 'src/entities/files.entity';
import { InstallingInfo, InstallingStatusFlags } from 'src/entities/installingInfo.entity';
import { SystemInfo } from 'src/entities/systemInfo.entity';
import { Notification } from 'src/entities/notification.entity';
import { FilesRepository } from 'src/repository/files.repository';
import { InstallingInfoRepository } from 'src/repository/installingInfo.repository';
import { LoanRepository } from 'src/repository/loan.repository';
import { SystemInfoRepository } from 'src/repository/systemInfo.repository';
import { getManager } from 'typeorm';
import { CreateUploadDto } from './dto/createUpload.dto';
import { Milestone1ReqDto, Milestone2ReqDto, Milestone3ReqDto } from './dto/installingInfo.dto';
import { SystemInfoDto } from './dto/systemInfo.dto';
import { NotificationRepository } from 'src/repository/notification.repository';
import { CustomerRepository } from 'src/repository/customer.repository';

@Injectable()
export class CustomersService {

    constructor(
        @InjectRepository(FilesRepository) private readonly filesRepository: FilesRepository,
        @InjectRepository(LoanRepository) private readonly loanRepository: LoanRepository,
        @InjectRepository(SystemInfoRepository) private readonly systemInfoRepository: SystemInfoRepository,
        @InjectRepository(InstallingInfoRepository) private readonly installingInfoRepository: InstallingInfoRepository,
        @InjectRepository(NotificationRepository) private readonly notificationRepository: NotificationRepository,
        @InjectRepository(CustomerRepository) private readonly customerRepository: CustomerRepository,
    ){

    }

    async getApplicationsList(id){
        const entityManager = getManager();
        try{            
            let data = {}  
            data['applicationsList'] = await entityManager.query(`select c.*, ii.status, l.ref_no  as loan_ref from tblloan l join tblcustomer c on l.id = c.loan_id left join tblinstallinginfo ii on ii.loan_id = l.id where l.status_flag='approved' and l.ins_user_id='${id}' and l.delete_flag='N'`)          
            return {"statusCode": 200, data:data };            
        }catch(error){
            return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
        }
    }

    async getApplicationDetails(id){
        const entityManager = getManager();
        try{            
            let data = {}  
            data['applicationDetails'] = await entityManager.query("select c.*, ii.status from tblloan l join tblcustomer c on l.id = c.loan_id left join tblinstallinginfo ii on ii.loan_id = l.id where l.status_flag='approved' and l.delete_flag='N' and l.id='"+id+"'");          
            data['creditedPaymentDetails'] = await entityManager.query(`select * from tblpaymentmanagement where loan_id='${id}' and status='PAID' order by "createdAt" asc`);
            data['totalCreditedPayment'] = await entityManager.query(`select sum("fundedAmount") as totalLoanPayment from tblpaymentmanagement where loan_id='${id}' and status='PAID'`);
            return {"statusCode": 200, data:data };            
        }catch(error){
            return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
        }
    }

    async customerFileUpload(files,createUploadDto: CreateUploadDto){
        let filedata = [];
        for (let i = 0; i < files.length; i++) {
            let file:FilesEntity = new FilesEntity();
            file.originalname = files[i].originalname;
            file.filename = files[i].filename;
            file.services = 'installer/fileUpload';
            file.link_id = createUploadDto.loan_id;
            filedata.push(file)
        }
        let installinfo = new InstallingInfo()
        installinfo.status = InstallingStatusFlags.documentsUploaded;
        installinfo.loan_id = createUploadDto.loan_id;
        installinfo.user_id = createUploadDto.user_id;
        try{
            await this.filesRepository.save(filedata);
            await this.installingInfoRepository.save(installinfo)
            return { "statusCode": 200, "Loan_ID": createUploadDto.loan_id}

        } catch (error) {
            console.log(error)
            return { "statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request" };
        }
    }

    async systemInfoAdd(systemInfoDto: SystemInfoDto) {
        try{
            let systemInfo = new SystemInfo();
            systemInfo.moduleManufacturer = systemInfoDto.moduleManufacturer;
            systemInfo.inverterManufacturer = systemInfoDto.inverterManufacturer
            systemInfo.batteryManufacturer = systemInfoDto.batteryManufacturer
            systemInfo.systemSize = systemInfoDto.systemSize
            systemInfo.estAnnualProduction = systemInfoDto.estAnnualProduction
            systemInfo.signature = systemInfoDto.signature
            systemInfo.user_id = systemInfoDto.user_id
            systemInfo.loan_id = systemInfoDto.loan_id

           
            

            await this.systemInfoRepository.save(systemInfo)
            await this.installingInfoRepository.update({loan_id: systemInfoDto.loan_id},{
                status: InstallingStatusFlags.verifiedAndApproved
            })
            return {"statusCode": 200}    
        } catch (error) {
          console.log(error)
          return { "statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request" };
        }
    }

    getamount(data){
        return Number(data.replace(",","").replace("$",""))
      }

    async milestone1Req(files, milestone1ReqDto: Milestone1ReqDto) {
        let filedata = [];
        for (let i = 0; i < files.length; i++) {
            let file:FilesEntity = new FilesEntity();
            file.originalname = files[i].originalname;
            file.filename = files[i].filename;
            file.services = 'installer/milestone1Req';
            file.link_id = milestone1ReqDto.loan_id;
            filedata.push(file)
        }
        try{
            let amount = this.getamount(milestone1ReqDto.milestone1ReqAmount)
            if(typeof amount != 'number'){
                return {"statusCode": 500, "message": ['Invalid amount'], "error": "Bad Request"};
            }

            this.savenotification("Milestone Request","Milestone 1 - Amount : "+amount,"admin/funded-contracts/"+milestone1ReqDto.loan_id)
            await this.filesRepository.save(filedata);
            await this.installingInfoRepository.update({loan_id: milestone1ReqDto.loan_id},{
                status: InstallingStatusFlags.milestone1Completed,
                milestone1ReqAmount:amount,
                milestone1signature:milestone1ReqDto.signature
            })
            return {"statusCode": 200}    
        } catch (error) {
          console.log(error)
          return { "statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request" };
        }
    }

    async milestone2Req(files, milestone2ReqDto: Milestone2ReqDto) {
        let filedata = [];
        for (let i = 0; i < files.length; i++) {
            let file:FilesEntity = new FilesEntity();
            file.originalname = files[i].originalname;
            file.filename = files[i].filename;
            file.services = 'installer/milestone2Req';
            file.link_id = milestone2ReqDto.loan_id;
            filedata.push(file)
        }
        try{
            let amount = this.getamount(milestone2ReqDto.milestone2ReqAmount)
            if(typeof amount != 'number'){
                return {"statusCode": 500, "message": ['Invalid amount'], "error": "Bad Request"};
            }
            let verfiy:any = true;
            if(milestone2ReqDto.verifiedInstAddress=='true'){
                verfiy = true;
            }else if(milestone2ReqDto.verifiedInstAddress=='false'){
                verfiy = false;
            }else{
                return {"statusCode": 500, "message": ['Bad Request'], "error": "Bad Request"};
            }
            this.savenotification("Milestone Request","Milestone 2 - Amount : "+amount,"admin/funded-contracts/"+milestone2ReqDto.loan_id)
            await this.filesRepository.save(filedata);
            await this.installingInfoRepository.update({loan_id: milestone2ReqDto.loan_id},{
                status: InstallingStatusFlags.milestone2Completed,
                milestone2ReqAmount:amount,
                milestone2signature:milestone2ReqDto.signature,
                projectCompletedAt: milestone2ReqDto.projectCompletedAt,
                verifiedInstAddress: verfiy
            })
            return {"statusCode": 200}    
        } catch (error) {
          console.log(error)
          return { "statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request" };
        }
    }

    async milestone3Req(files, milestone3ReqDto: Milestone3ReqDto) {
        let filedata = [];
        for (let i = 0; i < files.length; i++) {
            let file:FilesEntity = new FilesEntity();
            file.originalname = files[i].originalname;
            file.filename = files[i].filename;
            file.services = 'installer/milestone3Req';
            file.link_id = milestone3ReqDto.loan_id;
            filedata.push(file)
        }
        try{
            let amount = this.getamount(milestone3ReqDto.milestone3ReqAmount)
            if(typeof amount != 'number'){
                return {"statusCode": 500, "message": ['Invalid amount'], "error": "Bad Request"};
            }
            this.savenotification("Milestone Request","Milestone 3 - Amount : "+amount,"admin/funded-contracts/"+milestone3ReqDto.loan_id)
            await this.installingInfoRepository.update({loan_id: milestone3ReqDto.loan_id},{
                milestone3ReqAmount: amount,
                milestone3signature:milestone3ReqDto.signature,
                status:InstallingStatusFlags.milestone3Completed
            })
            await this.filesRepository.save(filedata);
            return {"statusCode": 200}    
        } catch (error) {
          console.log(error)
          return { "statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request" };
        }
    }

    async getProjectDetails(id){
        const entityManager = getManager();
        try{            
            let data = {}  
            data['systemInfoVerified'] = await this.systemInfoRepository.findOne({select:['createdAt'], where:{loan_id:id}})
            data['projectDocuments'] = await entityManager.query(`select services, originalname, filename, "createdAt" from tblfiles where link_id = '${id}' and services in ('installer/fileUpload','installer/milestone1Req','installer/milestone2Req','installer/milestone3Req') and delete_flag = 'N' order by "createdAt" asc `)
            return {"statusCode": 200, data:data };            
        }catch(error){
            return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
        }
    } 
    
    async approveApplication(id){
        try{            
            await this.installingInfoRepository.update({loan_id: id},{
                status: InstallingStatusFlags.projectCompleted,
                approvedAt: new Date()
            })
            return {"statusCode": 200};            
        }catch(error){
            return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
        }
    } 

    async getFileUploaded(id){
        const entityManager = getManager();
        try{            
            let data = {}              
            data['fileUploadedDetails'] = await entityManager.query("select * from tblfiles where link_id='"+id+"' and services='installer/fileUpload'")
            return {"statusCode": 200, data:data };            
        }catch(error){
            return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
        }
    }

    async getSystemInfo(id){
        const entityManager = getManager();
        try{            
            let data = {}              
            data['systemInfoDetails'] = await entityManager.query("select * from tblsysteminfo where user_id='"+id)
            return {"statusCode": 200, data:data };            
        }catch(error){
            return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
        }
    }

    async deleteFileUploaded(fileId){
        const entityManager = getManager();
        try{            
            let data = {}              
            data['fileUploadedDetails'] = await entityManager.query("delete from tblfiles where id='"+fileId+"'")
            return {"statusCode": 200};            
        }catch(error){
            return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
        }
    }


    async savenotification(title,msg, link){
        let noti = new Notification()
        noti.title = title;
        noti.message = msg;
        noti.link = link;
        await this.notificationRepository.save(noti)
    }

    async installInfo(id){
        try{           
            let data = {}
            data['customerDetails'] = await this.customerRepository.findOne({select:['loanId'],where:{loan_id: id}});
            data['ownershipFiles'] = await this.filesRepository.find({where:{link_id: id, services: 'installer/fileUpload', delete_flag:'N'}});
            data['systemInfo'] = await this.systemInfoRepository.findOne({where:{loan_id: id}});
            data['installingInfo'] = await this.installingInfoRepository.findOne({where:{loan_id: id}});
            data['milestone1ReqFiles'] = await this.filesRepository.find({where:{link_id: id, services: 'installer/milestone1Req', delete_flag:'N'}});
            data['milestone2ReqFiles'] = await this.filesRepository.find({where:{link_id: id, services: 'installer/milestone2Req', delete_flag:'N'}});
            data['milestone3ReqFiles'] = await this.filesRepository.find({where:{link_id: id, services: 'installer/milestone3Req', delete_flag:'N'}});
            return {"statusCode": 200, data:data };            
        }catch(error){
            return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
        }
    }
}
