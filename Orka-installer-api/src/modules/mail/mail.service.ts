import {  Injectable } from '@nestjs/common';
import { InjectSendGrid, SendGridService } from '@ntegral/nestjs-sendgrid';
import { config } from 'dotenv';

config();

export interface FinancingContractInvitationTemplateData {
  businessName: string;
  firstName: string;
  financingContract: string;
}

@Injectable()
export class MailService {
  constructor(@InjectSendGrid() private readonly client: SendGridService) {}
  
  public async passwordResetMail(email: string, link: string) {
    try {
      const message = {
        to: email,
        from: process.env.FromMail,
        replyTo: process.env.ReplyTo,
        template_id: process.env.SENDGRID_FORGOT_PASSWORD_TEMPLATE_ID,
        dynamic_template_data: {
          resetLink: link,
        },
      };
      let ok = await this.client.send(message);
      console.log('email ok', ok);
      // console.log('Test email sent successfully');
    } catch (error) {
      console.error('Error sending test email');
      console.error(error);
      if (error.response) {
        console.error(error.response.body);
      }
    }
  }

  public async partnerUserCreatedMail(email: string, data) {
    try {
      const message = {
        to: email,
        from: process.env.FromMail,
        replyTo: process.env.ReplyTo,
        template_id: process.env.SENDGRID_ADMIN_USER_CREATED_TEMPLATE_ID,
        dynamic_template_data: {
          salesRepName:data.salesRepName,
          email:data.email,
          pass:data.pass,
          loginLink:data.link
        },
      };
      let ok = await this.client.send(message);
      console.log('email ok', ok);
      // console.log('Test email sent successfully');
    } catch (error) {
      console.error('Error sending test email');
      console.error(error);
      if (error.response) {
        console.error(error.response.body);
      }
    }
  }

  public async add(email: string, password: string, url: string) {
    const body = "Email:"+email+"\nPassword:"+password+"\nVerify To Your Email:"+url
    try {
      await this.client.send(
        {
            
            to: email,
            from: process.env.FromMail,
            replyTo: process.env.ReplyTo,
            subject: 'InfinityEnergy Login Details',
            text: body,
            html: `
            <table style="text-align:left;">
      <tr>
      <th >Email</th>
      <td>:</td>
      <td>${email}</td>
      </tr>
      <tr>
      <th>password</th>
      <td>:</td>
      <td>${password}</td>
      </tr>
      <tr>
      <td colspan="3"><a href="${url}">Click To Login</a></td>
      </tr>
      </table>
            `,
          }
      );
      console.log('Test email sent successfully');
    } catch (error) {
      console.error('Error sending test email');
      console.error(error);
      if (error.response) {
        console.error(error.response.body)
      }
    }
  }

  public async financingContractMail(email: string, templateData: FinancingContractInvitationTemplateData) {
    await this.client.send({
      to: email,
      from: process.env.FromMail,
      replyTo: process.env.ReplyTo,
      templateId: process.env.SENDGRID_FINANCING_CONTRACT_INVITATION_TEMPLATE_ID,
      dynamicTemplateData: templateData
    });
  }
}