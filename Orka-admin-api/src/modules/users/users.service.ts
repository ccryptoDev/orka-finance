import { Injectable,BadRequestException,InternalServerErrorException } from '@nestjs/common';
import { SigninCreadentialsDto }from './dto/signin-user.dto';
import { UserRepository } from '../../repository/users.repository';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';

import IJwtPayload from '../../payloads/jwt-payload';
import { UserEntity,Flags } from '../../entities/users.entity';

import { getManager, In } from 'typeorm';
import { AddCreadentialsDto } from './dto/add-user.dto';
import { EditCredentialsDto } from './dto/edit-user.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { bcryptConfig } from 'src/configs/configs.constants';
import { MailService } from '../../mail/mail.service';
import { config } from 'dotenv';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { CheckTokenDto, PasswordResetDto } from './dto/pasword-reset.dto';
import { TestEmailTemplateDto} from './dto/test-email.dto'
import { TokenRepository } from 'src/repository/token.repository';
import { TokenEntity } from 'src/entities/token.entity';
import { RolesService } from '../roles/roles.service';
import { InjectSendGrid, SendGridService } from '@ntegral/nestjs-sendgrid';
config();


//commit changes

@Injectable()
export class UsersService {
  client: any;
  constructor( 
    @InjectRepository(UserRepository) private readonly userRepository: UserRepository,
    @InjectRepository(TokenRepository) private readonly tokenRepository: TokenRepository,
    @InjectSendGrid() private readonly clients: SendGridService,

    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly rolesService: RolesService  
  ) {}
 
  async signIn(
    signinCreadentialsDto: SigninCreadentialsDto,
  ){
    const { email, password } = signinCreadentialsDto;
    try {
      const entityManager = getManager();
      let roles = await entityManager.query(`select distinct t2.role_id as role_id from tblportal t join tblrolesmaster t2 on t2.portal_id = t.id where t."name" = 'admin' and t2.delete_flag = 'N'`);
     
      if(roles.length>0){
        let r = []
        for (let i = 0; i < roles.length; i++) {
          r.push(roles[i]['role_id']);
        }
      let user = await this.userRepository.findOne( {select:["id","email","firstName","lastName","role","password"], where:{delete_flag:'N',active_flag:'Y',email:email,role:In(r)}});
      console.log(user)
      if (user && (await user.validatePassword(password))) {
        let pages = await entityManager.query(`select distinct t.order_no ,t.id, t."name" as name from tblpages t join tblrolesmaster t2 on t2.pages_id = t.id where t2.role_id = ${user.role} and t2.delete_flag = 'N' order by t.order_no asc`)
        if(pages.length>0){
          let tabs = {}
          for (let i = 0; i < pages.length; i++) {
            tabs[pages[i]['id']] = await entityManager.query(`select distinct t.order_no ,t.id, t."name" as name from tblpagetabs t join tblrolesmaster t2 on t2.pagetabs_id = t.id where t2.pages_id = ${pages[i]['id']} and t2.role_id = ${user.role} and t2.delete_flag = 'N' order by t.order_no asc `)
          }
          let resuser = new UserEntity();
          resuser.id = user.id;
          resuser.email = user.email;
          resuser.firstName = user.firstName;
          resuser.lastName = user.lastName;
          resuser.role = user.role;
          const payload: IJwtPayload = { email, role: 'admin' };
          const jwtAccessToken = await this.jwtService.signAsync(payload);
          return {"statusCode": 200, jwtAccessToken, resuser,pages:pages, tabs:tabs };
        }else{
          return {"statusCode": 400, "message": ["No Page In This User"],"error": "Bad Request"}
        }
        
      }
    }else{
      return {"statusCode": 400, "message": ["Invalid credentials."],"error": "Bad Request"}
    }
    } catch (error) {
      console.log(error)
      return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
    }

    return {"statusCode": 400, "message": ["Invalid credentials."],"error": "Bad Request"}
  }

