export type InternalRole = 'INTERNAL_STAFF_ADMIN' | 'UNDERWRITER' | 'OPERATIONS' | 'STRATEGIST' | 'CUSTOM' | string;

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  phone: string;
  jobTitle: string;
  department: string;
  role: InternalRole;
  avatar?: string;
  active: boolean;
  notes?: string;
  roleId?: string;
  discordUsername?: string;
  discordUserId?: string;
}

export interface UserRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isSystem?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type PipelineStage =
  | 'NEW_LEAD'
  | 'SALES_CONTACT'
  | 'APPLICATION_SENT'
  | 'APPLICATION_RECEIVED'
  | 'DOCUMENT_REQUEST'
  | 'DOCUMENTS_PENDING'
  | 'DOCUMENTS_RECEIVED'
  | 'VERIFICATION_PENDING'
  | 'VERIFICATION_IN_PROGRESS'
  | 'VERIFICATION_COMPLETE'
  | 'UNDERWRITING'
  | 'READY_FOR_LENDER'
  | 'SUBMITTED_TO_LENDER'
  | 'PRE_APPROVED'
  | 'APPROVED'
  | 'CONDITIONS_DOCUMENTS'
  | 'FUNDED'
  | 'COMMISSION_PENDING'
  | 'COMMISSION_RECEIVED'
  | 'NOT_QUALIFIED'
  | 'DECLINED'
  | 'LOST'
  | 'WITHDRAWN';

export type FundingProductType =
  | 'Revenue Funding'
  | 'Personal Term Loan'
  | 'HELOC'
  | 'HEI'
  | 'Business Term Loan'
  | 'Business Line of Credit'
  | 'Equipment Financing'
  | '0% Business Credit Cards'
  | '0% Business Cards & Lines of Credit'
  | 'SBA Loan'
  | 'Other Valid Product'
  | string;

export type VerificationStatusType =
  | 'Matches Application'
  | 'Client Corrected It'
  | 'Verified'
  | 'Unverified'
  | 'Needs Correction'
  | 'PENDING';

export interface Lead {
  id: string;
  ghlContactId?: string;
  ghlOpportunityId?: string;
  createdAt: string;
  updatedAt: string;
  leadSource: string;
  referralPartner?: string;
  assignedSalesRep: string;
  firstName: string;
  lastName: string;
  businessName: string;
  email: string;
  phone: string;
  state: string;
  industry: string;
  status: PipelineStage;
  notes?: string;
  lastContact?: string;
  nextFollowUp?: string;
  applicationStatus: 'NOT_STARTED' | 'SENT' | 'IN_PROGRESS' | 'SUBMITTED' | 'REVIEWED';
  ghlSyncStatus: 'SYNCED' | 'PENDING' | 'FAILED' | 'NOT_CONNECTED';
  estimatedAmount?: number;
}

export interface Client {
  id: string;
  // Identity
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  ssn: string;
  dob: string;
  address: string;
  city: string;
  state: string;
  zip: string;

  // Business
  businessName: string;
  dba?: string;
  businessPhone: string;
  businessEmail: string;
  businessAddress: string;
  businessCity: string;
  businessState: string;
  businessZip: string;
  industry: string;
  businessStartDate: string;
  businessStartDateUnderCurrentOwnership?: string;
  federalTaxId: string;
  stateOfOrganization: string;
  entityType?: string;
  annualRevenue: number;
  monthlyRevenue?: number;
  ownershipPercentage: number;
  ownerTitle?: string;
  businessDescription: string;

  // CRM
  ghlContactId?: string;
  ghlOpportunityId?: string;
  leadSource: string;
  referralPartner?: string;
  assignedSalesRep: string;

  // Operations
  assignedStaff: string;
  currentStatus: PipelineStage;
  createdAt: string;
  updatedAt: string;

