import { Injectable } from '@nestjs/common';
import { InjectSendGrid, SendGridService } from '@ntegral/nestjs-sendgrid';
import { config } from 'dotenv';

config();

export interface OrkaCeoFinancingContractTemplateData {
  installerName: string;
  customerBusinessName: string;
}

@Injectable()
export class MailService {
  data = [
    {
      filename: 'orka.png',
      type: 'image/png',
      content: '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',
      content_id: 'myimagecid',
      disposition: 'inline',
    },
  ];
  html1 = `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
        <title></title>
      </head>
      <body>
        <table style="border:1px solid #46b2ff; background-color: #fff;box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;padding: 20px;margin: auto; width: 650px;border-radius:8px;border-top:6px solid #46b2ff;">
          <tr>
            <td></td>
          </tr>
          <tr>
            <td colspan="7" height="50px" style="font-size: 30px;font-weight: 600;margin:2rem 0px;font-family: Arial, sans-serif; " align="center">
              <img style="width: 200px;" src="cid:myimagecid">
            </td>
          </tr>
  `;
  html2 = `
          <tr>
            <td colspan="7" >   
              <h4 style="color: #868686;font-weight: 600;font-size: 17px;font-family: Arial, sans-serif;"> By Team ${process.env.title}</h4>  
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  constructor(@InjectSendGrid() private readonly client: SendGridService) {}

  async inviteEmail(Email, password, url) {
    const body = "Email:" + Email + "\nPassword:" + password + "\nVerify To Your Email:" + url;

    try {
      await this.client.send(
        {
          to: Email,
          from: process.env.FromMail,
          replyTo: process.env.ReplyTo,
          subject: 'Orka Finance Invite Link',
          text: body,
          html: `
            <table style="text-align:left;">
              <tr>
                <th >Email</th>
                <td>:</td>
                <td>${Email}</td>
              </tr>
              <tr>
                <th>password</th>
                <td>:</td>
                <td>${password}</td>
              </tr>
              <tr>
                <td colspan="3"><a href="${url}">Verify Your Email</a></td>
              </tr>
            </table>
          `
        }
      );

      console.log('Test email sent successfully');
    } catch (error) {
      console.error('Error sending test email');
      console.error(error);

      if (error.response) {
        console.error(error.response.body);
      }
    }
  }

  // async add(email, password, url, name) {
  //   const body = "Email:" + email + "\nPassword:" + password + "\nVerify To Your Email:" + url
  //   try {
  //     await this.client.send(
  //       {

  //         to: email,
  //         from: process.env.FromMail,
  //         subject: 'Orka Finance Login Details',
  //         text: body,
  //         html: `
  //           <div style="background-color: whitesmoke; padding: 20px;">
  //               <div style="background-color: white; width: 600px; height:220px; margin-left:20%; margin-top: 20px; padding: 20px;">
  //                   <p>Hi ${name},</p>
  //                   <p>Welcome to <b>Orka Finance</b>, Please click the below link to log into your account and use the given credentials.</p>
  //                   <p><b>Email : </b> ${email}</p>
  //                   <p><b>Password : </b> ${password}</p>
  //                   <a href="${url}" style="margin-left: 15rem;">
  //                       <button style="background-color:#0f9cbf; 
  //                           border-radius: 5px; 
  //                           border:none; color:white; 
  //                           height: 30px; 
  //                           font-size:15px;"
  //                           >
  //                           Click Here To Login</button>
  //                   </a>
  //                   <br>
  //                   <br>
  //                   <div style="text-align: center; color:grey;">This link is valid only if you haven't set your password</div>
  //                   <p>Thanks,</p>
  //                   <p><b>Orka Finance</b>, Team</p>
  //               </div>
  //               <br>
  //               <div style=" text-align: center; width: 120px; margin-left:46%;" > &#169; Orka Finance</div>
  //           </div>
  //           `,
  //       }
  //     );
  //     console.log('Test email sent successfully');
  //   } catch (error) {
  //     console.error('Error sending test email');
  //     console.error(error);
  //     if (error.response) {
  //       console.error(error.response.body)
  //     }
  //   }
  // }

  async add(Email, password, url, fname) {
    try {
      const message = {
        to: Email,
        from: process.env.FromMail,
        replyTo: process.env.ReplyTo,
        template_id: process.env.SENDGRID_ADMIN_USER_CREATED_TEMPLATE_ID,
        dynamic_template_data: {
          salesRepName: fname,
          email: Email,
          pass: password,
          loginLink: url
        }
      };

      await this.client.send(message);
      
      console.log('Test email sent successfully');
    } catch (error) {
      console.error('Error sending test email');
      console.error(error);

      if (error.response) {
        console.error(error.response.body);
      }
    }
  }


