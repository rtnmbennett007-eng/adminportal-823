import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  AppNotification,
  Client,
  ClientInternalNote,
  CommissionDirectoryEntry,
  CommissionParticipant,
  CreditCardRecord,
  DiscordConfig,
  FirebaseClientConfig,
  FundingDeal,
  FundingStrategyRecord,
  GhlConfig,
  InternalTask,
  Lead,
  LeadSourceOption,
  LenderHistoryRecord,
  MasterVerificationData,
  ReferralPartnerOption,
  StaffUser,
  UserRole,
} from '../types';
import { api } from '../services/api';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}

interface DataContextType {
  leads: Lead[];
  clients: Client[];
  deals: FundingDeal[];
  commissions: CommissionParticipant[];
  commissionDirectory: CommissionDirectoryEntry[];
  leadSources: LeadSourceOption[];
  referralPartners: ReferralPartnerOption[];
  ghlConfig: GhlConfig | null;
  tasks: InternalTask[];
  notifications: AppNotification[];
  roles: UserRole[];
  discordConfig: DiscordConfig | null;
  firebaseConfig: FirebaseClientConfig | null;

  selectedClientId: string | null;
  selectedClientData: any | null;
  isLoading: boolean;
  isSaving: boolean;
  toasts: ToastMessage[];

  // General Actions
  setSelectedClientId: (id: string | null) => void;
  refreshAll: () => Promise<void>;
  refreshClientDetail: (clientId: string) => Promise<void>;
  addToast: (type: ToastMessage['type'], title: string, message: string) => void;
  removeToast: (id: string) => void;

  // Leads
  createLead: (data: Partial<Lead>) => Promise<Lead>;
  updateLead: (id: string, data: Partial<Lead>) => Promise<Lead>;
  deleteLead: (id: string) => Promise<void>;
  convertLeadToClient: (id: string, customData?: Record<string, any>) => Promise<{ client: Client; deal: FundingDeal }>;

  // Clients
  createClient: (data: Partial<Client>) => Promise<Client>;
  updateClient: (id: string, data: Partial<Client>) => Promise<Client>;
  deleteClient: (id: string) => Promise<void>;
  auditSsnView: (id: string, staffName: string) => Promise<void>;

  // Deals
  createDeal: (data: Partial<FundingDeal>) => Promise<FundingDeal>;
  updateDeal: (id: string, data: Partial<FundingDeal>) => Promise<FundingDeal>;
  deleteDeal: (id: string) => Promise<void>;

  // Commissions
  addCommissionParticipant: (dealId: string, data: Partial<CommissionParticipant>) => Promise<CommissionParticipant>;
  updateCommissionParticipant: (id: string, data: Partial<CommissionParticipant>) => Promise<CommissionParticipant>;
  deleteCommissionParticipant: (id: string) => Promise<void>;
  markDealCommissionReceived: (dealId: string) => Promise<void>;
  addCommissionDirectoryEntry: (entry: Partial<CommissionDirectoryEntry>) => Promise<void>;
  deleteCommissionDirectoryEntry: (id: string) => Promise<void>;

  // Tasks
  createTask: (data: Partial<InternalTask>) => Promise<InternalTask>;
  updateTask: (id: string, data: Partial<InternalTask>) => Promise<InternalTask>;
  deleteTask: (id: string) => Promise<void>;
  snoozeTask: (id: string, hours: number) => Promise<InternalTask>;

  // Notifications
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: (userId: string) => Promise<void>;

  // Funding Strategy
  saveFundingStrategy: (clientId: string, data: Partial<FundingStrategyRecord>) => Promise<FundingStrategyRecord>;

  // Internal Notes
  createClientInternalNote: (clientId: string, note: Partial<ClientInternalNote>) => Promise<ClientInternalNote>;

  // Lender History
  createLenderHistoryRecord: (data: Partial<LenderHistoryRecord>) => Promise<LenderHistoryRecord>;
  updateLenderHistoryRecord: (id: string, data: Partial<LenderHistoryRecord>) => Promise<LenderHistoryRecord>;
  deleteLenderHistoryRecord: (id: string) => Promise<void>;

  // Credit Cards
  createCreditCard: (data: Partial<CreditCardRecord>) => Promise<CreditCardRecord>;
  updateCreditCard: (id: string, data: Partial<CreditCardRecord>) => Promise<CreditCardRecord>;
  deleteCreditCard: (id: string) => Promise<void>;