  // Financial request details
  requestedAmount: number;
  requestedProduct: FundingProductType;
  useOfFunds?: string;
  creditScore: number;
  existingLoans?: string;
  existingMcas?: string;
  lenderBalances?: string;
  bankruptcy?: 'None' | 'Chapter 7' | 'Chapter 13' | 'Dismissed';
  foreclosure?: 'None' | 'Yes' | 'Within 3 Years';
  repossession?: 'None' | 'Yes' | 'Within 3 Years';

  // Verification summaries
  isVerified?: boolean;
  verifiedBy?: string;
  verificationDate?: string;
  verificationSummary?: string;

  // Underwriting summaries
  isUnderwritten?: boolean;
  underwrittenBy?: string;
  underwritingDecision?: 'QUALIFIED' | 'PRE_APPROVED' | 'APPROVED' | 'NOT_QUALIFIED' | 'NEEDS_DOCS';
  underwritingNotes?: string;
  stateOfIncorporation?: string;
  documents?: DocumentItem[];
  recommendedAmount?: number;
  recommendedProduct?: FundingProductType;
}

export interface FundingDeal {
  id: string;
  clientId: string;
  clientName: string;
  businessName: string;
  applicationId?: string;
  product: FundingProductType;
  fundingAmount: number;
  fee: number; // e.g. Origination / closing fee $
  percentage: number; // Commission percentage (e.g., 6.9%)
  termLength: string; // e.g., "12 Months", "24 Months", "60 Months"
  status: 'PROPOSED' | 'SUBMITTED' | 'PRE_APPROVED' | 'APPROVED' | 'CONDITIONS_MET' | 'FUNDED' | 'DECLINED' | 'WITHDRAWN';
  assignedStaff: string;
  lenderStatus: 'PENDING' | 'SUBMITTED' | 'PRE_APPROVED' | 'APPROVED' | 'NOT_QUALIFIED' | 'ADDITIONAL_INFO_REQUESTED';
  lenderName: string;
  lenderContact: string;
  fundingDate?: string;
  commissionStatus: 'PENDING' | 'COLLECTED' | 'DISTRIBUTED' | 'PARTIALLY_DISTRIBUTED';
  commissionReceivedDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  isStacked?: boolean;
}

export type CommissionParticipantType =
  | 'Internal Staff'
  | 'Referral Partner'
  | 'Broker Partner'
  | 'Business Partner'
  | 'Outside Partner'
  | 'Other';