  async request_bank_login(Email, url) {
    const body = "Email:" + Email + "\nConnect Your Bank:" + url;

    try {
      await this.client.send(
        {
          to: Email,
          from: process.env.FromMail,
          replyTo: process.env.ReplyTo,
          subject: 'Orka Finance Connect Your Bank',
          text: body,
          html: `
            <table style="text-align:left;">
              <tr>
                <th >Email</th>
                <td>:</td>
                <td>${Email}</td>
              </tr>
              <tr>
                <td colspan="3"><a href="${url}">Connect Your Bank</a></td>
              </tr>
            </table>
          `
        }
      );

      console.log('Test email sent successfully');
    } catch (error) {
      console.error('Error sending test email');
      console.error(error);

      if (error.response) {
        console.error(error.response.body);
      }
    }
  }

  // async passwordResetMail(Email, link) {
  //   try {
  //     const body = "Hi\nYou requested to reset your password.\nPlease, click the link below to reset your password\n";

  //     await this.client.send(
  //       {

  //         to: Email,
  //         from: process.env.FromMail,
  //         subject: 'Orka Finance Reset password',
  //         text: body,
  //         html: `
  //           <p>Hi</p>
  //           <p>You requested to reset your password.</p>
  //           <p>Please, click the link below to reset your password</p>
  //           <a href="${link}">Reset Password</a>
  //           `,
  //       }
  //     );
  //     console.log('pw reset sent successfully');

  //   } catch (error) {
  //     console.error('Error sending test email');
  //     console.error(error);
  //     if (error.response) {
  //       console.error(error.response.body)
  //     }
  //   }
  // }

  async creditoutcomeInstalleremail(Email,type) {
    if (type == 'approved') {
      try {
        const body = "Hi\n We are delighted to share that your credit application has been approved.";

        await this.client.send(
          {

            to: Email,
            from: process.env.FromMail,
            subject: process.env.title + ' Credit Approved',
            text: body,
            html: this.html1 + ` Credit Application Approved ` + this.html2
          }
        );

        console.log('Mail sent successfully');
      } catch (error) {
        console.error('Error sending test email');
        console.error(error);

        if (error.response) {
          console.error(error.response.body);
        }
      }
    } else {
    try {
      const body ="Hai\n We have run your application through our underwriting process and we regret to inform you that your application has been denied.";

      await this.client.send(
        {
          to: Email,
          from: process.env.FromMail,
          subject: process.env.title+' Credit Denied',
          text: body,
          html: this.html1 + ` Credit Application Denied ` + this.html2, 
        }
      );

      console.log('Mail sent successfully');
    } catch (error) {
      console.error('Error sending test email');
      console.error(error);

      if (error.response) {
        console.error(error.response.body);
      }
    }
    }
  }

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
      
      await this.client.send(message);

