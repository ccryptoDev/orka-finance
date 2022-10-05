import { SetPasswordDto } from './dto/setPassword.dto';
import { Injectable,BadRequestException,InternalServerErrorException } from '@nestjs/common';
import { SigninCreadentialsDto }from './dto/signin-user.dto';
import { UserRepository } from '../../repository/users.repository';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';

import IJwtPayload from '../../payloads/jwt-payload';
import { UserEntity,Flags } from '../../entities/users.entity';
import { getManager, In } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { TokenRepository } from 'src/repository/token.repository';
import { bcryptConfig } from 'src/configs/configs.constants';
import { TokenEntity } from 'src/entities/token.entity';
import { MailService } from 'src/mail/mail.service';
import { CheckTokenDto, PasswordResetDto } from './dto/pasword-reset.dto';


@Injectable()
export class UsersService {
  constructor( 
    @InjectRepository(UserRepository) private readonly userRepository: UserRepository,
    @InjectRepository(TokenRepository) private readonly tokenRepository: TokenRepository,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService
  ) {}
 
  async signIn(//client login check
    signinCreadentialsDto: SigninCreadentialsDto,
  ){
    const { email, password } = signinCreadentialsDto;
    try {
      const entityManager = getManager();
      let user = await this.userRepository.findOne( {select:["id","email","firstName","lastName","role","password","active_flag","emailVerify"], where:{delete_flag:'N',email:email,role:2}});
      if (user && (await user.validatePassword(password))) {

        if(user.active_flag=='Y'){
          if(user.emailVerify=='Y'){
            let resuser = new UserEntity();
            resuser.email = user.email;
            resuser.firstName = user.firstName;
            resuser.lastName = user.lastName;
            resuser.role = user.role;
            resuser.id = user.id;

            let loaninfo = await entityManager.query(`select * from tblloan t where user_id ='${user.id}'`)
            const payload: IJwtPayload = { email, role: 'customer' };
            const jwtAccessToken = await this.jwtService.signAsync(payload);
            return {"statusCode": 200, jwtAccessToken, resuser,loanDetails:loaninfo};
          }else{
            return {"statusCode": 400, "message": ["Your Email Is Not verified."],"error": "Bad Request"}
          }
          
        }else{
          return {"statusCode": 400, "message": ["Your Account Is Not Activated."],"error": "Bad Request"}
        }
        
      }else{
        return {"statusCode": 400, "message": ["Invalid credentials."],"error": "Bad Request"}
      }
    } catch (error) {
      console.log(error)
      return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
    }

    
  }