export interface CommissionParticipant {
  id: string;
  dealId: string;
  participantDirectoryId?: string;
  name: string;
  type: CommissionParticipantType;
  role: string;
  points: number; // Points in percentage, e.g. 1.475 for 1.475%
  dollarAmount: number; // Computed: fundingAmount * (points / 100)
  notes?: string;
  status: 'PENDING' | 'RECEIVED' | 'DISTRIBUTED';
  receivedDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommissionDirectoryEntry {
  id: string;
  name: string;
  type: CommissionParticipantType;
  role: string;
  email: string;
  phone: string;
  company?: string;
  defaultPoints?: number;
  notes?: string;
  active: boolean;
}

// ----------------------------------------------------
// TASK SYSTEM
// ----------------------------------------------------
export type TaskPriority = 'High' | 'Medium' | 'Low';
export type PriorityLevel = TaskPriority;
export type TaskStatus = 'To Do' | 'In Progress' | 'Completed' | 'Snoozed';
export type TaskReminder = '15 minutes before' | '30 minutes before' | '1 hour before' | '1 day before' | 'Custom' | 'None';
export type TaskCategory =
  | 'Client'
  | 'Application'
  | 'Verification'
  | 'Underwriting'
  | 'Funding Deal'
  | 'Lender'
  | 'Commission'
  | 'Funding Strategy'
  | 'General';

export interface InternalTask {
  id: string;
  title: string;
  description?: string;
  clientId?: string;
  clientName?: string;
  dealId?: string;
  dealTitle?: string;
  dealName?: string;
  category?: TaskCategory;
  assignedTo: string; // Staff member name or id
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:MM
  priority: TaskPriority;
  status: TaskStatus;
  reminder: TaskReminder;
  notes?: string;
  createdBy: string;
  createdDate: string;
  updatedAt: string;
  snoozedUntil?: string;
  completedAt?: string;
}

// ----------------------------------------------------
// NOTIFICATIONS
// ----------------------------------------------------
export type NotificationType =
  | 'TASK_REMINDER'
  | 'TASK_DUE'
  | 'HIGH_PRIORITY_TASK'
  | 'TASK_OVERDUE'
  | 'NEW_LEAD'
  | 'VERIFICATION_COMPLETE'
  | 'UNDERWRITING_READY'
  | 'PRE_APPROVAL'
  | 'APPROVAL'
  | 'FUNDED'
  | 'COMMISSION_RECEIVED'
  | 'SYSTEM_ALERT';

export interface AppNotification {
  id: string;
  userId: string; // Target user or 'all'
  title: string;
  message: string;
  type: NotificationType;
  priority: TaskPriority;
  isRead: boolean;
  createdAt: string;
  targetType?: 'client' | 'task' | 'deal' | 'general';
  targetId?: string;
}

// ----------------------------------------------------
// FUNDING STRATEGY (ACTIVE & HISTORICAL)
// ----------------------------------------------------
export interface FundingStrategyRecord {
  id: string;
  clientId: string;
  currentSituation: string;
  strategy: string;
  nextSteps: string;
  productsToPursue?: string;
  problemsToSolve?: string;
  missingDocuments?: string;
  creditIssues?: string;
  lenderStrategy?: string;
  assignedTo: string;
  priority: TaskPriority;
  nextReviewDate: string;
  strategyStatus: 'Active' | 'Under Review' | 'Completed' | 'Archived';
  strategyNotes?: string;
  createdBy: string;
  createdDate: string;
  updatedAt: string;
  isActive: boolean;
}

// ----------------------------------------------------
// INTERNAL NOTES
// ----------------------------------------------------
export type InternalNoteCategory =
  | 'General'
  | 'Sales'
  | 'Verification'
  | 'Underwriting'
  | 'Lender'
  | 'Funding'
  | 'Commission'
  | 'Strategy'
  | 'Task';

export interface ClientInternalNote {
  id: string;
  clientId: string;
  author: string;
  type?: InternalNoteCategory;
  category?: string;
  content: string;
  isPinned?: boolean;
  createdAt?: string;
  timestamp?: string;
}

// ----------------------------------------------------
// LENDER HISTORY
// ----------------------------------------------------
export type LenderHistoryStatus =
  | 'Not Sent'
  | 'Sent'
  | 'Under Review'
  | 'More Information Requested'
  | 'Pre-Approved'
  | 'Approved'
  | 'Not Qualified'
  | 'Declined'
  | 'Withdrawn';

export interface LenderHistoryRecord {
  id: string;
  clientId: string;
  dealId?: string;
  lenderName: string;
  fundingProduct: FundingProductType;
  dateSent: string;
  sentBy: string;
  status: LenderHistoryStatus;
  response?: string;
  amount?: number;
  terms?: string;
  conditions?: string;
  requiredDocuments?: string;
  lenderNotes?: string;
  responseDate?: string;
  nextStep?: string;
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------
// CREDIT CARDS (BUSINESS & PERSONAL)
// ----------------------------------------------------
export interface CreditCardRecord {
  id: string;
  clientId: string;
  cardCategory: 'BUSINESS' | 'PERSONAL';
  cardType?: string; // Visa, Mastercard, Amex, Discover
  issuer: string; // Chase, Amex, Capital One, Citi, etc.
  cardName: string; // e.g., Chase Ink, Amex Business Gold, Sapphire
  cardholder: string;
  creditLimit: number;
  currentBalance: number;
  availableCredit: number;
  monthlyPayment: number;
  utilization: number; // percentage
  openedDate?: string;
  lastFourDigits?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------
// EXISTING DEBT
// ----------------------------------------------------
export interface ExistingDebtRecord {
  id: string;
  clientId: string;
  lender: string;
  loanType: 'MCA' | 'SBA Loan' | 'Business Line of Credit' | 'Equipment Financing' | 'Term Loan' | 'Other';
  originalLoanAmount: number;
  termMonths: number;
  monthlyPayment: number;
  currentBalance: number;
  status: string;
  notes?: string;
}

// ----------------------------------------------------
// RECENT CREDIT ACTIVITY
// ----------------------------------------------------
export interface RecentCreditActivityRecord {
  id: string;
  clientId: string;
  lender: string;
  dateApplied: string;
  amountRequested: number;
  product: string;
  approved: boolean;
  result: 'Approved' | 'Not Approved';
  notes?: string;
}

// ----------------------------------------------------
// MASTER VERIFICATION WORKSHEET
// ----------------------------------------------------
export interface MasterVerificationField {
  asApplied: string;
  verified: string;
  status: VerificationStatusType;
  notes: string;
  script?: string;
}

export interface EmploymentSalaryPayrollVerification {
  sectionStatus: 'Pending' | 'In Progress' | 'Verified' | 'Needs Correction' | 'Unverified';

