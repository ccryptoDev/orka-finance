import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import { createHmac } from 'crypto';
import { sign } from 'jsonwebtoken';
import { resolve } from 'path';
import axios from 'axios';
import * as docusign from 'docusign-esign';
import * as fs from 'fs';

import { IArgs, IEnvelopeArgs, EmbeddedEnvelopeSigningResponse } from '../loan-agreement/data.interface';

const DOC_ACCESS_TOKEN = 'DOC_ACCESS_TOKEN';
@Injectable()
export class DocusignService {
  constructor(
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  public async checkToken() {
    const cacheToken = await this.cacheManager.get('DOC_ACCESS_TOKEN');

    if (!cacheToken) {
      const { access_token } = await this.getDocuSignAccessToken();

      return { access_token };
    }

    return { access_token: cacheToken };
  }

  public async sendEnvelopeForEmbeddedSigning(args: IArgs): Promise<EmbeddedEnvelopeSigningResponse> {
    let envelopeId = args.envelopeId || '';

    if (!args.envelopeId) {
      const result = await this.createEnvelope(
        args.envelopeArgs,
        args.accessToken,
      );

      envelopeId = result.data.envelopeId;
    }

    const urlForEmbedding = await this.createRecipientView(envelopeId, args);

    return { envelopeId, redirectUrl: urlForEmbedding };
  }

  public async getEnvelopeDocPdf(args) {
    let dsApiClient = new docusign.ApiClient();
    const baseUrl = this.configService.get<string>('DOCUSIGN_BASEURL');
    const accountId = this.configService.get<string>('DOCUSIGN_ACCOUNTID');
    dsApiClient.setBasePath(baseUrl);
    dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);

    let envelopesApi = new docusign.EnvelopesApi(dsApiClient),
      results = null;

    results = await envelopesApi.getDocument(
      accountId,
      args.envelopeId,
      args.documentId,
      null,
    );

    return results;
  }

