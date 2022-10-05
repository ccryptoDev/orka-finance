import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { EditProfileDto } from './dto/add.dto';
import * as bcrypt from 'bcrypt';
import { MailService } from '../../mail/mail.service';
import { config } from 'dotenv';
import { UserEntity, Flags } from '../../entities/users.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from '../../repository/users.repository';
import { InstallerRepository } from '../../repository/installer.repository';
import { Installer } from '../../entities/installer.entity';
import { getManager } from 'typeorm';
import { EditInstallerProfileDto } from './dto/edit.dto';
import {AddExistingDto} from './dto/add-existing.dto'

config()
@Injectable()
export class InstallerService {//add
  constructor(
    @InjectRepository(UserRepository) private readonly userRepository: UserRepository,
    @InjectRepository(InstallerRepository) private readonly installerRepository: InstallerRepository,
    private readonly mailService: MailService
  ) { }

  async add(editProfileDto: EditProfileDto) {
    try {
      let url: any = process.env.OrkaUrl
      url = url + "partner/login"

      const user = new UserEntity();
      // user.email = editProfileDto.email;
      user.firstName = editProfileDto.firstName;
      user.lastName = editProfileDto.lastName;
      user.email = editProfileDto.businessEmail;
      // user.firstName = editProfileDto.firstName;
      // user.businessShortName = editProfileDto.businessShortName;

      const entityManager = getManager();
      let installer_role_id = await entityManager.query(`select id from tblroles where "name" = 'installer' order by id asc limit 1`);
      user.role = installer_role_id[0].id

      var length = 8,
        charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        password = "";
      for (var i = 0, n = charset.length; i < length; ++i) {
        password += charset.charAt(Math.floor(Math.random() * n));
      }

      user.salt = await bcrypt.genSalt();
      user.password = await bcrypt.hash(password, user.salt);
      user.active_flag = Flags.Y;
      user.emailVerify = Flags.N;

      // let users:any = await this.userRepository.find( {select:["email"], where:{delete_flag:'N',email:user.email,role:user.role}});
      let users: any = await this.userRepository.find({ select: ["email"], where: { delete_flag: 'N', email: user.email, role: user.role } });
      if (users.length > 0) {
        return { "statusCode": 400, "message": ["This Email Already Exists"], "error": "Bad Request" }
      }

      let userid: any = await this.userRepository.save(user)
      userid = userid.id
      let installer = new Installer();

      installer.user_id = userid,
        installer.firstName = editProfileDto.firstName
        installer.lastName = editProfileDto.lastName
        // installer.birthday = editProfileDto.birthday
      installer.businessName = editProfileDto.businessName
      installer.businessShortName = editProfileDto.businessShortName
      installer.businessEmail = editProfileDto.businessEmail
      installer.businessPhone = editProfileDto.businessPhone
      installer.businessAddress = editProfileDto.businessAddress
      // installer.unit = editProfileDto.unit
      installer.city = editProfileDto.city
      installer.state = editProfileDto.state
      installer.zipCode = editProfileDto.zipCode

      await this.installerRepository.save(installer);
      this.mailService.add(user.email, password, url, user.firstName)
      return { "statusCode": 200 }

    } catch (error) {
      console.log(error)
      return { "statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request" };
    }
  }

  async getSpecific(id:string)
  {
    const entityManager = getManager();
    try{
      const rawData = await entityManager.query(`select ref_no, id,email,"firstName","lastName" from tbluser where "mainInstallerId" ='${id}'`)
      return {"statusCode":200, data:rawData}
    }catch(error)
    {
      return { "statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request" };
    }
  }

  async addExisting(addExistingDto:AddExistingDto){
    try{
    let url: any = process.env.OrkaUrl
      url = url + "partner/login";

      let resetlink = process.env.OrkaUrl;
          resetlink = resetlink + "partner/forgot-password"
      const user = new UserEntity();
      
      user.email = addExistingDto.userEmail;
      user.firstName = addExistingDto.firstName;
      user.lastName = addExistingDto.lastName;


      //role will be changed based on role selected from frontend
      const entityManager = getManager();
      let installer_role_id = await entityManager.query(`select id from tblroles where "name" = 'installer' order by id asc limit 1`);
      
      user.role = installer_role_id[0].id

      //getting the main Installer Id with the help of businessShortName which is unique
      let main_installer_id = await entityManager.query(`select user_id from tblinstaller where "businessShortName"='${addExistingDto.businessShortName}'`)
      user.mainInstallerId = main_installer_id[0].user_id;

      var length = 8,
        charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        password = "";
      for (var i = 0, n = charset.length; i < length; ++i) {
        password += charset.charAt(Math.floor(Math.random() * n));
      }

      user.salt = await bcrypt.genSalt();
      user.password = await bcrypt.hash(password, user.salt);
      user.active_flag = Flags.Y;
      user.emailVerify = Flags.N;

      // find whether the user is already exist or not
      let users: any = await this.userRepository.find({ select: ["email"], where: { delete_flag: 'N', email: user.email, role: user.role } });
      if (users.length > 0) {
        return { "statusCode": 400, "message": ["This Email Already Exists"], "error": "Bad Request" }
      }

      let userid: any = await this.userRepository.save(user)
      userid = userid.id;
      const data={
        "partnerOwnerFname":user.firstName,
        "email":user.email,
        "pass":password,
        "url":url,
        "resetLink":resetlink
      }
      
      this.mailService.partneradminUserMail(user.email, data)
      return { "statusCode": 200, "message":["User Added Successfully"]}

      } catch (error) {
      console.log(error)
      return { "statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request" };
    }
  }


