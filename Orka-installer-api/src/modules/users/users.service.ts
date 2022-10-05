import { Injectable,BadRequestException,InternalServerErrorException } from '@nestjs/common';
import { SigninCreadentialsDto }from './dto/signin-user.dto';
import { UserRepository } from '../../repository/users.repository';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';

import IJwtPayload from '../../payloads/jwt-payload';
import { UserEntity,Flags } from '../../entities/users.entity';
import { getManager,In } from 'typeorm';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { bcryptConfig } from 'src/configs/configs.constants';
import {Logs} from './dto/logs.dto';
import { LogRepository } from 'src/repository/log.repository';
import { LogEntity } from 'src/entities/log.entity';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { CheckTokenDto, PasswordResetDto } from './dto/pasword-reset.dto';
import { TokenRepository } from 'src/repository/token.repository';
import { MailService } from 'src/modules/mail/mail.service';
import { TokenEntity } from 'src/entities/token.entity';
import { SetPasswordDto } from './dto/setPassword.dto';
import { escape } from 'querystring';
import { urlencoded } from 'express';


@Injectable()
export class UsersService {
  constructor( 
    @InjectRepository(UserRepository) private readonly userRepository: UserRepository,
    @InjectRepository(LogRepository) private readonly logRepository:LogRepository,
    @InjectRepository(TokenRepository) private readonly tokenRepository: TokenRepository,
    private readonly jwtService: JwtService,    
    private readonly mailService: MailService
  ) {}
 