      console.log('Test email sent successfully');
    } catch (error) {
      console.error('Error sending test email');
      console.error(error);

      if (error.response) {
        console.error(error.response.body);
      }
    }
  }

  async partneradminUserMail(Email, data) {
    try {
      const message = {
        to: Email,
        from: process.env.FromMail,
        replyTo: process.env.ReplyTo,
        template_id: process.env.SENDGRID_PARTNER_USER_CREATED_TEMPLATE_ID,
        dynamic_template_data: {
          partnerOwnerFname:data.partnerOwnerFname,
          email: data.email,
          pass: data.pass,
          url:data.url,
          resetLink: data.resetLink
        }
      };

      await this.client.send(message);

      console.log('Test email sent successfully');
    } catch (error) {
      console.error('Error sending test email');
      console.error(error);

      if (error.response) {
        console.error(error.response.body);
      }
    }
  }

  async requestInfoContractEmail(Email, data) {
    try {
      const message = {
        to: Email,
        from: process.env.FromMail,
        replyTo: process.env.ReplyTo,
        template_id: process.env.SENDGRID_REQUEST_INFO_CONTRACT_TEMPLATE_ID,
        dynamic_template_data: {
          username: data.username,
          link: data.link,
          message: data.message
        }
      };

      await this.client.send(message);
      
      console.log('Test email sent successfully');
    } catch (error) {
      console.error('Error sending test email');
      console.error(error);

      if (error.response) {
        console.error(error.response.body);
      }
    }
  }

  async requestInfoMilestoneEmail(Email, data) {
    try {
      const message = {
        to: Email,
        from: process.env.FromMail,
        replyTo: process.env.ReplyTo,
        template_id: process.env.SENDGRID_REQUEST_INFO_MILESTONE_TEMPLATE_ID,
        dynamic_template_data: {
          username: data.username,
          link: data.link,
          message: data.message,
          milestone: data.milestone,
          businessname: data.businessname
        }
      };
      
      await this.client.send(message);
      
      console.log('Test email sent successfully');
    } catch (error) {
      console.error('Error sending test email');
      console.error(error);

      if (error.response) {
        console.error(error.response.body);
      }
    }
  }

  async creditOutcomeEmail(Email, partnerName, applicantFname) {
    try {
      const message = {
        to: Email,
        from: process.env.FromMail,
        replyTo: process.env.ReplyTo,
        template_id: process.env.SENDGRID_CREDIT_OUTCOME_TEMPLATE_ID,
        dynamic_template_data: {
          partnerName: partnerName,
          applicantFname: applicantFname
        }
      };
      
      await this.client.send(message);
      
      console.log('Test email sent successfully');
    } catch (error) {
      console.error('Error sending test email');
      console.error(error);

      if (error.response) {
        console.error(error.response.body);
      }
    }
  }

  async creditOutcomeStandardEmail (Email) {
    try {
      const message = {
        to: Email,
        from: process.env.FromMail,
        replyTo: process.env.ReplyTo,
        template_id: process.env.SENDGRID_CREDIT_OUTCOME_STANDARD_TEMPLATE_ID,
      };
      
      await this.client.send(message);
      
      console.log('Test email sent successfully');
    } catch (error) {
      console.error('Error sending test email');
      console.error(error);

      if (error.response) {
        console.error(error.response.body);
      }
    }
  }

  async recreditdecisiongenericEmail(Email,data) {
    try {
      const message = {
        to: Email,
        from: process.env.FromMail,
        replyTo: process.env.ReplyTo,
        template_id: process.env.SENDGRID_RECREDIT_DECISION_TEMPLATE_ID,
        dynamic_template_data: {
          partnerName: data.partnerName,
          partnerSalesName: data.partnerSalesName,
          businessName: data.businessName
        }
      };

      await this.client.send(message);
      
      console.log('Test email sent successfully');
    } catch (error) {
      console.error('Error sending test email');
      console.error(error);

      if (error.response) {
        console.error(error.response.body);
      }
    }
  }

  async requestLoanOpsInformation(email, requestedInfo) {
    try {
     const documentCenter = process.env.OrkaUrl + "borrower/document-center"
      await this.client.send(
        {
          to: email,
          from: process.env.FromMail,
          replyTo: process.env.ReplyTo,
          templateId: process.env.SENDGRID_CREDIT_OUTCOME_NOTICE_OF_INCOMPLETENESS_TEMPLATE_ID,
          dynamicTemplateData: {
            documentCenter: documentCenter,
            orkaUrl: process.env.OrkaUrl,
            requiredInfo: requestedInfo
          }

/*          subject: 'Orka Finance requested information',
          text: body,
          html: `
            <div style="background-color: whitesmoke; padding: 20px;">
                <div style="background-color: white; width: 600px; height:220px; margin-left:20%; margin-top: 20px; padding: 20px;">
                    <p>Please kindly provide us documents below.</p>
                    <div>
                      <ul>
                        ${body}
                      </ul>
                    </div>
                    <br>
                    <br>
                    <p>Thanks,</p>
                    <p><b>Orka Finance</b>, Team</p>
                </div>
                <br>
                <div style=" text-align: center; width: 120px; margin-left:46%;" > &#169; Orka Finance</div>
            </div>
            `,*/
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

  public async orkaCeofinancingContractMail(templateData: OrkaCeoFinancingContractTemplateData) {
    await this.client.send({
      to: process.env.OrkaCeoMail,
      from: process.env.FromMail,
      replyTo: process.env.ReplyTo,
      templateId: process.env.SENDGRID_ADMIN_NOTIFICATION_LOAN_APP_AWAITING_COUNTERSIGNATURE_TEMPLATE_ID,
      dynamicTemplateData: {
        installerName: templateData.installerName,
        businessName: templateData.customerBusinessName,
        linkUrl: `${process.env.OrkaUrl}/admin`
      }
    });
  }
}