  public async getEnvelopeCompletePdf(envelopeId: string, token: string) {
    const baseUrl = this.configService.get<string>('DOCUSIGN_BASEURL');
    const apiVersion = this.configService.get<string>('DOCUSIGN_APIVERSION');
    const accountId = this.configService.get<string>('DOCUSIGN_ACCOUNTID');
    const url = `${baseUrl}/${apiVersion}/accounts/${accountId}/envelopes/${envelopeId}/documents/combined`;
    const results = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/pdf',
      },
      responseType: 'arraybuffer',
    });
    return results.data;
  }
  
  public async isWebhookValid(body: any, headerSignature: string) {
    const secret = this.configService.get<string>('DOCUSIGN_CONNECT_KEYS');
    if (body && headerSignature) {
      const hmac = createHmac('sha256', secret);
      hmac.write(JSON.stringify(body));
      hmac.end();

      const base64 = hmac.read().toString('base64');
      return base64 === headerSignature;
    }
    return false;
  }

  private async getDocuSignAccessToken() {
    const token = await this.generateJwtDocusign();
    const url = `https://${this.configService.get<string>(
      'DOCUSIGN_HOSTENV',
    )}/oauth/token`;

    const params = new URLSearchParams();
    params.append('assertion', token);
    params.append('grant_type', 'urn:ietf:params:oauth:grant-type:jwt-bearer');

    try {
      const {
        data: { access_token, expires_in },
      } = await axios.post(url, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${this.configService.get<string>(
            'DOCUSIGN_ENCODEDKEYS',
          )}`,
        },
      });

      if (access_token) {
        const expiry: number = expires_in - 900;
        await this.cacheManager.set(DOC_ACCESS_TOKEN, access_token, {
          ttl: expiry,
        });
      }

      return { statusCode: 200, access_token };
    } catch (error) {
      await this.cacheManager.del(DOC_ACCESS_TOKEN);
      return {
        statusCode: 400,
        msg: '[Docusign] Error in getting token',
      };
    }
  }

  private async generateJwtDocusign() {
    const jwtPayload = {
      iss: this.configService.get<string>('DOCUSIGN_IKEY'),
      sub: this.configService.get<string>('DOCUSIGN_USERID'),
      aud: this.configService.get<string>('DOCUSIGN_HOSTENV'),
      scope: 'signature impersonation',
    };

    const secret = fs.readFileSync(
      resolve(`src/assets/docusignKeys/private.pem`),
    );

    const token = sign(jwtPayload, secret, {
      expiresIn: '1 hour',
      algorithm: 'RS256',
    });
    return token;
  }

  private async createEnvelope(args: IEnvelopeArgs, token: string) {
    const clientUserId = this.configService.get<string>('DOCUSIGN_USERID');
    const matchId = this.configService.get<string>('DOCUSIGN_RANDOM_ID');
    const backendUrl = this.configService.get<string>('BACKEND_URL');
    const bodyData = {
      emailSubject: 'Please sign this loan agreement',
      emailMessage: '',
      status: 'sent',
      compositeTemplates: [],
      eventNotification: {
        url: `${backendUrl}/loan-agreement/connect/TjA1NjAtZm/webhooks/${matchId}`,
        requireAcknowledgment: 'true',
        loggingEnabled: 'true',
        deliveryMode: 'SIM',
        includeHMAC: 'true',
        events: ['recipient-completed'],
        eventData: {
          version: 'restv2.1',
          format: 'json',
          includeData: ['recipients'],
        },
      },
    };
    const loanAgreementTemplateData = {
      serverTemplates: [
        {
          sequence: 1,
          templateId: args.loanAgreementTemplateId,
        },
      ],
      inlineTemplates: [
        {
          sequence: 2,
          recipients: {
            signers: [
              {
                email: args.borrowerEmail,
                name: args.borrowerName,
                recipientId: '1',
                roleName: args.roleName1,
                clientUserId,
                tabs: this.createTemplateTabs(args.financingContractDocData),
              },
              {
                email: args.ceoEmail,
                name: args.ceoName,
                recipientId: '4',
                roleName: args.roleName4,
                clientUserId,
                tabs: this.createTemplateTabs(args.orkaCeoContractData),
              },
            ],
          },
        },
      ],
    };

    bodyData.compositeTemplates.push(loanAgreementTemplateData);

    if (args.isAchAuthFormAvailable) {
      const borrowerAchAuthTemplateData = {
        serverTemplates: [
          {
            sequence: 1,
            templateId: args.achAuthFormTemplateId,
          },
        ],
        inlineTemplates: [
          {
            sequence: 2,
            recipients: {
              signers: [
                {
                  email: args.borrowerEmail,
                  name: args.borrowerName,
                  recipientId: '1',
                  roleName: args.roleName1,
                  clientUserId,
                  tabs: this.createTemplateTabs(args.achAuthFormData),
                },
                {
                  email: args.ceoEmail,
                  name: args.ceoName,
                  recipientId: '2',
                  roleName: args.roleName4,
                  clientUserId,
                  tabs: this.createTemplateTabs({
                    ...args['achAuthFormData'][`ceoPlaceholder`],
                  }),
                },
              ],
            },
          },
        ],
      };

      bodyData.compositeTemplates.push(borrowerAchAuthTemplateData);
    }

    const borrowerGuarantorTemplateData = {
      serverTemplates: [
        {
          sequence: 1,
          templateId: args.borrowerGuarantorTemplateId,
        },
      ],
      inlineTemplates: [
        {
          sequence: 2,
          recipients: {
            signers: [
              {
                email: args.borrowerEmail,
                name: args.borrowerName,
                recipientId: '1',
                roleName: args.roleName1,
                clientUserId,
                tabs: this.createTemplateTabs(args.borrowerGuarantorData),
              },
              {
                email: args.ceoEmail,
                name: args.ceoName,
                recipientId: '2',
                roleName: args.roleName4,
                clientUserId,
                tabs: this.createTemplateTabs({
                  ...args['borrowerGuarantorData'][`ceoPlaceholder`],
                }),
              },
            ],
          },
        },
      ],
    };

    bodyData.compositeTemplates.push(borrowerGuarantorTemplateData);

    if (args.totalAdditionalGuarantor > 0) {
      const loanAgreementSigners =
        loanAgreementTemplateData.inlineTemplates[0].recipients.signers;
      for (let i = 1; i <= args.totalAdditionalGuarantor; i++) {
        const additionalGuarantorTemplate = {
          serverTemplates: [
            {
              sequence: 1,
              templateId: args[`additionalGuarantor${i}TemplateId`],
            },
          ],
          inlineTemplates: [
            {
              sequence: 2,
              recipients: {
                signers: [
                  {
                    email: args[`guarantySignerEmail${i}`],
                    name: args[`guarantySignerName${i}`],
                    recipientId: `${i}`,
                    roleName: args[`roleName${i + 1}`],
                    tabs: this.createTemplateTabs(
                      args[`additionalGuarantor${i}Data`],
                    ),
                  },
                  {
                    email: args.ceoEmail,
                    name: args.ceoName,
                    recipientId: '4',
                    roleName: args.roleName4,
                    clientUserId,
                    tabs: this.createTemplateTabs({
                      ...args[`additionalGuarantor${i}Data`][`ceoPlaceholder`],
                    }),
                  },
                ],
              },
            },
          ],
        };

        loanAgreementSigners.push({
          email: args[`guarantySignerEmail${i}`],
          name: args[`guarantySignerName${i}`],
          recipientId: `${i + 1}`,
          roleName: args[`roleName${i + 1}`],
          clientUserId: '',
          tabs: this.createTemplateTabs({
            ...args['financingContractDocData'][
              `additionalGuarantor${i}Placeholder`
            ],
          }),
        });

        bodyData.compositeTemplates.push(additionalGuarantorTemplate);
      }
    }

    const baseUrl = this.configService.get<string>('DOCUSIGN_BASEURL');
    const apiVersion = this.configService.get<string>('DOCUSIGN_APIVERSION');
    const accountId = this.configService.get<string>('DOCUSIGN_ACCOUNTID');
    const url = `${baseUrl}/${apiVersion}/accounts/${accountId}/envelopes`;
    const results = await axios.post(url, bodyData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return results;
  }

  private createTemplateTabs(data) {
    let textTabs = [];

    for (const tabData of Object.values(data)) {
      //@ts-ignore
      if (tabData.type === 'Text') {
        textTabs.push({
          //@ts-ignore
          tabLabel: `\\*${tabData.tabLabel}`,
          //@ts-ignore
          value: tabData.value,
        });
      }
    }

    return {
      textTabs,
    };
  }

  private async createRecipientView(envelopeId: string, args: IArgs): Promise<string> {
    const accountId = this.configService.get<string>('DOCUSIGN_ACCOUNTID');
    const baseUrl = this.configService.get<string>('DOCUSIGN_BASEURL');
    const clientId = this.configService.get<string>('DOCUSIGN_USERID');
    const dsApiClient = new docusign.ApiClient();

    dsApiClient.setBasePath(baseUrl);
    dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);

    const envelopesApi = new docusign.EnvelopesApi(dsApiClient);

    // @ts-ignore
    let recipientViewRequest = new docusign.RecipientViewRequest();

    recipientViewRequest.returnUrl = args.dsReturnUrl;
    recipientViewRequest.authenticationMethod = 'none';
    recipientViewRequest.email = args.viewerEmail;
    recipientViewRequest.userName = args.viewerName;    
    recipientViewRequest.clientUserId = clientId;

    const result = await envelopesApi.createRecipientView(accountId, envelopeId, { recipientViewRequest });

    return result.url;
  }
}