  // Group 1: Employment Status
  currentlyWorking: MasterVerificationField;
  selfEmployed: MasterVerificationField;
  employedByAnotherCompany: MasterVerificationField;

  // Group 2: If Currently Working / Details
  employerName: MasterVerificationField;
  jobTitle: MasterVerificationField;
  jobOccupation: MasterVerificationField;
  jobDescription: MasterVerificationField;
  employmentStartDate: MasterVerificationField;
  yearsWithEmployer: MasterVerificationField;
  employmentTypeStatus: MasterVerificationField; // Full-Time | Part-Time | Contract | Seasonal | Other

  // Group 3: Employment Income
  annualSalary: MasterVerificationField;
  monthlySalary: MasterVerificationField;
  annualEmploymentIncome: MasterVerificationField;
  monthlyEmploymentIncome: MasterVerificationField;
  otherMonthlyIncome: MasterVerificationField;
  otherIncomeSource: MasterVerificationField;

  // Group 4: Pay Stub & Payroll
  receivesPayStubs: MasterVerificationField;
  paidThroughPayroll: MasterVerificationField;
  payFrequency: MasterVerificationField;
  mostRecentPayStubDate: MasterVerificationField;
  payStubReceived: MasterVerificationField;
  payStubReviewed: MasterVerificationField;

  // Group 5 & 6: Notes & Red Flags
  employmentIncomeNotes: string;
  redFlags: string;

  updatedAt?: string;
  updatedBy?: string;
}

export interface MasterVerificationData {
  id: string;
  clientId: string;
  verificationSpecialist: string;
  date: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'VERIFIED' | 'UNVERIFIED' | 'NEEDS_CORRECTION';
  overallResult: 'APPROVED_FOR_UNDERWRITING' | 'NEEDS_MORE_INFO' | 'HIGH_RISK_DECLINED' | 'PENDING_DOCS';
  callSummary: string;
  internalNotesRedFlags: string;

  // Pre-Call Review Checklist (17 items)
  preCallReview: {
    clientName: boolean;
    businessName: boolean;
    phone: boolean;
    email: boolean;
    businessAddress: boolean;
    entityType: boolean;
    ein: boolean;
    timeInBusiness: boolean;
    ownershipPercentage: boolean;
    monthlyRevenue: boolean;
    personalAnnualIncome: boolean;
    requestedFunding: boolean;
    purposeOfFunds: boolean;
    uploadedDocuments: boolean;
    ssn: boolean;
    dob: boolean;
    stateOfIncorporation: boolean;
    creditScore: boolean;
    missingInfoNotes: string;
  };

