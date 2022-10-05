import { registerAs } from '@nestjs/config';

export const equifax = registerAs('equifax', () => ({
  consumerApiBaseUrl: process.env.EQUIFAX_CONSUMER_API_BASE_URL,
  consumerApiClientId: process.env.EQUIFAX_CONSUMER_API_CLIENT_ID,
  consumerApiClientSecret: process.env.EQUIFAX_CONSUMER_API_CLIENT_SECRET,
  consumerApiMemberNumber: process.env.EQUIFAX_CONSUMER_API_MEMBER_NUMBER,
  consumerApiSecurityCode: process.env.EQUIFAX_CONSUMER_API_SECURITY_CODE,
  commercialApiBaseUrl: process.env.EQUIFAX_COMMERCIAL_API_BASE_URL,
  commercialApiCustomerNumber: process.env.EQUIFAX_COMMERCIAL_API_CUSTOMER_NUMBER,
  commercialApiSecurityCode: process.env.EQUIFAX_COMMERCIAL_API_SECURITY_CODE
}));
