export enum UsersRole {
  CUSTOMER = 'customer',
  ADMIN = 'admin',
  INSTALLER = 'installer',
}

export enum Flags {
  N = 'N',
  Y = 'Y',
}

export enum EmployerLanguage {
  ENGLISH = 'english',
  SPANISH = 'spanish',
}

export enum EnvelopeStatus {
  ENVELOPE_CREATED = 'ENVELOPE_CREATED',
  MAIN_CUSTOMER_PG_1_SIGNED = 'MAIN_CUSTOMER_PG_1_SIGNED',
  PG_2_SIGNED = 'PG_2_SIGNED',
  PG_3_SIGNED = 'PG_3_SIGNED',
  CEO_SIGNED = 'CEO_SIGNED',
}

export enum InstallingStatusFlags {
  documentsUploaded = 'documentsUploaded',
  verifiedAndApproved = 'verifiedAndApproved',
  milestone1Completed = 'milestone1Completed',
  milestone2Completed = 'milestone2Completed',
  milestone3Completed = 'milestone3Completed',
  projectCompleted = 'projectCompleted',
}

export enum PhaseFlag {
  new = 'New',
  underwriting = 'Underwriting',
  projectSetup = 'Project Setup',
  contracting = 'Contracting',
  construction = 'Construction',
  archived = 'Archived',
}

export enum PaymentScheduleStatusFlags {
  PAID = 'PAID',
  UNPAID = 'UNPAID',
}

export enum LoanStatus {
  approved = 'approved',
  canceled = 'canceled',
  waiting = 'waiting',
}

export enum PaymentStatusFlags {
  AUTH = 'AUTH',
  PENDING = 'PENDING',
  DECLINED = 'DECLINED',
  RETURNED = 'RETURNED',
  SETTLING = 'SETTLING',
  PAID = 'PAID',
  SCRUBBED = 'SCRUBBED',
  WAITING = 'READY',
}

export enum TypeFlags {
  MANUAL = 'MANUAL',
  AUTOMATIC = 'AUTOMATIC',
}

export enum Type {
  Yes_or_no = 'Yes_or_no',
  Value = 'Value',
  Free_style = 'Free_style',
}

export enum Condition {
  eq = '=',
  gt = '>',
  lt = '<',
  gte = '>=',
  lte = '<=',
}

export enum AuthSummary {
  SIGN_IN_SUMMARY = 'Sign in for users.',
}
export enum disbursementStatus {
  equipment_permit = 'equipment_permit',
  construction = 'construction',
  commercial_operation = 'commercial_operation',
  type4 = 'type4',
  type5 = 'type5',
}
