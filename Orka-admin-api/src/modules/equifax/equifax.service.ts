import { HttpService, Injectable } from '@nestjs/common';
import { ConfigService, ConfigType } from '@nestjs/config';

import { equifax } from '../../configs/equifax.config';

interface AuthResponse {
  access_token: string;
  token_type: 'Bearer';
  expires_in: number;
  issued_at: string;
}
interface ConsumerReportRequestData {
  firstName: string;
  lastName: string;
  socialSecurityNumber: string;
  birthDate: string;
  city: string;
  state: string;
  zipCode: string;
  houseNumber?: string;
  streetName?: string;
  phone: string;
}
export interface ConsumerReport {
  status: string;
  consumers: any; // Type whenever we have time
  links: any[]; // Type whenever we have time
}
interface CommercialReportRequestData {
  businessAddress: string;
  businessCity: string;
  businessLegalName: string;
  businessState: string;
  businessZipCode: string;
}
export interface CommercialReport {
  EfxTransmit: {
    customerReference: string;
    efxInternalTranId: string;
    serviceCode: string;
    version: string;
    ProductCode: any[]; // Type whenever we have time
    CustomerSecurityInfo: any[]; // Type whenever we have time
    StandardRequest: any[]; // Type whenever we have time
    CommercialCreditReport: {
      Header: any[]; // Type whenever we have time
      Folder: {
        DecisionTools?: {
          ScoreData?: {
            score?: string;
          }[];
        };
        FirmographicsTrait?: {
          CurrentFirm?: {
            YearsInBusiness?: number;
          }
        }[];
        ReportAttributes?: {
          PublicRecordsSummary?: {
            RecentBankruptcyDate?: string;
            RecentJudgmentDate?: string;
            RecentLienDate?: string;
          }
        }
      };
    }[];
    OFACCommercialResponse: string;
  }
}

@Injectable()
export class EquifaxService {
  private equifaxApiConfig: ConfigType<typeof equifax>;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.equifaxApiConfig = this.configService.get<ConfigType<typeof equifax>>('equifax');
  }

  public async getConsumerReport(requestData: ConsumerReportRequestData): Promise<ConsumerReport> {
    const equifaxApiToken = await this.authenticate();
    const equifaxPayload = {
      consumers: {
        name: [
          {
            identifier: 'Current',
            firstName: requestData.firstName,
            lastName: requestData.lastName,
          }
        ],
        socialNum: [
          {
            identifier: 'Current',
            number: requestData.socialSecurityNumber
          }
        ],
        dateOfBirth: requestData.birthDate,
        addresses: [
          {
            identifier: 'Current',
            city: requestData.city,
            state: requestData.state,
            houseNumber: requestData.houseNumber,
            streetName: requestData.streetName,
            zip: requestData.zipCode
          }
        ],
        phoneNumbers: [
          {
            identifier: 'Current',
            number: requestData.phone
          }
        ]
      },
      customerReferenceIdentifier: 'JSON',
      customerConfiguration: {
        equifaxUSConsumerCreditReport: {
          memberNumber: this.equifaxApiConfig.consumerApiMemberNumber,
          securityCode: this.equifaxApiConfig.consumerApiSecurityCode,
          codeDescriptionRequired: true,
          endUserInformation: {
            endUsersName: 'ALABASTER INC',
            permissiblePurposeCode: '01'
          },
          models: [
            {
              identifier: '05453'
            },
            {
              identifier: '04129'
            }
          ],
          customerCode: 'BQ81',
          multipleReportIndicator: 'F',
          ECOAInquiryType: 'Individual',
          optionalFeatureCode: ['X'],
          pdfComboIndicator: 'Y',
          vendorIdentificationCode: 'FI',
        }
      }
    };
    const { data }: { data: ConsumerReport } = await this.httpService.post(
      `${this.equifaxApiConfig.consumerApiBaseUrl}/business/consumer-credit/v1/reports/credit-report`,
      equifaxPayload,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${equifaxApiToken}`
        }
      }
    ).toPromise();

    return data;
  }

  public async getCommercialReport(requestData: CommercialReportRequestData): Promise<CommercialReport> {
    const equifaxPayload = {
      EfxCommercialRequest: {
        customerReference: 'XXXXXXXXXX',
        efxInternalTranId: 'XXXXXXXXXX',
        customerNumber: this.equifaxApiConfig.commercialApiCustomerNumber,
        securityCode: this.equifaxApiConfig.commercialApiSecurityCode,
        serviceCode: 'SB1',
        tranID: 'XSOF',
        version: '5.0',
        CustomerSecurityInfo: {
          Channel: {
            IdNumber: '3',
            Name: 'STS'
          },
          ProductCode: [
            {
              name: 'RPT',
              code: '0036',
              value: 'RPT0036'
            },
            {
              name: 'SCR',
              code: '0117',
              value: 'SCR0117'
            },
            {
              name: 'RPT',
              code: '3003',
              value: 'RPT3003'
            }
          ]
        },
        StandardRequest: {
          Folder: {
            IdTrait: {
              AddressTrait: {
                AddressLine1: requestData.businessAddress,
                City: requestData.businessCity,
                PostalCode: requestData.businessZipCode,
                State: requestData.businessState
              },
              CompanyNameTrait: {
                BusinessName: requestData.businessLegalName
              }
            }
          }
        }
      }
    };
    const { data }: { data: CommercialReport } = await this.httpService.post(
      `${this.equifaxApiConfig.commercialApiBaseUrl}/sbeppe/jsonservices/DecisionService/OrderCreditReport`,
      equifaxPayload,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    ).toPromise();

    return data;
  }

  private async authenticate(): Promise<string> {
    const encodedAuthData = Buffer
      .from(`${this.equifaxApiConfig.consumerApiClientId}:${this.equifaxApiConfig.consumerApiClientSecret}`)
      .toString('base64');
    const authData = `Basic ${encodedAuthData}`;
    const { data }: { data: AuthResponse } = await this.httpService.post(
      `${this.equifaxApiConfig.consumerApiBaseUrl}/v2/oauth/token`,
      'grant_type=client_credentials',
      {
        headers: {
          Authorization: authData,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    ).toPromise();

    return data.access_token;
  }
}