  // Opening Script
  openingScript: {
    answered: boolean;
    continueNow: boolean; // Yes continue / No reschedule
    rescheduleDate?: string;
    rescheduleNotes?: string;
  };

  // Identity Verification
  identity: {
    legalName: MasterVerificationField;
    phone: MasterVerificationField;
    email: MasterVerificationField;
    dob: MasterVerificationField;
    ssnLast4: MasterVerificationField;
  };

  // Business Verification
  business: {
    businessName: MasterVerificationField;
    dba: MasterVerificationField;
    businessAddress: MasterVerificationField;
    ein: MasterVerificationField;
    stateOfIncorporation: MasterVerificationField;
    entityType: MasterVerificationField;
    businessStartDate: MasterVerificationField;
    timeInBusiness: MasterVerificationField;
    industry: MasterVerificationField;
    businessDescription: MasterVerificationField;
    ownershipPercentage: MasterVerificationField;
    ownerTitle: MasterVerificationField;
  };

  // Employment
  employment: {
    selfEmployedOnly: boolean;
    alsoEmployedFullTime: boolean;
    employer: string;
    position: string;
    yearsEmployed: string;
    employmentStartDate: string;
    employmentStatus: string;
    annualSalary: number;
    monthlySalary: number;
    payFrequency: string;
    otherEmploymentIncome: string;
    employmentNotes: string;
    redFlags: string;
  };

  // Dedicated Employment, Salary & Payroll Verification Section
  employmentVerification?: EmploymentSalaryPayrollVerification;

  // Income Verification
  income: {
    personalAnnualIncome: number;
    monthlyBusinessRevenue: number;
    verifiedPersonalAnnualIncome: number;
    verifiedMonthlyBusinessRevenue: number;
    exactCreditScore: number; // MUST BE EXACT NUMERIC SCORE
    revenueTrend: 'Consistent' | 'Increased' | 'Decreased';
    revenueTrendExplanation: string;
    incomeNotes: string;
    redFlags: string;
  };

  // Payroll / Pay Stub
  payroll: {
    paysSelfThroughPayroll: boolean;
    issuesPayStubs: boolean;
    salary: number;
    grossPay: number;
    netPay: number;
    payFrequency: string;
    payrollStartDate: string;
    latestPayStubDate: string;
    payStubReceived: boolean;
    payStubReviewed: boolean;
    payrollNotes: string;
    redFlags: string;
  };

  // Banking
  banking: {
    primaryBank: string;
    dedicatedBusinessChecking: boolean;
    businessAccount: string;
    personalAccountUsedForBusiness: boolean;
    businessIncomeDepositedIntoPersonal: boolean;
    regularBusinessToPersonalTransfers: boolean;
    transferFrequency: string;
    approximateTransferAmount: number;
    bankingExplanation: string;
    bankingNotes: string;
    redFlags: string;
  };

  // Documents Checklist (8 categories)
  documentChecklist: Record<
    string,
    {
      received: boolean;
      stillNeeded: boolean;
      sentAfterCall: boolean;
      reviewed: boolean;
      reviewedBy?: string;
      reviewedDate?: string;
      notes?: string;
    }
  >;

  // Existing Debt (at least 5 records)
  existingDebts: ExistingDebtRecord[];
  bankruptcyForeclosureRepossession5Years: boolean;
  bankruptcyForeclosureNotes?: string;

  // Credit Cards (Business + Personal)
  creditCards: CreditCardRecord[];

  // Recent Credit Activity (5 records)
  recentCreditActivity: RecentCreditActivityRecord[];

  // Housing
  housing: {
    homeAddressSameAsBusiness: boolean;
    homeAddressIfDifferent: string;
    housingType: 'Homeowner' | 'Renter' | 'Other';
    monthlyMortgageOrRent: number;
    housingNotes: string;
    redFlags: string;
  };