  async signIn(
    signinCreadentialsDto: SigninCreadentialsDto,
  ){
    const { email, password } = signinCreadentialsDto;
    try {
      const entityManager = getManager();
      let roles = await entityManager.query(`select distinct t2.role_id as role_id from tblportal t join tblrolesmaster t2 on t2.portal_id = t.id where t."name" = 'installer' and t2.delete_flag = 'N'`);
      if(roles.length>0){
        let r = []
        for (let i = 0; i < roles.length; i++) {
          r.push(roles[i]['role_id']);
        }
      let user = await this.userRepository.findOne( {select:["id","email","firstName","lastName","role","password","active_flag", "mainInstallerId"], where:{delete_flag:'N',active_flag:'Y',email:email,role:In(r)}}); 
      if (user && (await user.validatePassword(password))) {

        if(user.active_flag=='Y'){
          let pages = await entityManager.query(`select distinct t.order_no ,t.id, t."name" as name from tblpages t join tblrolesmaster t2 on t2.pages_id = t.id where t2.role_id = ${user.role} and t2.delete_flag = 'N' order by t.order_no asc`)
        if(pages.length>0){
          let tabs = {}
          for (let i = 0; i < pages.length; i++) {
            tabs[pages[i]['id']] = await entityManager.query(`select distinct t.order_no ,t.id, t."name" as name from tblpagetabs t join tblrolesmaster t2 on t2.pagetabs_id = t.id where t2.pages_id = ${pages[i]['id']} and t2.role_id = ${user.role} and t2.delete_flag = 'N' order by t.order_no asc `)
          }
            let resuser = new UserEntity();
            resuser.email = user.email;
            resuser.firstName = user.firstName;
            resuser.lastName = user.lastName;
            resuser.role = user.role;
            resuser.id = user.id;
            resuser.mainInstallerId = user.mainInstallerId;
            const payload: IJwtPayload = { email, role: 'installer' };
            const jwtAccessToken = await this.jwtService.signAsync(payload);
            let businessName;
            if(user.mainInstallerId!=null)
            {
              businessName = await entityManager.query(`select "businessName" from tblinstaller where user_id = '${user.mainInstallerId}'`)
            }
            else
            {
              businessName = await entityManager.query(`select "businessName" from tblinstaller where user_id = '${user.id}'`)
            }
            return {"statusCode": 200, jwtAccessToken, resuser, pages:pages, tabs:tabs, businessName: businessName[0]['businessName']};
        }else{
          return {"statusCode": 400, "message": ["No Page In This User"],"error": "Bad Request"}
        }
          
        }else{
          return {"statusCode": 400, "message": ["Your Account Is Not Activated."],"error": "Bad Request"}
        }
        
      }else{
        return {"statusCode": 400, "message": ["Invalid credentials."],"error": "Bad Request"}
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
        const roles = await entityManager.query(`select distinct t2.role_id as role_id from tblportal t join tblrolesmaster t2 on t2.portal_id = t.id where t."name" = 'installer' and t2.delete_flag = 'N'`);
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
      console.log(error);
      
      return {"statusCode": 400, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
    }
  }

  // async logs(logs:Logs){
  //   let log = new LogEntity();
  //   log.module = logs.module;
  //   log.user_id = logs.user_id;
  //   log.loan_id = logs.loan_id;
  //   try{
  //       this.logRepository.save(log)
  //       return {"statusCode": 200};
  //   }catch (error) {
  //       return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
  //   }
  // }

  async forgotPassword(forgotPasswordDto:ForgotPasswordDto){    
    try {
      const entityManager = getManager();
      const roles = await entityManager.query(`select distinct t2.role_id as role_id from tblportal 
      t join tblrolesmaster t2 on t2.portal_id = t.id where t."name" = 'installer' and t2.delete_flag = 'N'`);

      console.log('--',roles)
      if(roles.length>0){
        let r = []
        for (let i = 0; i < roles.length; i++) {
          r.push(roles[i]['role_id']);
        }

        console.log('--R',r)
     let user =  await this.userRepository.findOne({where:{email:forgotPasswordDto.email, role:In(r), delete_flag:'N'}})
      //let user =  await this.userRepository.findOne({where:{email:forgotPasswordDto.email, delete_flag:'N'}})

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
        //let resetEmail = encodeURIComponent(forgotPasswordDto.email);
        // const link = `${process.env.OrkaUrl}partner/passwordReset?token=${resetToken}&email=${forgotPasswordDto.email}`;
        const link = `${process.env.OrkaUrl}partner/passwordReset?token=${resetToken}&email=${forgotPasswordDto.email}`;
        //const link = `http://localhost:4200/partner/passwordReset?token=${resetToken}&email=${forgotPasswordDto.email}`;
        console.log('------------linkkk',link);
        
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
      console.log('email--',resetEmail,checkTokenDto.email)
      let passwordResetToken = await this.tokenRepository.findOne({where:{email: resetEmail}});
      console.log(passwordResetToken)

      console.log(checkTokenDto.token)
      if (passwordResetToken) {        
        const isValid = await bcrypt.compare(checkTokenDto.token, passwordResetToken.token);
        const data = {
          'passwordResetToken':passwordResetToken.token,
          'checktokendto':checkTokenDto.token,
        }
        if (isValid) {
          return {"statusCode": 200, "message": ["Token is valid"]}; 
        }else{
          return {"statusCode": 101, "message": ["Invalid or expired password reset token"], "error": data};
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
      let checkUser = await this.userRepository.findOne({where:{email: passwordResetDto.email, role:4, delete_flag:'N'}});
      //console.log('checkuser',passwordResetDto)
      if (checkUser) { 
        const salt = await bcrypt.genSalt();
        const hashPassword = await bcrypt.hash(passwordResetDto.newpw, salt);

        await this.userRepository.update({email: passwordResetDto.email},{password:hashPassword,salt:salt})
        return {"statusCode": 200, "message": ["Password Changed Successfully"]}; 
      }else{
        return {"statusCode": 100, "message": ["Invalid user"], "error": "Bad Request"};
      }
    } catch (error) {
      return {"statusCode": 400, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
    }
  }


  async activate(id){
    const entityManager = getManager();
    try{
      const rawData = await entityManager.query(`UPDATE tbluser SET active_flag='Y'::tbluser_active_flag_enum::tbluser_active_flag_enum WHERE id='${id}'`);
        return {"statusCode": 200, data:rawData };
    }catch (error) {
        return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
    }
  }

  async deactivate(id){
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

  async checkFirstTime(id:string){
    let entityManager = getManager();
    let data = await entityManager.query(`select id,"emailVerify" from tbluser where "id"='${id}'`)
    if(data[0].emailVerify=="N"){
      return {"statusCode":200,"permission":'Y','userId':data[0].id}
    }else{
      return {"statusCode":200,"permission":'N', 'userId':data[0].id, message:"Link Invalid, Kindly Login with your credentials"}
    }
    
  }

  async setPassword(setPasswordDto: SetPasswordDto) {

    let user = await this.userRepository.findOne({
      select: ['emailVerify'],
      where: { id: setPasswordDto.id }
    })
    console.log("user",user)
    if (user.emailVerify == 'N') {
      const salt = await bcrypt.genSalt();
      const hashPassword = await bcrypt.hash(setPasswordDto.password, salt);

      await this.userRepository.update({ id: setPasswordDto.id }, { password: hashPassword, salt: salt, emailVerify: Flags.Y })
      return { "statusCode": 200, "message": ["Password Set Successfully"] };
    } else {
      return { "statusCode": 100, "message": ["Invalid or expired password reset token"], "error": "Bad Request" };
    }
  }

}
