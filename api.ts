import {
  AppNotification,
  Client,
  ClientInternalNote,
  CommissionDirectoryEntry,
  CommissionParticipant,
  CreditCardRecord,
  DiscordConfig,
  DocumentItem,
  ExistingDebtRecord,
  FirebaseClientConfig,
  FundingDeal,
  FundingStrategyRecord,
  GhlConfig,
  InternalTask,
  Lead,
  LeadSourceOption,
  LenderHistoryRecord,
  LenderSubmission,
  MasterVerificationData,
  RecentCreditActivityRecord,
  ReferralPartnerOption,
  StaffUser,
  UnderwritingNote,
  UnderwritingRecord,
  UserRole,
  VerificationAuditLog,
  VerificationFieldRecord,
  VerificationScript,
} from '../types';

const API_BASE = '/api';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    let errorDetail = 'API request failed';
    try {
      const err = await res.json();
      errorDetail = err.error || err.message || errorDetail;
    } catch {
      // ignore
    }
    throw new Error(errorDetail);
  }

  return res.json();
}

export const api = {
  // Health
  checkHealth: () => request<{ status: string; clientCount: number; dealsCount: number }>('/health'),

  // Auth & Staff Management
  getStaff: () => request<StaffUser[]>('/staff'),
  login: (email: string, password?: string) => request<{ success: boolean; user: StaffUser; token: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }),
  createStaffUser: (data: Partial<StaffUser>) => request<StaffUser>('/staff', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateStaffUser: (id: string, data: Partial<StaffUser> & { currentPassword?: string; newPassword?: string }) => request<StaffUser>(`/staff/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  // Role Management
  getRoles: () => request<UserRole[]>('/roles'),
  createRole: (data: Partial<UserRole>) => request<UserRole>('/roles', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateRole: (id: string, data: Partial<UserRole>) => request<UserRole>(`/roles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  // Global Search
  search: (query: string) => request<{ clients: Client[]; leads: Lead[]; deals: FundingDeal[] }>(`/search?q=${encodeURIComponent(query)}`),

  // Leads
  getLeads: () => request<Lead[]>('/leads'),
  createLead: (lead: Partial<Lead>) => request<Lead>('/leads', {
    method: 'POST',
    body: JSON.stringify(lead),
  }),
  updateLead: (id: string, lead: Partial<Lead>) => request<Lead>(`/leads/${id}`, {
    method: 'PUT',
    body: JSON.stringify(lead),
  }),
  deleteLead: (id: string) => request<{ success: boolean }>(`/leads/${id}`, {
    method: 'DELETE',
  }),
  convertLeadToClient: (leadId: string, customData?: Record<string, any>) => request<{ success: boolean; client: Client; deal: FundingDeal }>(`/leads/${leadId}/convert-to-client`, {
    method: 'POST',
    body: JSON.stringify(customData || {}),
  }),

  // Clients
  getClients: () => request<Client[]>('/clients'),
  getClientDetail: (id: string) => request<{
    client: Client;
    deals: FundingDeal[];
    verifications: VerificationFieldRecord[];
    verificationAudit: VerificationAuditLog[];
    underwriting?: UnderwritingRecord;
    notes: UnderwritingNote[];
    submissions: LenderSubmission[];
    documents: DocumentItem[];
    communications: any[];
    timeline: any[];
    commissions: CommissionParticipant[];
    masterVerification?: MasterVerificationData;
    fundingStrategies?: FundingStrategyRecord[];
    internalNotes?: ClientInternalNote[];
    lenderHistory?: LenderHistoryRecord[];
    creditCards?: CreditCardRecord[];
    tasks?: InternalTask[];
  }>(`/clients/${id}`),
  createClient: (client: Partial<Client>) => request<Client>('/clients', {
    method: 'POST',
    body: JSON.stringify(client),
  }),
  updateClient: (id: string, client: Partial<Client>) => request<Client>(`/clients/${id}`, {
    method: 'PUT',
    body: JSON.stringify(client),
  }),
  deleteClient: (id: string) => request<{ success: boolean }>(`/clients/${id}`, {
    method: 'DELETE',
  }),
  auditSsnView: (clientId: string, staffName: string) => request<{ success: boolean }>(`/clients/${clientId}/audit-ssn-view`, {
    method: 'POST',
    body: JSON.stringify({ staffName }),
  }),

  // Task System
  getTasks: (params?: { assignedTo?: string; clientId?: string }) => {
    const query = new URLSearchParams();
    if (params?.assignedTo) query.append('assignedTo', params.assignedTo);
    if (params?.clientId) query.append('clientId', params.clientId);
    return request<InternalTask[]>(`/tasks?${query.toString()}`);
  },
  createTask: (task: Partial<InternalTask>) => request<InternalTask>('/tasks', {
    method: 'POST',
    body: JSON.stringify(task),
  }),
  updateTask: (id: string, task: Partial<InternalTask>) => request<InternalTask>(`/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(task),
  }),
  deleteTask: (id: string) => request<{ success: boolean }>(`/tasks/${id}`, {
    method: 'DELETE',
  }),
  snoozeTask: (id: string, hours: number) => request<InternalTask>(`/tasks/${id}/snooze`, {
    method: 'POST',
    body: JSON.stringify({ hours }),
  }),

  // Notifications
  getNotifications: (userId?: string) => request<AppNotification[]>(`/notifications${userId ? `?userId=${userId}` : ''}`),
  markNotificationRead: (id: string) => request<AppNotification>(`/notifications/${id}/read`, {
    method: 'PUT',
  }),
  markAllNotificationsRead: (userId: string) => request<{ success: boolean }>('/notifications/mark-all-read', {
    method: 'POST',
    body: JSON.stringify({ userId }),
  }),

  // Funding Strategy
  getFundingStrategies: (clientId: string) => request<FundingStrategyRecord[]>(`/funding-strategy/client/${clientId}`),
  saveFundingStrategy: (clientId: string, strategy: Partial<FundingStrategyRecord>) => request<FundingStrategyRecord>(`/funding-strategy/client/${clientId}`, {
    method: 'POST',
    body: JSON.stringify(strategy),
  }),

  // Client Internal Notes
  getClientInternalNotes: (clientId: string) => request<ClientInternalNote[]>(`/internal-notes/client/${clientId}`),
  createClientInternalNote: (clientId: string, note: Partial<ClientInternalNote>) => request<ClientInternalNote>(`/internal-notes/client/${clientId}`, {
    method: 'POST',
    body: JSON.stringify(note),
  }),

  // Lender History (replaces standalone submission tab)
  getLenderHistory: (clientId: string) => request<LenderHistoryRecord[]>(`/lender-history/client/${clientId}`),
  createLenderHistoryRecord: (data: Partial<LenderHistoryRecord>) => request<LenderHistoryRecord>('/lender-history', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateLenderHistoryRecord: (id: string, data: Partial<LenderHistoryRecord>) => request<LenderHistoryRecord>(`/lender-history/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteLenderHistoryRecord: (id: string) => request<{ success: boolean }>(`/lender-history/${id}`, {
    method: 'DELETE',
  }),

  // Credit Cards (Business + Personal)
  getCreditCards: (clientId: string) => request<CreditCardRecord[]>(`/credit-cards/client/${clientId}`),
  createCreditCard: (card: Partial<CreditCardRecord>) => request<CreditCardRecord>('/credit-cards', {
    method: 'POST',
    body: JSON.stringify(card),
  }),
  updateCreditCard: (id: string, card: Partial<CreditCardRecord>) => request<CreditCardRecord>(`/credit-cards/${id}`, {
    method: 'PUT',
    body: JSON.stringify(card),
  }),
  deleteCreditCard: (id: string) => request<{ success: boolean }>(`/credit-cards/${id}`, {
    method: 'DELETE',
  }),

  // Master Verification Form
  getMasterVerification: (clientId: string) => request<MasterVerificationData>(`/verification/master/${clientId}`),
  saveMasterVerification: (clientId: string, data: Partial<MasterVerificationData>) => request<MasterVerificationData>(`/verification/master/${clientId}`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Funding Deals
  getDeals: () => request<FundingDeal[]>('/deals'),
  getClientDeals: (clientId: string) => request<FundingDeal[]>(`/deals/client/${clientId}`),
  createDeal: (deal: Partial<FundingDeal>) => request<FundingDeal>('/deals', {
    method: 'POST',
    body: JSON.stringify(deal),
  }),
  updateDeal: (id: string, deal: Partial<FundingDeal>) => request<FundingDeal>(`/deals/${id}`, {
    method: 'PUT',
    body: JSON.stringify(deal),
  }),
  deleteDeal: (id: string) => request<{ success: boolean }>(`/deals/${id}`, {
    method: 'DELETE',
  }),
  markCommissionReceived: (dealId: string) => request<{ success: boolean; deal: FundingDeal }>(`/deals/${dealId}/mark-commission-received`, {
    method: 'POST',
  }),

  // Commission Distribution & Engine
  getCommissions: () => request<CommissionParticipant[]>('/commissions'),
  getDealCommissions: (dealId: string) => request<{ participants: CommissionParticipant[]; deal: FundingDeal }>(`/commissions/deal/${dealId}`),
  addCommissionParticipant: (dealId: string, participant: Partial<CommissionParticipant>) => request<CommissionParticipant>(`/commissions/deal/${dealId}/participant`, {
    method: 'POST',
    body: JSON.stringify(participant),
  }),
  updateCommissionParticipant: (id: string, participant: Partial<CommissionParticipant>) => request<CommissionParticipant>(`/commissions/participant/${id}`, {
    method: 'PUT',
    body: JSON.stringify(participant),
  }),
  deleteCommissionParticipant: (id: string) => request<{ success: boolean }>(`/commissions/participant/${id}`, {
    method: 'DELETE',
  }),
  getCommissionDirectory: () => request<CommissionDirectoryEntry[]>('/commission-directory'),
  createCommissionDirectoryEntry: (entry: Partial<CommissionDirectoryEntry>) => request<CommissionDirectoryEntry>('/commission-directory', {
    method: 'POST',
    body: JSON.stringify(entry),
  }),
  updateCommissionDirectoryEntry: (id: string, entry: Partial<CommissionDirectoryEntry>) => request<CommissionDirectoryEntry>(`/commission-directory/${id}`, {
    method: 'PUT',
    body: JSON.stringify(entry),
  }),

  // Verification Desk
  getVerificationRecords: (clientId: string) => request<{
    records: VerificationFieldRecord[];
    audit: VerificationAuditLog[];
    scripts: VerificationScript[];
  }>(`/verification/client/${clientId}`),
  updateVerificationField: (fieldId: string, data: { verifiedValue: string; status: string; notes?: string; updatedBy: string }) => request<{
    success: boolean;
    record: VerificationFieldRecord;
    audit: VerificationAuditLog;
  }>(`/verification/field/${fieldId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  saveVerificationSummary: (clientId: string, data: { verifierName: string; callSummary: string; overallStatus: 'VERIFIED' | 'UNVERIFIED'; records?: any[] }) => request<{ success: boolean; client: Client }>(`/verification/client/${clientId}/summary`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateVerificationScript: (scriptId: string, scriptText: string) => request<VerificationScript>(`/verification/scripts/${scriptId}`, {
    method: 'PUT',
    body: JSON.stringify({ scriptText }),
  }),

  // Underwriting Desk
  getUnderwritingRecord: (clientId: string) => request<{ record: UnderwritingRecord; notes: UnderwritingNote[] }>(`/underwriting/client/${clientId}`),
  saveUnderwriting: (clientId: string, data: { record: Partial<UnderwritingRecord>; newNote?: string; author: string }) => request<{
    success: boolean;
    record: UnderwritingRecord;
    notes: UnderwritingNote[];
  }>(`/underwriting/client/${clientId}/save`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Lender Submissions
  getLenderSubmissions: (clientId: string) => request<LenderSubmission[]>(`/lender-submissions/client/${clientId}`),
  createLenderSubmission: (submission: Partial<LenderSubmission>) => request<LenderSubmission>('/lender-submissions', {
    method: 'POST',
    body: JSON.stringify(submission),
  }),
  recordLenderResponse: (submissionId: string, responseData: any) => request<{ success: boolean; submission: LenderSubmission }>(`/lender-submissions/${submissionId}/response`, {
    method: 'POST',
    body: JSON.stringify(responseData),
  }),

  // Document Management
  getDocuments: (clientId: string) => request<DocumentItem[]>(`/documents/client/${clientId}`),
  uploadDocument: (doc: Partial<DocumentItem>) => request<DocumentItem>('/documents', {
    method: 'POST',
    body: JSON.stringify(doc),
  }),
  updateDocumentStatus: (docId: string, status: string, reviewedBy: string, notes?: string) => request<DocumentItem>(`/documents/${docId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status, reviewedBy, notes }),
  }),
  deleteDocument: (docId: string) => request<{ success: boolean }>(`/documents/${docId}`, {
    method: 'DELETE',
  }),

  // Discord Integration
  getDiscordConfig: () => request<DiscordConfig>('/discord/config'),
  updateDiscordConfig: (data: Partial<DiscordConfig>) => request<DiscordConfig>('/discord/config', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  testDiscordWebhook: (customUrl?: string) => request<{ success: boolean; message: string }>('/discord/test', {
    method: 'POST',
    body: JSON.stringify({ webhookUrl: customUrl }),
  }),
  sendTaskDiscordReminder: (taskId: string) => request<{ success: boolean; message: string }>(`/tasks/${taskId}/discord-reminder`, {
    method: 'POST',
  }),

  // Firebase Config
  getFirebaseConfig: () => request<FirebaseClientConfig>('/firebase/config'),
  updateFirebaseConfig: (data: Partial<FirebaseClientConfig>) => request<FirebaseClientConfig>('/firebase/config', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  // GHL Integration
  getGhlConfig: () => request<GhlConfig>('/ghl/config'),
  updateGhlConfig: (config: Partial<GhlConfig>) => request<GhlConfig>('/ghl/config', {
    method: 'PUT',
    body: JSON.stringify(config),
  }),
  syncGhlNow: () => request<{ success: boolean; message: string; syncedAt: string; leadsSynced: number; contactsSynced: number }>('/ghl/sync-now', {
    method: 'POST',
  }),
  sendGhlWebhook: (payload: any) => request<{ success: boolean; leadId: string }>('/ghl/webhook', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

  // Settings
  getLeadSources: () => request<LeadSourceOption[]>('/settings/lead-sources'),
  createLeadSource: (name: string) => request<LeadSourceOption>('/settings/lead-sources', {
    method: 'POST',
    body: JSON.stringify({ name }),
  }),
  getReferralPartners: () => request<ReferralPartnerOption[]>('/settings/referral-partners'),
  createReferralPartner: (partner: Partial<ReferralPartnerOption>) => request<ReferralPartnerOption>('/settings/referral-partners', {
    method: 'POST',
    body: JSON.stringify(partner),
  }),
};