  // Funding Request
  fundingRequest: {
    requestedAmount: number;
    verifiedRequestedAmount: number;
    purposeOfFunds:
      | 'Working Capital'
      | 'Equipment Purchase'
      | 'Payroll'
      | 'Expansion / Growth'
      | 'Debt Consolidation / Refinance'
      | 'Inventory'
      | 'Marketing'
      | 'Other';
    fundingUrgency: 'Immediately' | 'This Week' | 'This Month';
    purposeNotes: string;
    redFlags: string;
  };

  // Credit Verification
  creditVerification: {
    exactCreditScore: number;
    creditUnlocked: boolean;
    fraudAlert: boolean;
    securityFreeze: boolean;
    creditNotes: string;
    redFlags: string;
  };

  // Final Underwriter Summary
  underwriterSummary: {
    overallImpression: 'Excellent' | 'Good' | 'Fair' | 'Needs More Info' | 'High Risk';
    biggestStrength: string;
    biggestConcern: string;
    cashFlowNotes: string;
    businessStabilityNotes: string;
    additionalDocumentsNeeded: string;
    readyForSubmission: boolean;
    reasonIfNo: string;
  };

  // Final 11 Verification Checkboxes
  finalChecklist: {
    identityVerified: boolean;
    businessVerified: boolean;
    incomeVerified: boolean;
    employmentVerified: boolean;
    bankingVerified: boolean;
    documentsReceived: boolean;
    existingDebtReviewed: boolean;
    housingVerified: boolean;
    fundingAmountConfirmed: boolean;
    creditAvailableForPull: boolean;
    fileReadyForUnderwriting: boolean;
  };