  async get() {
    const entityManager = getManager();
    try {
      const rawData = await entityManager.query(`
      select t2.id as user_id, t2.active_flag as active_flag, t2."firstName" ,t2."lastName",t."businessName",
      t."businessEmail",t."businessShortName"  from tblinstaller t 
      left join tbluser t2 on t2.id=t.user_id where t2.delete_flag = 'N'  order by t."createdAt" desc `);
      //console.log(rawData)
      return { "statusCode": 200, data: rawData };
    } catch (error) {
      return { "statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request" };
    }
  }

  

  async getEditDetails(id) {
    const entityManager = getManager();
    try {
      const rawData = await entityManager.query(` select t2.id as user_id, t2.active_flag as active_flag,t2."firstName" , t2."lastName" , 
      t."businessPhone" ,t."businessShortName" ,t."businessEmail" ,t."businessAddress",t2."createdAt" ,
      t.city , t.state ,t."zipCode" , t."businessName"
      from tblinstaller t join tbluser t2 on t2.id=t.user_id 
      where t2.delete_flag = 'N' and t2.id = '${id}'`);
      
      const disbursement = await entityManager.query(`select * from tbldisbsequence where status='ACTIVE'`);

      return { "statusCode": 200, data: rawData,disbursement };
    } catch (error) {
      console.log(error)
      return { "statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request" };
    }
  }

  async putEditDetails(editInstallerProfileDto: EditInstallerProfileDto) {
    console.log("get", editInstallerProfileDto);
    try {
      const installerInfo: any = await this.installerRepository.update({user_id: editInstallerProfileDto.user_id},
        {
          firstName : editInstallerProfileDto.firstName,
          lastName : editInstallerProfileDto.lastName,
          businessName: editInstallerProfileDto.businessName,
          businessShortName: editInstallerProfileDto.businessShortName,
          businessAddress: editInstallerProfileDto.businessAddress,
          city: editInstallerProfileDto.city,
          zipCode: editInstallerProfileDto.zipCode,
          businessPhone:editInstallerProfileDto.businessPhone,
          state: editInstallerProfileDto.state,
          contractorLicense: editInstallerProfileDto.contractorLicense,
          contractorLicenseState: editInstallerProfileDto.contractorLicenseState,
          disbursementSequenceId:editInstallerProfileDto.disbursement
        }
      )
      const userInfo: any = await this.userRepository.update({id: editInstallerProfileDto.user_id},{
        firstName: editInstallerProfileDto.firstName
      })

        return {
          statusCode: 200,
          message: "data updated",
          data: [installerInfo,userInfo]
        }
    } catch (error) {
      console.log(error);

      let resp = new InternalServerErrorException(error).getResponse();
      if (Object.keys(resp).includes('name'))
        resp = Object.values(resp)[Object.keys(resp).indexOf('name')];
      return {
        statusCode: 500,
        message: ['Invalid ID'],
        error: 'Invalid ID',
      };
    }
  }


  async getLoanDetails()
    {
        try {
            const entityManager = getManager();
            let allLoandeatils = await entityManager.query(`select t."loanId" as loanid,t.ref_no as appid,t."legalName" as borrower,CONCAT(t."ownerFirstName", ' ', t."ownerLastName") AS ownerFullname,
            t3."salesRep" as salesrep,t2.filename as filepath,t2.originalname as filename,t3."paymentAmount" as loanamount,
            t2."updatedAt" as datesubmitted,CONCAT(t4."firstName" , ' ', t4."lastName") AS installer,
            t5."owner2Address" as owneraddress,t5."businessAddress",t5."batteryManufacturer",t5."inverterManufacturer",t5."batteryManufacturer"
             from tblcustomer t 
            left join tblfiles t2 on t2.link_id = t."loanId"
            left join tblloan t3 on t3.id =t."loanId"
            left join tbluser t4 on t4.id  = t3.user_id 
            left join tblcustomer t5 on t5."loanId" =t."loanId"
            left join tblsalescontractreview t6 on t6.loanid = t."loanId"
            where t2.services ='salescontract/uploadDocuments' AND t6.status='needadditionalinfo'`)
            return {
                statusCode:200,
                allLoandeatils
            }
        } catch (error) {
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
