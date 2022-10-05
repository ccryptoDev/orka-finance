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
  approved = 'approved',
  canceled = 'canceled',
  waiting = 'waiting',
}

export enum PaymentScheduleStatusFlags {
  PAID = 'PAID',
  UNPAID = 'UNPAID',
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