  // Master Verification
  saveMasterVerification: (clientId: string, data: Partial<MasterVerificationData>) => Promise<MasterVerificationData>;

  // Roles & Users
  createRole: (data: Partial<UserRole>) => Promise<UserRole>;
  updateRole: (id: string, data: Partial<UserRole>) => Promise<UserRole>;
  createStaffUser: (data: Partial<StaffUser>) => Promise<StaffUser>;
  updateStaffUser: (id: string, data: Partial<StaffUser>) => Promise<StaffUser>;

  // Discord & Firebase
  updateDiscordConfig: (data: Partial<DiscordConfig>) => Promise<void>;
  testDiscordWebhook: (url?: string) => Promise<{ success: boolean; message: string }>;
  updateFirebaseConfig: (data: Partial<FirebaseClientConfig>) => Promise<void>;

  // GHL
  syncGhlNow: () => Promise<void>;
  updateGhlConfig: (data: Partial<GhlConfig>) => Promise<void>;

  // Settings
  createLeadSource: (name: string) => Promise<void>;
  deleteLeadSource: (id: string) => Promise<void>;
  createReferralPartner: (partner: Partial<ReferralPartnerOption>) => Promise<void>;
  deleteReferralPartner: (id: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [deals, setDeals] = useState<FundingDeal[]>([]);
  const [commissions, setCommissions] = useState<CommissionParticipant[]>([]);
  const [commissionDirectory, setCommissionDirectory] = useState<CommissionDirectoryEntry[]>([]);
  const [leadSources, setLeadSources] = useState<LeadSourceOption[]>([]);
  const [referralPartners, setReferralPartners] = useState<ReferralPartnerOption[]>([]);
  const [ghlConfig, setGhlConfig] = useState<GhlConfig | null>(null);
  const [tasks, setTasks] = useState<InternalTask[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [discordConfig, setDiscordConfig] = useState<DiscordConfig | null>(null);
  const [firebaseConfig, setFirebaseConfig] = useState<FirebaseClientConfig | null>(null);

  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedClientData, setSelectedClientData] = useState<any | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((type: ToastMessage['type'], title: string, message: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const refreshAll = useCallback(async () => {
    try {
      const [
        fetchedLeads,
        fetchedClients,
        fetchedDeals,
        fetchedCommissions,
        fetchedDir,
        fetchedSources,
        fetchedPartners,
        fetchedGhl,
        fetchedTasks,
        fetchedNotifs,
        fetchedRoles,
        fetchedDiscord,
        fetchedFirebase,
      ] = await Promise.all([
        api.getLeads(),
        api.getClients(),
        api.getDeals(),
        api.getCommissions(),
        api.getCommissionDirectory(),
        api.getLeadSources(),
        api.getReferralPartners(),
        api.getGhlConfig(),
        api.getTasks(),
        api.getNotifications(),
        api.getRoles(),
        api.getDiscordConfig(),
        api.getFirebaseConfig(),
      ]);

      setLeads(fetchedLeads);
      setClients(fetchedClients);
      setDeals(fetchedDeals);
      setCommissions(fetchedCommissions);
      setCommissionDirectory(fetchedDir);
      setLeadSources(fetchedSources);
      setReferralPartners(fetchedPartners);
      setGhlConfig(fetchedGhl);
      setTasks(fetchedTasks);
      setNotifications(fetchedNotifs);
      setRoles(fetchedRoles);
      setDiscordConfig(fetchedDiscord);
      setFirebaseConfig(fetchedFirebase);
    } catch (err) {
      console.error('Failed to fetch operational data:', err);
      addToast('error', 'Sync Failure', 'Unable to reach backend operations server.');
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  const refreshClientDetail = useCallback(async (clientId: string) => {
    try {
      const data = await api.getClientDetail(clientId);
      setSelectedClientData(data);
      setClients((prev) => prev.map((c) => (c.id === clientId ? data.client : c)));
    } catch (err) {
      console.error('Failed to fetch client detail:', err);
    }
  }, []);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  useEffect(() => {
    if (selectedClientId) {
      refreshClientDetail(selectedClientId);
    } else {
      setSelectedClientData(null);
    }
  }, [selectedClientId, refreshClientDetail]);

  // Leads
  const createLead = async (data: Partial<Lead>) => {
    setIsSaving(true);
    try {
      const created = await api.createLead(data);
      setLeads((prev) => [created, ...prev]);
      addToast('success', 'Lead Ingested', `${created.firstName} ${created.lastName} added to sales pipeline.`);
      return created;
    } finally {
      setIsSaving(false);
    }
  };

  const updateLead = async (id: string, data: Partial<Lead>) => {
    setIsSaving(true);
    try {
      const updated = await api.updateLead(id, data);
      setLeads((prev) => prev.map((l) => (l.id === id ? updated : l)));
      addToast('success', 'Lead Updated', `Lead status updated.`);
      return updated;
    } finally {
      setIsSaving(false);
    }
  };

  const deleteLead = async (id: string) => {
    setIsSaving(true);
    try {
      await api.deleteLead(id);
      setLeads((prev) => prev.filter((l) => l.id !== id));
      addToast('info', 'Lead Removed', 'Lead deleted from database.');
    } finally {
      setIsSaving(false);
    }
  };

  const convertLeadToClient = async (id: string, customData?: Record<string, any>) => {
    setIsSaving(true);
    try {
      const res = await api.convertLeadToClient(id, customData);
      setClients((prev) => [res.client, ...prev]);
      setDeals((prev) => [res.deal, ...prev]);
      setLeads((prev) =>
        prev.map((l) =>
          l.id === id
            ? { ...l, status: 'APPLICATION_RECEIVED' as any, applicationStatus: 'SUBMITTED' }
            : l
        )
      );
      addToast('success', 'Application Converted', `${res.client.firstName} ${res.client.lastName} is now an active Client File with Primary Deal initialized.`);
      await refreshAll();
      return res;
    } finally {
      setIsSaving(false);
    }
  };

  // Clients
  const createClient = async (data: Partial<Client>) => {
    setIsSaving(true);
    try {
      const created = await api.createClient(data);
      setClients((prev) => [created, ...prev]);
      addToast('success', 'Client File Created', `${created.firstName} ${created.lastName} initialized.`);
      await refreshAll();
      return created;
    } finally {
      setIsSaving(false);
    }
  };

  const updateClient = async (id: string, data: Partial<Client>) => {
    setIsSaving(true);
    try {
      const updated = await api.updateClient(id, data);
      setClients((prev) => prev.map((c) => (c.id === id ? updated : c)));
      if (selectedClientId === id && selectedClientData) {
        setSelectedClientData((prev: any) => ({ ...prev, client: updated }));
      }
      addToast('success', 'Client Record Saved', `${updated.firstName} ${updated.lastName} master file updated.`);
      return updated;
    } finally {
      setIsSaving(false);
    }
  };

  const deleteClient = async (id: string) => {
    setIsSaving(true);
    try {
      await api.deleteClient(id);
      setClients((prev) => prev.filter((c) => c.id !== id));
      if (selectedClientId === id) {
        setSelectedClientId(null);
      }
      addToast('success', 'Client File Deleted', 'Client record removed.');
    } finally {
      setIsSaving(false);
    }
  };

  const auditSsnView = async (id: string, staffName: string) => {
    await api.auditSsnView(id, staffName);
  };

  // Deals
  const createDeal = async (data: Partial<FundingDeal>) => {
    setIsSaving(true);
    try {
      const created = await api.createDeal(data);
      setDeals((prev) => [created, ...prev]);
      addToast('success', 'Funding Deal Created', `${created.product} ($${created.fundingAmount.toLocaleString()}) added.`);
      await refreshAll();
      return created;
    } finally {
      setIsSaving(false);
    }
  };

  const updateDeal = async (id: string, data: Partial<FundingDeal>) => {
    setIsSaving(true);
    try {
      const updated = await api.updateDeal(id, data);
      setDeals((prev) => prev.map((d) => (d.id === id ? updated : d)));
      addToast('success', 'Deal Updated', `${updated.product} updated.`);
      await refreshAll();
      return updated;
    } finally {
      setIsSaving(false);
    }
  };

  const deleteDeal = async (id: string) => {
    setIsSaving(true);
    try {
      await api.deleteDeal(id);
      setDeals((prev) => prev.filter((d) => d.id !== id));
      addToast('info', 'Deal Removed', 'Funding deal deleted.');
      await refreshAll();
    } finally {
      setIsSaving(false);
    }
  };

  // Commissions
  const addCommissionParticipant = async (dealId: string, data: Partial<CommissionParticipant>) => {
    setIsSaving(true);
    try {
      const created = await api.addCommissionParticipant(dealId, data);
      setCommissions((prev) => [...prev, created]);
      addToast('success', 'Commission Participant Added', `${created.name} allocated ${created.points}% points ($${created.dollarAmount.toLocaleString()}).`);
      await refreshAll();
      return created;
    } finally {
      setIsSaving(false);
    }
  };

  const updateCommissionParticipant = async (id: string, data: Partial<CommissionParticipant>) => {
    setIsSaving(true);
    try {
      const updated = await api.updateCommissionParticipant(id, data);
      setCommissions((prev) => prev.map((p) => (p.id === id ? updated : p)));
      addToast('success', 'Commission Updated', `${updated.name} points updated to ${updated.points}%.`);
      await refreshAll();
      return updated;
    } finally {
      setIsSaving(false);
    }
  };

  const deleteCommissionParticipant = async (id: string) => {
    setIsSaving(true);
    try {
      await api.deleteCommissionParticipant(id);
      setCommissions((prev) => prev.filter((p) => p.id !== id));
      addToast('info', 'Participant Removed', 'Commission participant removed.');
      await refreshAll();
    } finally {
      setIsSaving(false);
    }
  };

  const markDealCommissionReceived = async (dealId: string) => {
    setIsSaving(true);
    try {
      const res = await api.markCommissionReceived(dealId);
      addToast('success', 'Commission Settled', `Deal marked Received. All allocations distributed.`);
      await refreshAll();
    } finally {
      setIsSaving(false);
    }
  };

  // Tasks
  const createTask = async (data: Partial<InternalTask>) => {
    setIsSaving(true);
    try {
      const created = await api.createTask(data);
      setTasks((prev) => [created, ...prev]);
      addToast('success', 'Task Created', `Task assigned to ${created.assignedTo}.`);
      await refreshAll();
      return created;
    } finally {
      setIsSaving(false);
    }
  };

  const updateTask = async (id: string, data: Partial<InternalTask>) => {
    setIsSaving(true);
    try {
      const updated = await api.updateTask(id, data);
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
      addToast('success', 'Task Updated', `Task "${updated.title}" saved.`);
      await refreshAll();
      return updated;
    } finally {
      setIsSaving(false);
    }
  };

  const deleteTask = async (id: string) => {
    setIsSaving(true);
    try {
      await api.deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      addToast('info', 'Task Deleted', 'Task removed from workspace.');
    } finally {
      setIsSaving(false);
    }
  };

  const snoozeTask = async (id: string, hours: number) => {
    setIsSaving(true);
    try {
      const snoozed = await api.snoozeTask(id, hours);
      setTasks((prev) => prev.map((t) => (t.id === id ? snoozed : t)));
      addToast('info', 'Task Snoozed', `Task snoozed for ${hours} hours.`);
      return snoozed;
    } finally {
      setIsSaving(false);
    }
  };

  // Notifications
  const markNotificationRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const markAllNotificationsRead = async (userId: string) => {
    try {
      await api.markAllNotificationsRead(userId);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      addToast('info', 'Notifications Cleared', 'All notifications marked as read.');
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  // Funding Strategy
  const saveFundingStrategy = async (clientId: string, data: Partial<FundingStrategyRecord>) => {
    setIsSaving(true);
    try {
      const strat = await api.saveFundingStrategy(clientId, data);
      addToast('success', 'Funding Strategy Saved', 'Active strategy record saved to client file.');
      await refreshAll();
      if (selectedClientId === clientId) {
        await refreshClientDetail(clientId);
      }
      return strat;
    } finally {
      setIsSaving(false);
    }
  };

  // Internal Notes
  const createClientInternalNote = async (clientId: string, note: Partial<ClientInternalNote>) => {
    setIsSaving(true);
    try {
      const saved = await api.createClientInternalNote(clientId, note);
      addToast('success', 'Internal Note Saved', 'Note added to chronological file.');
      if (selectedClientId === clientId) {
        await refreshClientDetail(clientId);
      }
      return saved;
    } finally {
      setIsSaving(false);
    }
  };

  // Lender History
  const createLenderHistoryRecord = async (data: Partial<LenderHistoryRecord>) => {
    setIsSaving(true);
    try {
      const rec = await api.createLenderHistoryRecord(data);
      addToast('success', 'Lender Record Saved', `Submission to ${rec.lenderName} logged.`);
      await refreshAll();
      if (data.clientId) await refreshClientDetail(data.clientId);
      return rec;
    } finally {
      setIsSaving(false);
    }
  };

  const updateLenderHistoryRecord = async (id: string, data: Partial<LenderHistoryRecord>) => {
    setIsSaving(true);
    try {
      const rec = await api.updateLenderHistoryRecord(id, data);
      addToast('success', 'Lender Update Saved', `Status updated to ${rec.status}.`);
      await refreshAll();
      if (rec.clientId) await refreshClientDetail(rec.clientId);
      return rec;
    } finally {
      setIsSaving(false);
    }
  };

  const deleteLenderHistoryRecord = async (id: string) => {
    setIsSaving(true);
    try {
      await api.deleteLenderHistoryRecord(id);
      addToast('info', 'Record Deleted', 'Lender entry removed.');
      await refreshAll();
      if (selectedClientId) await refreshClientDetail(selectedClientId);
    } finally {
      setIsSaving(false);
    }
  };

  // Credit Cards
  const createCreditCard = async (data: Partial<CreditCardRecord>) => {
    setIsSaving(true);
    try {
      const rec = await api.createCreditCard(data);
      addToast('success', 'Credit Card Added', `${rec.issuer} ${rec.cardName} saved.`);
      if (data.clientId) await refreshClientDetail(data.clientId);
      return rec;
    } finally {
      setIsSaving(false);
    }
  };

  const updateCreditCard = async (id: string, data: Partial<CreditCardRecord>) => {
    setIsSaving(true);
    try {
      const rec = await api.updateCreditCard(id, data);
      addToast('success', 'Credit Card Saved', `${rec.cardName} updated.`);
      if (rec.clientId) await refreshClientDetail(rec.clientId);
      return rec;
    } finally {
      setIsSaving(false);
    }
  };

  const deleteCreditCard = async (id: string) => {
    setIsSaving(true);
    try {
      await api.deleteCreditCard(id);
      addToast('info', 'Card Removed', 'Credit card deleted.');
      if (selectedClientId) await refreshClientDetail(selectedClientId);
    } finally {
      setIsSaving(false);
    }
  };

  // Master Verification
  const saveMasterVerification = async (clientId: string, data: Partial<MasterVerificationData>) => {
    setIsSaving(true);
    try {
      const rec = await api.saveMasterVerification(clientId, data);
      addToast('success', 'Master Worksheet Saved', 'All 27 sections synchronized with client master file.');
      await refreshAll();
      if (selectedClientId === clientId) await refreshClientDetail(clientId);
      return rec;
    } finally {
      setIsSaving(false);
    }
  };

  // Roles & Users
  const createRole = async (data: Partial<UserRole>) => {
    setIsSaving(true);
    try {
      const role = await api.createRole(data);
      setRoles((prev) => [...prev, role]);
      addToast('success', 'Role Created', `Role "${role.name}" added.`);
      return role;
    } finally {
      setIsSaving(false);
    }
  };

  const updateRole = async (id: string, data: Partial<UserRole>) => {
    setIsSaving(true);
    try {
      const role = await api.updateRole(id, data);
      setRoles((prev) => prev.map((r) => (r.id === id ? role : r)));
      addToast('success', 'Role Updated', `Role "${role.name}" saved.`);
      return role;
    } finally {
      setIsSaving(false);
    }
  };

  const createStaffUser = async (data: Partial<StaffUser>) => {
    setIsSaving(true);
    try {
      const staff = await api.createStaffUser(data);
      addToast('success', 'User Created', `${staff.name} added to operations directory.`);
      return staff;
    } finally {
      setIsSaving(false);
    }
  };

  const updateStaffUser = async (id: string, data: Partial<StaffUser>) => {
    setIsSaving(true);
    try {
      const staff = await api.updateStaffUser(id, data);
      addToast('success', 'User Updated', `${staff.name} profile saved.`);
      return staff;
    } finally {
      setIsSaving(false);
    }
  };

  // Discord & Firebase
  const updateDiscordConfig = async (data: Partial<DiscordConfig>) => {
    setIsSaving(true);
    try {
      const res = await api.updateDiscordConfig(data);
      setDiscordConfig(res);
      addToast('success', 'Discord Settings Saved', 'Server-side webhook settings updated.');
    } finally {
      setIsSaving(false);
    }
  };

  const testDiscordWebhook = async (url?: string) => {
    const res = await api.testDiscordWebhook(url);
    if (res.success) {
      addToast('success', 'Discord Test Succeeded', res.message);
    } else {
      addToast('error', 'Discord Test Failed', res.message);
    }
    return res;
  };

  const updateFirebaseConfig = async (data: Partial<FirebaseClientConfig>) => {
    setIsSaving(true);
    try {
      const res = await api.updateFirebaseConfig(data);
      setFirebaseConfig(res);
      addToast('success', 'Firebase Config Saved', 'Cloud synchronization credentials saved.');
    } finally {
      setIsSaving(false);
    }
  };

  // GHL
  const syncGhlNow = async () => {
    setIsSaving(true);
    try {
      const res = await api.syncGhlNow();
      addToast('success', 'GHL Synchronized', `${res.leadsSynced} leads synced with Maple X database.`);
      await refreshAll();
    } finally {
      setIsSaving(false);
    }
  };

  const updateGhlConfig = async (data: Partial<GhlConfig>) => {
    setIsSaving(true);
    try {
      const res = await api.updateGhlConfig(data);
      setGhlConfig(res);
      addToast('success', 'GHL Config Saved', 'API and pipeline mappings saved.');
    } finally {
      setIsSaving(false);
    }
  };

  // Settings & Commission Directory
  const createLeadSource = async (name: string) => {
    const src = await api.createLeadSource(name);
    setLeadSources((prev) => [...prev, src]);
    addToast('success', 'Lead Source Added', `Source "${name}" created.`);
  };

  const deleteLeadSource = async (id: string) => {
    setLeadSources((prev) => prev.filter((s) => s.id !== id));
    addToast('info', 'Lead Source Removed', 'Lead source updated.');
  };

  const createReferralPartner = async (partner: Partial<ReferralPartnerOption>) => {
    const p = await api.createReferralPartner(partner);
    setReferralPartners((prev) => [...prev, p]);
    addToast('success', 'Partner Added', `Referral partner "${p.name}" registered.`);
  };

  const deleteReferralPartner = async (id: string) => {
    setReferralPartners((prev) => prev.filter((p) => p.id !== id));
    addToast('info', 'Referral Partner Removed', 'Referral partner removed.');
  };

  const addCommissionDirectoryEntry = async (entry: Partial<CommissionDirectoryEntry>) => {
    const newEntry: CommissionDirectoryEntry = {
      id: `comm-dir-${Date.now()}`,
      name: entry.name || 'New Participant',
      type: entry.type || 'Internal Staff',
      role: entry.role || 'Partner',
      email: entry.email || '',
      phone: entry.phone || '',
      company: entry.company || '',
      defaultPoints: entry.defaultPoints || 1.0,
      notes: entry.notes || '',
      active: true,
      ...entry,
    };
    setCommissionDirectory((prev) => [...prev, newEntry]);
    addToast('success', 'Directory Updated', `${newEntry.name} added to commission directory.`);
  };

  const deleteCommissionDirectoryEntry = async (id: string) => {
    setCommissionDirectory((prev) => prev.filter((e) => e.id !== id));
    addToast('info', 'Directory Entry Removed', 'Commission recipient removed.');
  };

  return (
    <DataContext.Provider
      value={{
        leads,
        clients,
        deals,
        commissions,
        commissionDirectory,
        leadSources,
        referralPartners,
        ghlConfig,
        tasks,
        notifications,
        roles,
        discordConfig,
        firebaseConfig,
        selectedClientId,
        selectedClientData,
        isLoading,
        isSaving,
        toasts,
        setSelectedClientId,
        refreshAll,
        refreshClientDetail,
        addToast,
        removeToast,
        createLead,
        updateLead,
        deleteLead,
        convertLeadToClient,
        createClient,
        updateClient,
        deleteClient,
        auditSsnView,
        createDeal,
        updateDeal,
        deleteDeal,
        addCommissionParticipant,
        updateCommissionParticipant,
        deleteCommissionParticipant,
        markDealCommissionReceived,
        addCommissionDirectoryEntry,
        deleteCommissionDirectoryEntry,
        createTask,
        updateTask,
        deleteTask,
        snoozeTask,
        markNotificationRead,
        markAllNotificationsRead,
        saveFundingStrategy,
        createClientInternalNote,
        createLenderHistoryRecord,
        updateLenderHistoryRecord,
        deleteLenderHistoryRecord,
        createCreditCard,
        updateCreditCard,
        deleteCreditCard,
        saveMasterVerification,
        createRole,
        updateRole,
        createStaffUser,
        updateStaffUser,
        updateDiscordConfig,
        testDiscordWebhook,
        updateFirebaseConfig,
        syncGhlNow,
        updateGhlConfig,
        createLeadSource,
        deleteLeadSource,
        createReferralPartner,
        deleteReferralPartner,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