  async changePassword(id, changePasswordDto:ChangePasswordDto){
    const { currentpw, newpw } = changePasswordDto;
    try {
      const entityManager = getManager();
      const roles = await entityManager.query(`select distinct t2.role_id as role_id from tblportal t join tblrolesmaster t2 on t2.portal_id = t.id where t."name" = 'admin' and t2.delete_flag = 'N'`);
      if(roles.length>0){
        let r = []
        for (let i = 0; i < roles.length; i++) {
          r.push(roles[i]['role_id']);
        }
      
      let user = await this.userRepository.findOne( {select:["id","email","firstName","lastName","role","password"], where:{delete_flag:'N',active_flag:'Y',id:id,role:In(r)}});
      if (user && (await user.validatePassword(currentpw))) {        
        const salt = await bcrypt.genSalt();
        const hashPassword = await bcrypt.hash(newpw, salt);
        
        await this.userRepository.update({id:id},{password: hashPassword, salt:salt})
        return {"statusCode": 200, "message": ["Password Changed Successfully"]};   
      }else{
        return {"statusCode": 100, "message": ["Current Password Is Wrong"]};
      }
    }else{
      return {"statusCode": 200, "message": ["Password Changed Successfully"]};  
    }
    } catch (error) {
      return {"statusCode": 400, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
    }
  }


  async list(){
    const entityManager = getManager();
    
    try{
      const rawData = await entityManager.
        query(`select t.*, t2."name" as role_name, t4."legalName" ,t5."businessName" from tbluser t 
        left join tblroles t2 on t."role" = t2.id 
        left join tblloan t3 on t.id = t3.user_id 
        left join tblcustomer t4 on t3.id = t4."loanId" 
        left join tblinstaller t5 on t.id = t5.user_id where t.delete_flag = 'N' 
        order by "createdAt" desc `);
        return {"statusCode": 200, data:rawData };
    }catch (error) {
        return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
    }
  }

  async adminlist(){
    const entityManager = getManager();
    
    try{
        const rawData = await entityManager.
        query(`select distinct email,t.*,r.name as role_name from tbluser t 
        join tblrolesmaster t2 on t.role=t2.role_id 
        join tblroles r on t.role = r.id
        join tblportal t3 on t2.portal_id = t3.id 
        where t3."name" ='admin'`);
        return {"statusCode": 200, data:rawData };
    }catch (error) {
        return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
    }
  }

  async getdetails(id){
    const entityManager = getManager();
    try{
     // console.log('id',id)

      const rawDataID = await entityManager.query(`select t.id, t."firstName",t."lastName", t4."legalName", t.delete_flag,t."createdAt"  ,t."role" ,t.ref_no , t.email ,t2."name" as role_name ,
      t5."businessName" from tbluser t 
      left  join tblroles t2 on t."role" = t2.id 
      left join tblloan t3 on t.id = t3.user_id 
      left join tblcustomer t4 on t3.id = t4."loanId" 
      left join tblinstaller t5 on t.id = t5.user_id 
      where t.delete_flag = 'N' and t."role" != 1 and t.id ='${id}'
      order by "createdAt" desc`);

        const checkIDLoan = await entityManager.query(`select * from tblloan c where c.user_id= '${id}'`)
       // console.log('\\\\',checkIDLoan.lenght)
     
      if(rawDataID[0].role!=1){//

        if(checkIDLoan!=null && checkIDLoan.length > 0){
          const rawData = await entityManager.query(`select t.id, t."firstName",t."lastName", t4."legalName", t.delete_flag,t."createdAt"  ,t."role" ,t.ref_no ,t.active_flag, t.email ,t2."name" as role_name ,t5."businessName" from tbluser t left  join tblroles t2 on t."role" = t2.id 
          left join tblloan t3 on t.id = t3.user_id 
          left join tblcustomer t4 on t3.id = t4."loanId" 
          left join tblinstaller t5 on t.id = t5.user_id 
          where t.delete_flag = 'N' and t."role" != 1 and t.id ='${id}'
          order by "createdAt" desc`);
          return {"statusCode": 200, data:rawData };
        }else{
          const rawData = await entityManager.query(` select t.id, t."firstName",t."lastName", t4."legalName", t.delete_flag, t.active_flag ,t."createdAt"  ,
          t."role" ,t.ref_no , t.email ,
          t2."name" as role_name ,
          t5."businessName" from tbluser t 
          left  join tblroles t2 on t."role" = t2.id 
          left join tblloan t3 on t.id = t3.user_id 
          left join tblcustomer t4 on t3.id = t4."loanId" 
          left join tblinstaller t5 on t.id = t5.user_id 
          where t.delete_flag = 'N' and t."role" != 1 and t.id ='${id}'
          order by "createdAt" desc`);
          return {"statusCode": 200, data:rawData };
        }
      }else{
        const rawData = await entityManager.query(`select distinct email,t.*,r.name as role_name from tbluser t 
        left join tblrolesmaster t2 on t.role=t2.role_id 
        left join tblroles r on t.role = r.id
        left join tblportal t3 on t2.portal_id = t3.id 
        where t3."name" ='admin' and t.id = '${id}'`);
        // console.log('------',rawData)
        return {"statusCode": 200, data:rawData }; 
      }
    }catch (error) {
      console.log(error)
        return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
    }
  }


  async active(id){
    const entityManager = getManager();
    try{
      const rawData = await entityManager.query(`UPDATE tbluser SET active_flag='Y'::tbluser_active_flag_enum::tbluser_active_flag_enum WHERE id='${id}'`);
        return {"statusCode": 200, data:rawData };
    }catch (error) {
        return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
    }
  }

  async deactive(id){
    const entityManager = getManager();
    try{
      const rawData = await entityManager.query(`UPDATE tbluser SET active_flag='N'::tbluser_active_flag_enum::tbluser_active_flag_enum WHERE id='${id}'`);
        return {"statusCode": 200, data:rawData };
    }catch (error) {
        return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
    }
  }


  async delete(id){
    const entityManager = getManager();
    try{
      const rawData = await entityManager.query(`UPDATE tbluser SET delete_flag='Y'::tbluser_delete_flag_enum::tbluser_delete_flag_enum WHERE id='${id}'`);
        return {"statusCode": 200, data:rawData };
    }catch (error) {
        return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
    }
  }


  async add(
    addCreadentialsDto: AddCreadentialsDto,
  ){
    let url:any = process.env.OrkaUrl
    const user = new UserEntity();

    if(addCreadentialsDto.email && typeof addCreadentialsDto.email== 'string'){
      if(addCreadentialsDto.email.trim().length==0){
        return {"statusCode": 400, "message": ["Email should not be empty"],"error": "Bad Request"}
      }else{
        user.email = addCreadentialsDto.email;
      }       
    }else{
      return {"statusCode": 400, "message": ["Email should not be empty"],"error": "Bad Request"}
    }

    if(addCreadentialsDto.role && typeof addCreadentialsDto.role== 'number'){             
      let adminRolesRes = await this.rolesService.getAdminPortalRoles();
      if(!adminRolesRes.data.find(o=>o.id==addCreadentialsDto.role)){
        return {"statusCode": 400, "message": ["Selected Role is not in admin portal"],"error": "Bad Request"}
      }   
      user.role = addCreadentialsDto.role;
      url=url+"admin/login"          
    }else{      
      return {"statusCode": 400, "message": ["Selected Role is not valid"],"error": "Bad Request"}
    }

    try {
      let users:any = await this.userRepository.find( {select:["email"], where:{delete_flag:'N',email:user.email,role:user.role}});
      if(users.length>0){
        return {"statusCode": 400, "message": ["This Email Already Exists"],"error": "Bad Request"}
      }
      if(addCreadentialsDto.firstName && typeof addCreadentialsDto.firstName== 'string'){
        if(addCreadentialsDto.firstName.trim().length==0){
          return {"statusCode": 400, "message": ["firstName should not be empty"],"error": "Bad Request"}
        }else{
          user.firstName = addCreadentialsDto.firstName;
        }       
      }else{
        return {"statusCode": 400, "message": ["firstName should not be empty"],"error": "Bad Request"}
      }

      if(addCreadentialsDto.lastName && typeof addCreadentialsDto.lastName== 'string'){
        if(addCreadentialsDto.lastName.trim().length==0){
          return {"statusCode": 400, "message": ["firstName should not be empty"],"error": "Bad Request"}
        }else{
          user.lastName = addCreadentialsDto.lastName;
        }       
      }else{
        return {"statusCode": 400, "message": ["firstName should not be empty"],"error": "Bad Request"}
      }

      var length = 8,
      charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
      password = "";
      for (var i = 0, n = charset.length; i < length; ++i) {
          password += charset.charAt(Math.floor(Math.random() * n));
      }

      user.salt = await bcrypt.genSalt();
      user.password = await bcrypt.hash(password, user.salt);
      user.active_flag = Flags.Y;
      await this.userRepository.save(user)
      this.mailService.add(user.email,password,url,user.firstName)
      return {"statusCode": 200 };
    } catch (error) {
      return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
    }

  }

  async edit(
    editCredentialsDto: EditCredentialsDto,
  ){
    try {
      const user = new UserEntity();

      user.email = editCredentialsDto.email;
      user.firstName = editCredentialsDto.firstName;
      user.lastName = editCredentialsDto.lastName;
      await this.userRepository.update({id: editCredentialsDto.user_id},user)
      return {"statusCode": 200 };
     
    }catch (error) {
      return {"statusCode": 500, "message": "Bad Request"};
      // console.log(error);
      
    }
  }
  
  async forgotPassword(forgotPasswordDto:ForgotPasswordDto){    
    try {
      const entityManager = getManager();
      const roles = await entityManager.query(`select distinct t2.role_id as role_id from tblportal t join tblrolesmaster t2 on t2.portal_id = t.id where t."name" = 'admin' and t2.delete_flag = 'N'`);
      if(roles.length>0){
        let r = []
        for (let i = 0; i < roles.length; i++) {
          r.push(roles[i]['role_id']);
        }
      let user =  await this.userRepository.findOne({where:{email:forgotPasswordDto.email, role:In(r), delete_flag:'N'}})
      if(user){
        let token = await this.tokenRepository.findOne({ email:forgotPasswordDto.email });
        if(token){
          await this.tokenRepository.delete({email:forgotPasswordDto.email})
        }

        let resetToken = crypto.randomBytes(32).toString("hex");
        const hash = await bcrypt.hash(resetToken, Number(bcryptConfig.saltRound));

        let tokenEntity = new TokenEntity();
        tokenEntity.email = forgotPasswordDto.email;
        tokenEntity.token = hash;

        await this.tokenRepository.save(tokenEntity);

        // const link = `http://localhost:4200/admin/passwordReset?token=${resetToken}&email=${forgotPasswordDto.email}`;
        // console.log(link);
        const link = `${process.env.OrkaUrl}admin/passwordReset?token=${resetToken}&email=${forgotPasswordDto.email}`;
        console.log(link);
        
        this.mailService.passwordResetMail(forgotPasswordDto.email,link)
        return {"statusCode": 200, "message": ["Reset password link sent Successfully"]}; 
      }else{
        return {"statusCode": 100, "message": ["User does not exist"], "error": "Bad Request"};
      }
    }else{
      return {"statusCode": 100, "message": ["User does not exist"], "error": "Bad Request"};
    }
    } catch (error) {
      return {"statusCode": 400, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
    }
  }

  async checkToken(checkTokenDto:CheckTokenDto){    
    try {

//let resetEmail =  decodeURIComponent(encodeURIComponent(checkTokenDto.email)).replace(" ", "+");
let resetEmail = checkTokenDto.email;
      let passwordResetToken = await this.tokenRepository.findOne({where:{email: resetEmail}});
      if (passwordResetToken) {        
        const isValid = await bcrypt.compare(checkTokenDto.token, passwordResetToken.token);
        
        if (isValid) {
          return {"statusCode": 200, "message": ["Token is valid"]}; 
        }else{
          return {"statusCode": 101, "message": ["Invalid or expired password reset token"], "error": "Bad Request"};
        }
      }else{
        return {"statusCode": 100, "message": ["Invalid or expired password reset token"], "error": "Bad Request"};
      }
    } catch (error) {
      return {"statusCode": 400, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
    }
  }

  async passwordReset(passwordResetDto:PasswordResetDto){    
    try {
      const entityManager = getManager();
      const roles = await entityManager.query(`select distinct t2.role_id as role_id from tblportal t join tblrolesmaster t2 on t2.portal_id = t.id where t."name" = 'admin' and t2.delete_flag = 'N'`);
      if(roles.length>0){
        let r = []
        for (let i = 0; i < roles.length; i++) {
          r.push(roles[i]['role_id']);
        }
      let checkUser = await this.userRepository.findOne({where:{email: passwordResetDto.email, role:In(r), delete_flag:'N'}});
      if (checkUser) { 
        const salt = await bcrypt.genSalt();
        const hashPassword = await bcrypt.hash(passwordResetDto.newpw, salt);

        await this.userRepository.update({email: passwordResetDto.email},{password:hashPassword,salt:salt})
        return {"statusCode": 200, "message": ["Password Changed Successfully"]}; 
      }else{
        return {"statusCode": 100, "message": ["Invalid user"], "error": "Bad Request"};
      }}else{
        return {"statusCode": 100, "message": ["Invalid user"], "error": "Bad Request"};
      }
    } catch (error) {
      return {"statusCode": 400, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
    }
  }

  async testEmailTemplate(TestEmailTemplateDto:TestEmailTemplateDto) {
    try {
      const message = {
        to: TestEmailTemplateDto.email,
        from: process.env.FromMail,
        template_id: TestEmailTemplateDto.templateID,
        dynamic_template_data: TestEmailTemplateDto.dynamic_data,
      };
      let ok = await this.clients.send(message);
      // console.log('email ok', ok);
      // console.log('Test email sent successfully');
      return {"statusCode": 200, "message": ["Test email sent successfully"]}; 
    } catch (error) {
     // console.error('Error sending test email');
      return {"statusCode": 100, "message": ["Error sending test email"], "error": "Bad Request"};
    }
  }
}
