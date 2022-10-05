export type docusignTabType =
  | 'CheckBox'
  | 'Date'
  | 'DateSigned'
  | 'FullName'
  | 'SignHere'
  | 'Text';

export interface docusignStringField {
  type: docusignTabType;
  tabLabel: string;
  value: string;
}

export interface docusignNumberField {
  type: docusignTabType;
  tabLabel: string;
  value: number;
}

export interface docusignWithoutValue {
  type: docusignTabType;
  tabLabel: string;
}

export interface IFinancingContractBorrowerData {
  borrowerCmpName: docusignStringField;
  contractorName: docusignStringField;
  documentNumber: docusignStringField;
  envelopeCreationDate: docusignStringField;
  maxLoanAmt: docusignNumberField;
  originationFee: docusignNumberField;
  interestRate: docusignNumberField;
  loanTermMonths: docusignNumberField;
  m1Amt: docusignNumberField;
  m2Amt: docusignNumberField;
  m3Amt: docusignNumberField;
  checkMonthlyPmt: docusignNumberField;
  achMonthlyPmt: docusignNumberField;
  targetPrepay1: docusignNumberField;
  targetPrepay2: docusignNumberField;
  reamortXTimesPerYear: docusignNumberField;
  prepayToReamortDollar: docusignNumberField;
  prepayToReamortPercentage: docusignNumberField;
  projectContractorName: docusignStringField;
  projectLocation: docusignStringField;
  moduleMfg: docusignStringField;
  inverterMfg: docusignStringField;
  batteryMfg: docusignStringField;
  totalInstallmentContract: docusignNumberField;
  optionalTargetPrepay: docusignNumberField;
  optionalReamortXTimesPerYear: docusignNumberField;
  optionalPrepayToReamortDollar: docusignNumberField;
  optionalPrepayToReamortPercentage: docusignNumberField;
  signedBorrowerCmpName: docusignStringField;
  customerSignature: docusignWithoutValue;
  customerSignedDate: docusignWithoutValue;
  customerSignerName: docusignStringField;
  customerSignerTitle: docusignStringField;
  additionalGuarantor1Placeholder: docusignStringField;
  additionalGuarantor2Placeholder: docusignStringField;
}

export interface IFinancingContractCeoData {
  orkaCeoSignature: docusignWithoutValue;
  orkaCeoSignedData: docusignWithoutValue;
  orkaCeoFullName?: docusignStringField;
  orkaCeoTitle?: docusignStringField;
}

export interface IPersonalGuarantor {
  envelopeCreationDate: docusignStringField;
  guarantorName: docusignStringField;
  envelopeCreationDate2: docusignStringField;
  borrowerCmpName: docusignStringField;
  guarantorSignature: docusignWithoutValue;
  guarantorSignedDate: docusignWithoutValue;
  guarantorName2: docusignStringField;
  guarantorAddress: docusignStringField;
  guarantorPhone: docusignStringField;
  guarantorEmail: docusignStringField;
  ceoPlaceholder: docusignStringField;
}

export interface IAchAuthForm {
  customerName: docusignStringField;
  documentNumber: docusignStringField;
  nameOnAccount: docusignStringField;
  bankAccNo: docusignStringField;
  abaNo: docusignStringField;
  bankName: docusignStringField;
  bankCity: docusignStringField;
  bankState: docusignStringField;
  bankZip: docusignStringField;
  accountType: docusignStringField;
  customerSignature: docusignWithoutValue;
  customerName1: docusignStringField;
  customerSignedDate: docusignWithoutValue;
  ceoPlaceholder: docusignStringField;
}

export interface IEnvelopeArgs {
  borrowerEmail: string;
  borrowerName: string;
  ceoEmail: string;
  ceoName: string;
  guarantySignerEmail1?: string;
  guarantySignerName1?: string;
  guarantySignerEmail2?: string;
  guarantySignerName2?: string;
  roleName1: string;
  roleName2?: string;
  roleName3?: string;
  roleName4: string;
  financingContractDocData: IFinancingContractBorrowerData;
  orkaCeoContractData: IFinancingContractCeoData;
  borrowerGuarantorData: IPersonalGuarantor;
  totalAdditionalGuarantor: number;
  isAchAuthFormAvailable: boolean;
  loanAgreementTemplateId: string;
  borrowerGuarantorTemplateId: string;
  achAuthFormData?: IAchAuthForm;
  achAuthFormTemplateId?: string;
  additionalGuarantor1Data?: IPersonalGuarantor;
  additionalGuarantor2Data?: IPersonalGuarantor;
  additionalGuarantor1TemplateId?: string;
  additionalGuarantor2TemplateId?: string;
}

export interface IArgs {
  accessToken: string;
  viewerEmail: string;
  viewerName: string;
  dsReturnUrl: string;
  envelopeId?: string;
  envelopeArgs?: IEnvelopeArgs;
}

export interface EmbeddedEnvelopeSigningResponse {
  envelopeId: string;
  redirectUrl: string;
}
