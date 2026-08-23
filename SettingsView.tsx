import React, { useState, useEffect } from 'react';
import {
  Settings,
  ArrowRightLeft,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  RefreshCw,
  Database,
  ShieldCheck,
  Send,
  Sparkles,
  Flame,
  Cloud,
  Users,
  KeyRound,
  UserCheck,
  Edit,
  Lock,
  MessageSquare,
  Bot,
  AtSign,
  Hash,
  Cpu,
  Check,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { testFirestoreConnection } from '../../firebase';
import firebaseConfig from '../../../firebase-applet-config.json';
import { UserProfileModal } from '../auth/UserProfileModal';
import { DiscordConfig } from '../../types';

export const SettingsView: React.FC = () => {
  const { currentUser, staffList } = useAuth();
  const {
    ghlConfig,
    updateGhlConfig,
    syncGhlNow,
    leadSources,
    createLeadSource,
    deleteLeadSource,
    referralPartners,
    createReferralPartner,
    deleteReferralPartner,
    addToast,
    refreshAll,
  } = useData();

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [ghlForm, setGhlForm] = useState(ghlConfig);
  const [newSourceName, setNewSourceName] = useState('');
  const [newPartnerForm, setNewPartnerForm] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    defaultCommissionPoints: 1.0,
  });

  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [webhookResult, setWebhookResult] = useState<any | null>(null);
  const [isTestingFirebase, setIsTestingFirebase] = useState(false);
  const [firebaseStatus, setFirebaseStatus] = useState<'IDLE' | 'CONNECTED' | 'ERROR'>('CONNECTED');

  // Discord State
  const [discordConfig, setDiscordConfig] = useState<DiscordConfig>({
    enabled: true,
    webhookUrl: '',
    channelName: 'maple-x-notifications',
    botUsername: 'Maple X Operations Bot',
    mentionRole: '',
    events: {
      highPriorityTaskCreated: true,
      highPriorityTaskDue: true,
      taskOverdue: true,
      newLead: true,
      leadCreated: true,
      verificationComplete: true,
      clientVerified: true,
      underwritingReady: true,
      preApprovalReceived: true,
      approvalReceived: true,
      clientFunded: true,
      dealFunded: true,
      commissionReceived: true,
      commissionCollected: true,
      taskAssigned: true,
      taskReminder: true,
    },
  });
  const [isSavingDiscord, setIsSavingDiscord] = useState(false);
  const [isTestingDiscord, setIsTestingDiscord] = useState(false);
  const [discordTestResult, setDiscordTestResult] = useState<string | null>(null);

  useEffect(() => {
    // Load Discord Config
    api.getDiscordConfig()
      .then((cfg) => {
        if (cfg) setDiscordConfig(cfg);
      })
      .catch(() => {});
  }, []);

  const getInitials = (name?: string) => {
    if (!name) return 'MX';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const handleSaveDiscord = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingDiscord(true);
    try {
      const updated = await api.updateDiscordConfig(discordConfig);
      setDiscordConfig(updated);
      addToast('success', 'Discord Settings Saved', 'Discord webhook and notification triggers updated.');
    } catch (err: any) {
      addToast('error', 'Discord Save Failed', err.message || 'Could not save Discord settings.');
    } finally {
      setIsSavingDiscord(false);
    }
  };

  const handleTestDiscord = async () => {
    setIsTestingDiscord(true);
    setDiscordTestResult(null);
    try {
      const res = await api.testDiscordWebhook(discordConfig.webhookUrl);
      setDiscordTestResult(res.message);
      addToast('success', 'Discord Test Ping Sent', res.message);
    } catch (err: any) {
      setDiscordTestResult(`Error: ${err.message}`);
      addToast('error', 'Discord Ping Failed', err.message);
    } finally {
      setIsTestingDiscord(false);
    }
  };

  const handleTestFirebase = async () => {
    setIsTestingFirebase(true);
    try {
      await testFirestoreConnection();
      setFirebaseStatus('CONNECTED');
      addToast('success', 'Firebase Connected', `Successfully reached Firestore database (${firebaseConfig.projectId}).`);
    } catch (err: any) {
      setFirebaseStatus('ERROR');
      addToast('error', 'Firebase Check', err.message || 'Could not reach Firestore');
    } finally {
      setIsTestingFirebase(false);
    }
  };

  const handleSaveGHL = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateGhlConfig(ghlForm);
  };

  const handleTestWebhook = async () => {
    setIsTestingWebhook(true);
    try {
      const mockWebhookPayload = {
        event: 'opportunity.stage_change',
        contact_id: `ghl_c_${Math.floor(100000 + Math.random() * 900000)}`,
        opportunity_id: `ghl_opp_${Math.floor(100000 + Math.random() * 900000)}`,
        first_name: 'Apex',
        last_name: 'Industrial Group',
        email: `contact_${Date.now()}@apexindustrial.com`,
        phone: '(713) 555-0199',
        business_name: 'Apex Industrial Solutions LLC',
        pipeline_stage: 'APPLICATION_RECEIVED',
        monetary_value: 125000,
        source: 'Google Ads',
        referral_partner: 'ABC Financial Partners',
      };

      const res = await api.sendGhlWebhook(mockWebhookPayload);
      setWebhookResult(res);
      addToast('success', 'GHL Webhook Processed', 'Inbound lead ingested and synchronized with Maple X database.');
      await refreshAll();
    } catch (err: any) {
      addToast('error', 'Webhook Error', err.message);
    } finally {
      setIsTestingWebhook(false);
    }
  };

  const handleAddSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSourceName.trim()) return;
    await createLeadSource(newSourceName.trim());
    setNewSourceName('');
  };

  const handleAddPartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartnerForm.name.trim()) return;
    await createReferralPartner({
      ...newPartnerForm,
      defaultCommissionPoints: Number(newPartnerForm.defaultCommissionPoints || 1.0),
    });
    setNewPartnerForm({
      name: '',
      company: '',
      email: '',
      phone: '',
      defaultCommissionPoints: 1.0,
    });
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl">
        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded uppercase font-mono">
            System & Integrations Hub
          </span>
        </div>
        <h1 className="text-xl font-bold text-slate-100 mt-1 flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-400" />
          Settings, Integrations & Notifications Hub
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure real-time Discord task/reminder alerts with staff user tagging, CRM webhooks, and cloud database persistence.
        </p>
      </div>

      {/* DISCORD NOTIFICATIONS */}
      <div className="grid grid-cols-1 gap-6">
        {/* Discord Bot & Webhook Notifications */}
        <div className="bg-[#0b162c] border border-indigo-900/70 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-indigo-900/60">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                  Discord Notification Engine
                </h3>
                <p className="text-[11px] text-slate-400">
                  Broadcasts task assignments, due reminders, and pipeline events.
                </p>
              </div>
            </div>
            <span className={`text-[10px] px-2.5 py-0.5 rounded font-mono font-bold ${
              discordConfig.enabled
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-slate-800 text-slate-400'
            }`}>
              {discordConfig.enabled ? 'ACTIVE' : 'DISABLED'}
            </span>
          </div>

          <form onSubmit={handleSaveDiscord} className="space-y-3.5">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#060c18] border border-indigo-950">
              <div className="text-xs">
                <span className="font-bold text-slate-200 block">Enable Discord Notifier</span>
                <span className="text-[11px] text-slate-400">Send embeds directly to your team Discord channel</span>
              </div>
              <input
                type="checkbox"
                checked={discordConfig.enabled}
                onChange={(e) => setDiscordConfig({ ...discordConfig, enabled: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-0 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-300 uppercase mb-1">
                Discord Webhook URL
              </label>
              <input
                type="text"
                value={discordConfig.webhookUrl || ''}
                onChange={(e) => setDiscordConfig({ ...discordConfig, webhookUrl: e.target.value })}
                placeholder="https://discord.com/api/webhooks/..."
                className="w-full bg-[#060c18] border border-indigo-900/80 rounded-xl p-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-400 placeholder-slate-600"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Server Settings &rarr; Integrations &rarr; Webhooks &rarr; Copy Webhook URL
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-slate-300 uppercase mb-1">
                  Channel Name
                </label>
                <input
                  type="text"
                  value={discordConfig.channelName || ''}
                  onChange={(e) => setDiscordConfig({ ...discordConfig, channelName: e.target.value })}
                  placeholder="#deals-and-tasks"
                  className="w-full bg-[#060c18] border border-indigo-900/80 rounded-xl p-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-400"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-300 uppercase mb-1">
                  Fallback Mention Role / Tag
                </label>
                <input
                  type="text"
                  value={discordConfig.mentionRole || ''}
                  onChange={(e) => setDiscordConfig({ ...discordConfig, mentionRole: e.target.value })}
                  placeholder="@here or <@&role_id>"
                  className="w-full bg-[#060c18] border border-indigo-900/80 rounded-xl p-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-400 placeholder-slate-600"
                />
              </div>
            </div>

            {/* Notification Triggers Checklist */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[11px] font-bold text-slate-300 block">
                Automated Notification Triggers:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <label className="flex items-center space-x-2 p-2 rounded-lg bg-[#060c18] border border-indigo-950 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={discordConfig.events?.taskAssigned ?? true}
                    onChange={(e) =>
                      setDiscordConfig({
                        ...discordConfig,
                        events: { ...discordConfig.events, taskAssigned: e.target.checked },
                      })
                    }
                    className="rounded text-indigo-600 focus:ring-0"
                  />
                  <span className="text-slate-300">Task Assigned (Tags User)</span>
                </label>
                <label className="flex items-center space-x-2 p-2 rounded-lg bg-[#060c18] border border-indigo-950 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={discordConfig.events?.taskReminder ?? true}
                    onChange={(e) =>
                      setDiscordConfig({
                        ...discordConfig,
                        events: { ...discordConfig.events, taskReminder: e.target.checked },
                      })
                    }
                    className="rounded text-indigo-600 focus:ring-0"
                  />
                  <span className="text-slate-300">Task Due Reminders</span>
                </label>
                <label className="flex items-center space-x-2 p-2 rounded-lg bg-[#060c18] border border-indigo-950 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={discordConfig.events?.newLead ?? true}
                    onChange={(e) =>
                      setDiscordConfig({
                        ...discordConfig,
                        events: { ...discordConfig.events, newLead: e.target.checked },
                      })
                    }
                    className="rounded text-indigo-600 focus:ring-0"
                  />
                  <span className="text-slate-300">New Inbound Leads</span>
                </label>
                <label className="flex items-center space-x-2 p-2 rounded-lg bg-[#060c18] border border-indigo-950 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={discordConfig.events?.dealFunded ?? true}
                    onChange={(e) =>
                      setDiscordConfig({
                        ...discordConfig,
                        events: { ...discordConfig.events, dealFunded: e.target.checked },
                      })
                    }
                    className="rounded text-indigo-600 focus:ring-0"
                  />
                  <span className="text-slate-300">Deal Stage Changes / Funded</span>
                </label>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={handleTestDiscord}
                disabled={isTestingDiscord}
                className="px-3 py-1.5 bg-indigo-900/60 hover:bg-indigo-800 text-indigo-200 border border-indigo-700/60 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isTestingDiscord ? 'Sending Ping...' : 'Test Discord Ping'}</span>
              </button>

              <button
                type="submit"
                disabled={isSavingDiscord}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/30 flex items-center gap-1.5 disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSavingDiscord ? 'Saving...' : 'Save Discord Settings'}</span>
              </button>
            </div>
          </form>

          {discordTestResult && (
            <div className="p-2.5 rounded-xl bg-[#060c18] border border-indigo-900/60 text-xs font-mono text-indigo-300">
              {discordTestResult}
            </div>
          )}
        </div>
      </div>

      {/* Staff Team & Profile Management with Initials Only & Discord Tag */}
      <div className="bg-[#0e1c38] border border-blue-900/80 rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-blue-900/60">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-400" />
              Authorized Staff Team & Discord Handles
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Internal operators, initials avatars, and configured Discord tagging handles.
            </p>
          </div>
          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-md shadow-amber-500/20 flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Edit My Profile & Discord Tag</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(staffList && staffList.length > 0 ? staffList : [
            {
              id: 'staff-robert',
              name: 'Robert',
              email: 'robert@maplexfinancial.com',
              jobTitle: 'Managing Director & Principal',
              role: 'INTERNAL_STAFF_ADMIN',
              phone: '(555) 567-8901',
              discordUsername: 'robert_maplex',
            },
            {
              id: 'staff-steve',
              name: 'Steve',
              email: 'steve@maplexfinancial.com',
              jobTitle: 'Senior Financial Strategist',
              role: 'INTERNAL_STAFF_ADMIN',
              phone: '(555) 456-7890',
              discordUsername: 'steve_strategist',
            },
            {
              id: 'staff-luke',
              name: 'Luke Cowan',
              email: 'luke.cowan@maplexfinancial.com',
              jobTitle: 'Managing Partner & Senior Underwriter',
              role: 'INTERNAL_STAFF_ADMIN',
              phone: '(555) 345-6789',
              discordUsername: 'lukecowan',
            },
            {
              id: 'staff-dana',
              name: 'Dana Javier',
              email: 'dana.javier@maplexfinancial.com',
              jobTitle: 'Director of Operations & Funding',
              role: 'INTERNAL_STAFF_ADMIN',
              phone: '(555) 234-5678',
              discordUsername: 'dana_javier',
            },
          ]).map((staff: any) => {
            const isSelf = currentUser?.id === staff.id || currentUser?.email?.toLowerCase() === staff.email?.toLowerCase();
            return (
              <div
                key={staff.id}
                className={`p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
                  isSelf
                    ? 'bg-blue-950/80 border-amber-400/50 shadow-md shadow-amber-500/5'
                    : 'bg-[#081124] border-blue-900/60 hover:border-blue-700/60'
                }`}
              >
                {/* Initials Avatar Box */}
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-blue-600/30 text-amber-300 border border-amber-400/40 flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                  {getInitials(staff.name)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <div className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                      <span>{staff.name}</span>
                      {isSelf && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 font-extrabold">
                          YOU
                        </span>
                      )}
                    </div>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-900/80 text-amber-300 border border-blue-700">
                      {staff.role || 'ADMIN'}
                    </span>
                  </div>
                  <div className="text-xs text-blue-300 font-medium truncate mt-0.5">
                    {staff.jobTitle || 'Operations'}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate mt-0.5 font-mono">
                    {staff.email}
                  </div>

                  {/* Discord Tag Display */}
                  <div className="mt-2 pt-2 border-t border-blue-900/40 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1 text-indigo-300 font-mono">
                      <AtSign className="w-3 h-3 text-indigo-400" />
                      <span>{staff.discordUsername ? `@${staff.discordUsername}` : 'No Discord Set'}</span>
                    </div>
                    {staff.discordUserId && (
                      <span className="text-[10px] text-slate-500 font-mono">ID: {staff.discordUserId}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lead Sources & Referral Partners Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Custom Lead Sources */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-100 pb-2 border-b border-slate-800">
            Lead Sources ({leadSources.length})
          </h3>

          <form onSubmit={handleAddSource} className="flex items-center space-x-2">
            <input
              type="text"
              value={newSourceName}
              onChange={(e) => setNewSourceName(e.target.value)}
              placeholder="Add custom lead source..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shrink-0 transition-colors"
            >
              + Add
            </button>
          </form>

          <div className="divide-y divide-slate-800/60 max-h-56 overflow-y-auto">
            {leadSources.map((s) => (
              <div key={s.id} className="py-2 flex items-center justify-between text-xs">
                <span className="text-slate-200 font-medium">{s.name}</span>
                <button
                  onClick={() => deleteLeadSource(s.id)}
                  className="p-1 text-slate-600 hover:text-rose-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Independent Referral Partners */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-100 pb-2 border-b border-slate-800">
            Independent Referral Partners ({referralPartners.length})
          </h3>

          <form onSubmit={handleAddPartner} className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                required
                value={newPartnerForm.name}
                onChange={(e) => setNewPartnerForm({ ...newPartnerForm, name: e.target.value })}
                placeholder="Partner Name *"
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              />
              <input
                type="text"
                value={newPartnerForm.company}
                onChange={(e) => setNewPartnerForm({ ...newPartnerForm, company: e.target.value })}
                placeholder="Company"
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                step="0.1"
                value={newPartnerForm.defaultCommissionPoints}
                onChange={(e) => setNewPartnerForm({ ...newPartnerForm, defaultCommissionPoints: Number(e.target.value) })}
                placeholder="Default Points %"
                className="w-1/2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="w-1/2 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors"
              >
                + Add Partner
              </button>
            </div>
          </form>

          <div className="divide-y divide-slate-800/60 max-h-56 overflow-y-auto">
            {referralPartners.map((p) => (
              <div key={p.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-200">{p.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {p.company || 'Partner'} • Default: {p.defaultCommissionPoints}% points
                  </div>
                </div>
                <button
                  onClick={() => deleteReferralPartner(p.id)}
                  className="p-1 text-slate-600 hover:text-rose-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User Profile Modal */}
      {isProfileModalOpen && (
        <UserProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
        />
      )}
    </div>
  );
};
