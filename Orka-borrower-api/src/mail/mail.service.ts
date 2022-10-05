import { Injectable } from '@nestjs/common';
import { InjectSendGrid, SendGridService } from '@ntegral/nestjs-sendgrid';
import { config } from 'dotenv';

config();

@Injectable()
export class MailService {
  constructor(@InjectSendGrid() private readonly client: SendGridService) {} 

  async passwordResetMail(Email, link) {
    try {
      const message = {
        to: Email,
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

  // async docusignBorrowerEmail(email,data){

  //   try {
  //     console.log("mail-->",process.env.replyTo)
  //     const message = {
  //       to: email,
  //       from: process.env.FromMail,
  //       replyTo: process.env.ReplyTo,
  //       template_id: process.env.SENDGRID_ADMIN_NOTIFICATION_LOAN_APP_AWAITING_COUNTERSIGNATURE_TEMPLATE_ID,
  //       dynamic_template_data: {
  //         installerName: data.installerName,
  //         businessName: data.businessName,
  //         linkUrl: data.linkUrl,
  //       },
  //     };
  //     console.log("message",message)
  //     let ok = await this.client.send(message);
  //     console.log('emailok', ok);
  //     // console.log('Test email sent successfully');
  //   } catch (error) {
  //     console.error('Error sending test email');
  //     console.error(error);
  //     if (error.response) {
  //       console.error(error.response.body);
  //     }
  //   }

  // }
}