  updatedAt: string;
}

// ----------------------------------------------------
// DISCORD & FIREBASE CONFIG
// ----------------------------------------------------
export interface DiscordEventConfig {
  taskAssigned?: boolean;
  taskReminder?: boolean;
  highPriorityTaskCreated?: boolean;
  highPriorityTaskDue?: boolean;
  taskOverdue?: boolean;
  newLead?: boolean;
  leadCreated?: boolean;
  verificationComplete?: boolean;
  clientVerified?: boolean;
  underwritingReady?: boolean;
  preApprovalReceived?: boolean;
  approvalReceived?: boolean;
  clientFunded?: boolean;
  dealFunded?: boolean;
  commissionReceived?: boolean;
  commissionCollected?: boolean;
}

export interface DiscordConfig {
  webhookUrl: string;
  channelName?: string;
  botUsername?: string;
  mentionRole?: string;
  enabled: boolean;
  events: DiscordEventConfig;
  lastTestedAt?: string;
  lastTestStatus?: 'SUCCESS' | 'FAILED';
}

export interface FirebaseClientConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  isConfigured: boolean;
  lastVerifiedAt?: string;
}

export interface VerificationFieldRecord {
  id: string;
  clientId: string;
  fieldKey: string;
  fieldLabel: string;
  category: 'CLIENT' | 'BUSINESS' | 'FUNDING';
  originalValue: string;
  verifiedValue: string;
  status: VerificationStatusType;
  notes?: string;
  scriptText?: string;
  updatedBy: string;
  updatedAt: string;
}

export interface VerificationScript {
  id: string;
  fieldKey: string;
  fieldLabel: string;
  scriptText: string;
  category: 'CLIENT' | 'BUSINESS' | 'FUNDING';
}

export interface VerificationAuditLog {
  id: string;
  clientId: string;
  verifier: string;
  timestamp: string;
  field: string;
  previousValue: string;
  newValue: string;
  status: VerificationStatusType;
  notes?: string;
}

export interface UnderwritingRecord {
  id: string;
  clientId: string;
  underwriterId: string;
  underwriterName: string;
  checklist: Record<string, 'Complete' | 'Incomplete' | 'NA'>;
  creditScore: number;
  monthlyRevenue: number;
  annualRevenue: number;
  existingDebtNotes: string;
  mcaNotes: string;
  decision: 'QUALIFIED' | 'PRE_APPROVED' | 'APPROVED' | 'NOT_QUALIFIED' | 'ADDITIONAL_INFO_REQUESTED';
  recommendedAmount: number;
  recommendedProduct: FundingProductType;
  verifiedBy: string;
  verificationDate: string;
  verificationSummary: string;
  createdAt: string;
  updatedAt: string;
}

export interface UnderwritingNote {
  id: string;
  clientId: string;
  author: string;
  authorRole: string;
  timestamp: string;
  note: string;
}

export interface LenderSubmission {
  id: string;
  clientId: string;
  dealId: string;
  lenderName: string;
  lenderContact: string;
  submissionDate: string;
  submittedBy: string;
  product: FundingProductType;
  amountRequested: number;
  documentsSubmitted: string[];
  submissionNotes?: string;
  submissionStatus: 'SUBMITTED' | 'UNDER_REVIEW' | 'PRE_APPROVED' | 'APPROVED' | 'NOT_QUALIFIED' | 'INFO_REQUESTED';
  response?: LenderResponse;
}

export interface LenderResponse {
  type: 'PRE_APPROVED' | 'APPROVED' | 'NOT_QUALIFIED' | 'INFO_REQUESTED';
  responseDate: string;
  decisionBy?: string;
  lenderNotes?: string;
  approvedAmount?: number;
  product?: FundingProductType;
  terms?: string;
  fee?: number;
  requiredDocuments?: string[];
  conditions?: string[];
  notQualifiedReason?: string;
}

export type DocumentCategoryType =
  | "Driver's License"
  | 'Bank Statements'
  | 'Tax Returns'
  | 'Voided Check'
  | 'Profit & Loss'
  | 'Articles of Incorporation'
  | 'Business License'
  | 'Pay Stubs'
  | 'Other';

export interface DocumentItem {
  id: string;
  clientId: string;
  dealId?: string;
  category: DocumentCategoryType;
  title: string;
  fileName: string;
  fileSize: string;
  fileUrl?: string;
  uploadedBy: string;
  uploadedDate: string;
  reviewedBy?: string;
  reviewedDate?: string;
  status: 'PENDING' | 'RECEIVED' | 'REVIEWED' | 'REJECTED';
  notes?: string;
}

export interface CommunicationLogItem {
  id: string;
  clientId: string;
  type:
    | 'Sales Call'
    | 'Verification Call'
    | 'Underwriting Call'
    | 'Document Request'
    | 'Client Update'
    | 'Approval Call'
    | 'Funding Call'
    | 'Other';
  staffMember: string;
  date: string;
  time: string;
  summary: string;
  notes?: string;
}

export interface TimelineEvent {
  id: string;
  clientId: string;
  dealId?: string;
  title: string;
  description: string;
  staffMember: string;
  timestamp: string;
  type: 'STATUS_CHANGE' | 'VERIFICATION' | 'UNDERWRITING' | 'LENDER' | 'FUNDING' | 'COMMISSION' | 'DOCUMENT' | 'NOTE' | 'GHL' | 'TASK' | 'STRATEGY';
}

export interface GhlConfig {
  apiKey: string;
  locationId: string;
  baseUrl: string;
  isConnected: boolean;
  lastSyncAt: string;
  lastSyncTime?: string;
  syncErrors: string[];
  autoSyncEnabled: boolean;
  fieldMappings: {
    leadSourceField: string;
    referralPartnerField: string;
    annualRevenueField: string;
    creditScoreField: string;
    requestedAmountField: string;
    productField: string;
  };
  pipelineMappings: Record<PipelineStage, string>;
}

export interface LeadSourceOption {
  id: string;
  name: string;
  isCustom: boolean;
  active: boolean;
}

export interface ReferralPartnerOption {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  active: boolean;
  defaultCommissionPoints?: number;
}