  async changePassword(id, changePasswordDto:ChangePasswordDto){
    const { currentpw, newpw } = changePasswordDto;
    try {
      let user = await this.userRepository.findOne( {select:["id","email","firstName","lastName","role","password"], where:{delete_flag:'N',active_flag:'Y',id:id,role:2}});
      if (user && (await user.validatePassword(currentpw))) {        
        const salt = await bcrypt.genSalt();
        const hashPassword = await bcrypt.hash(newpw, salt);
        
        await this.userRepository.update({id:id},{password: hashPassword, salt:salt})
        return {"statusCode": 200, "message": ["Password Changed Successfully"]};   
      }else{
        return {"statusCode": 100, "message": ["Current Password Is Wrong"]};
      }
    } catch (error) {
      console.log(error);
      
      return {"statusCode": 400, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
    }
  }

  async verify(
    id,token
  ){
    const entityManager = getManager();
    try {
      await entityManager.query(`UPDATE tbluser
	SET "emailVerify"='Y'::tbluser_emailverify_enum::tbluser_emailverify_enum
	WHERE id='${id}' and salt='${token}';`)
      return {"statusCode": 200};
    } catch (error) {
      console.log(error)
      return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
    }

  }

  async forgotPassword(forgotPasswordDto:ForgotPasswordDto){    
    try {
      const entityManager = getManager();
      // const roles = await entityManager.query(`select distinct t2.role_id as role_id from tblportal t 
      // join tblrolesmaster t2 on t2.portal_id = t.id where t."name" = 'borrower' and t2.delete_flag = 'N'`);
      // if(roles.length>0){
      //   let r = []
      //   for (let i = 0; i < roles.length; i++) {
      //     r.push(roles[i]['role_id']);
      //   }
      let user =  await this.userRepository.findOne({where:{email:forgotPasswordDto.email, role:2, delete_flag:'N'}})
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
        
        // const link = `${process.env.OrkaUrl}partner/passwordReset?token=${resetToken}&email=${forgotPasswordDto.email}`;
        const link = `${process.env.OrkaUrl}borrower/passwordReset?token=${resetToken}&email=${forgotPasswordDto.email}`;
        //const link = `http://localhost:4200/borrower/passwordReset?token=${resetToken}&email=${forgotPasswordDto.email}`;
        console.log(link);
        
        this.mailService.passwordResetMail(forgotPasswordDto.email,link)
        return {"statusCode": 200, "message": ["Reset password link sent Successfully"]}; 
      }else{
        return {"statusCode": 100, "message": ["User does not exist"], "error": "Bad Request"};
      }
    // }else{
    //   return {"statusCode": 100, "message": ["User does not exist"], "error": "Bad Request"};
    // }
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
      let checkUser = await this.userRepository.findOne({where:{email: passwordResetDto.email, role:2, delete_flag:'N'}});
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

  async getCurrentPassword(id:string){

    let entityManager = getManager();
    let data = await entityManager.query(`select t1.id,t1.email,t1."password"  from 
    tbluser t1 where t1.id  ='${id}'`)
    
    return {"statusCode":200,"data":data,
    message:"Password Get Success!"}
    
  }

  async checkFirstTime(id:string){
    let entityManager = getManager();
    let data = await entityManager.query(`select t1.id,t1."emailVerify" from tbluser t1 join tblcustomer t2 on t1.email=t2.email where t2."loanId" ='${id}'`)
    //console.log('data',data)
    if(data.length > 0 && data[0].emailVerify=="N"){
      return {"statusCode":200,"permission":'Y','userId':data[0].id}
    }else{
      let uid = (data.length > 0) ? data[0].id :''
      return {"statusCode":200,"permission":'N', 'userId':uid, message:"Link Invalid, Kindly Login with your credentials"}
    }
    
  }

  // async setPassword(setPasswordDto:SetPasswordDto){

  //     let users =  await this.userRepository.findOne({
  //       select:['emailVerify'],
  //       where:{id:setPasswordDto.id}
  //     })


  //     if (users && (await users.validatePassword(setPasswordDto.password))) {
  //       console.log('123')
  //       const salt = await bcrypt.genSalt();
  //       const hashPassword = await bcrypt.hash(setPasswordDto.password, salt);

  //       console.log('pass',hashPassword)

  //       await this.userRepository.update({id: setPasswordDto.id},{password:hashPassword,salt:salt,emailVerify:Flags.Y})
  //       return {"statusCode": 200, "message": ["Password Set Successfully"]}; 
  //     }else{
  //       return  {"statusCode": 100, "message": ["Invalid or expired password reset token"], "error": "Bad Request"};
  //     }
  // }
  
  async setPassword(setPasswordDto:SetPasswordDto){

    let user =  await this.userRepository.findOne({
      select:['emailVerify'],
      where:{id:setPasswordDto.id}
    })
  
    if(user.emailVerify=='N'){
      const salt = await bcrypt.genSalt();
          const hashPassword = await bcrypt.hash(setPasswordDto.password, salt);
  
          await this.userRepository.update({id: setPasswordDto.id},{password:hashPassword,salt:salt,emailVerify:Flags.Y})
          return {"statusCode": 200, "message": ["Password Set Successfully"]}; 
    }else{
      return  {"statusCode": 100, "message": ["Invalid or expired password reset token"], "error": "Bad Request"};
    }
    }

}
