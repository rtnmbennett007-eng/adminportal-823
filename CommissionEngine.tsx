import React, { useState } from 'react';
import {
  PieChart,
  DollarSign,
  Users,
  AlertTriangle,
  Plus,
  CheckCircle2,
  Trash2,
  Edit2,
  Save,
  Building2,
  UserSquare2,
  TrendingUp,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { CommissionParticipant, CommissionDirectoryEntry } from '../../types';

interface CommissionEngineProps {
  setActiveTab: (tab: string) => void;
}

export const CommissionEngine: React.FC<CommissionEngineProps> = ({ setActiveTab }) => {
  const {
    deals,
    commissions,
    commissionDirectory,
    addCommissionDirectoryEntry,
    deleteCommissionDirectoryEntry,
    setSelectedClientId,
    markDealCommissionReceived,
  } = useData();

  const [activeSubTab, setActiveSubTab] = useState<'OVERVIEW' | 'DIRECTORY' | 'DEALS'>('OVERVIEW');
  const [showAddDirModal, setShowAddDirModal] = useState(false);
  const [newDirForm, setNewDirForm] = useState<Partial<CommissionDirectoryEntry>>({
    name: '',
    type: 'Internal Staff',
    role: 'Operations & Funding',
    company: '',
    defaultPoints: 1.0,
    email: '',
    phone: '',
  });

  // Calculate Metrics
  const totalFundedVolume = deals
    .filter((d) => d.status === 'FUNDED')
    .reduce((sum, d) => sum + Number(d.fundingAmount), 0);

  const totalCommissionGenerated = deals
    .filter((d) => d.status === 'FUNDED')
    .reduce((sum, d) => sum + (Number(d.fundingAmount) * Number(d.percentage)) / 100, 0);

  const totalCommissionCollected = deals
    .filter((d) => d.status === 'FUNDED' && d.commissionStatus === 'COLLECTED')
    .reduce((sum, d) => sum + (Number(d.fundingAmount) * Number(d.percentage)) / 100, 0);

  const totalCommissionPending = totalCommissionGenerated - totalCommissionCollected;

  // Breakdown by Participant Name
  const participantSummary: Record<string, { pointsSum: number; dollarsSum: number; type: string; count: number }> = {};
  for (const p of commissions) {
    if (!participantSummary[p.name]) {
      participantSummary[p.name] = { pointsSum: 0, dollarsSum: 0, type: p.type, count: 0 };
    }
    participantSummary[p.name].pointsSum += Number(p.points);
    participantSummary[p.name].dollarsSum += Number(p.dollarAmount);
    participantSummary[p.name].count += 1;
  }

  // Unallocated points check
  const unallocatedDeals = deals.map((d) => {
    const pList = commissions.filter((cp) => cp.dealId === d.id);
    const allocatedPoints = pList.reduce((sum, p) => sum + Number(p.points), 0);
    const unallocated = Number((d.percentage - allocatedPoints).toFixed(3));
    return { deal: d, allocatedPoints, unallocated, pList };
  }).filter((item) => item.unallocated > 0.001);

  const handleAddDirectoryEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDirForm.name) return;
    await addCommissionDirectoryEntry({
      ...newDirForm,
      defaultPoints: Number(newDirForm.defaultPoints || 1.0),
    });
    setShowAddDirModal(false);
    setNewDirForm({
      name: '',
      type: 'Internal Staff',
      role: 'Operations & Funding',
      company: '',
      defaultPoints: 1.0,
      email: '',
      phone: '',
    });
  };

  const handleOpenClient = (clientId: string) => {
    setSelectedClientId(clientId);
    setActiveTab('clients');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/40 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded uppercase font-mono">
              Multi-Participant Revenue & Fee Engine
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs text-slate-400">Strictly Internal / No External CRM Sync</span>
          </div>
          <h1 className="text-xl font-bold text-slate-100 mt-1 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-blue-400" />
            Commission & Points Allocation Engine
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time percentage-point splitting and payout calculation across all 4 internal staff (Dana, Luke, Steve, Robert), referral partners, and broker entities.
          </p>
        </div>

        {/* Subtabs */}
        <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs">
          <button
            onClick={() => setActiveSubTab('OVERVIEW')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeSubTab === 'OVERVIEW' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Summary & Balances
          </button>
          <button
            onClick={() => setActiveSubTab('DIRECTORY')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeSubTab === 'DIRECTORY' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Commission Directory ({commissionDirectory.length})
          </button>
          <button
            onClick={() => setActiveSubTab('DEALS')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeSubTab === 'DEALS' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Deals Matrix ({deals.length})
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl">
          <span className="text-xs font-semibold text-slate-400 block">Total Commission Generated</span>
          <div className="text-2xl font-bold text-blue-400 mt-2 font-mono">
            ${totalCommissionGenerated.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">From ${totalFundedVolume.toLocaleString()} in funded loans</div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl">
          <span className="text-xs font-semibold text-slate-400 block">Total Commission Collected</span>
          <div className="text-2xl font-bold text-emerald-400 mt-2 font-mono">
            ${totalCommissionCollected.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-500 mt-1">Settled and disbursed into account</div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl">
          <span className="text-xs font-semibold text-slate-400 block">Total Commission Pending</span>
          <div className="text-2xl font-bold text-sky-400 mt-2 font-mono">
            ${totalCommissionPending.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Awaiting lender wire settlement</div>
        </div>
      </div>

      {/* Unallocated Points Alert */}
      {unallocatedDeals.length > 0 && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-2">
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Unallocated Commission Points Detected on {unallocatedDeals.length} Deals</span>
          </div>
          <p className="text-[11px] text-amber-200/80">
            The following deals have remaining percentage points that have not been assigned to staff or partners:
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {unallocatedDeals.map(({ deal, unallocated }) => (
              <button
                key={deal.id}
                onClick={() => handleOpenClient(deal.clientId)}
                className="px-2.5 py-1 rounded bg-amber-500/20 border border-amber-500/40 text-[10px] text-amber-200 hover:bg-amber-500/30 transition-colors font-mono"
              >
                {deal.clientName} ({deal.product}): <strong className="text-amber-400">+{unallocated}% unassigned</strong>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* SUBTAB 1: SUMMARY BY PARTICIPANT */}
      {/* ---------------------------------------------------- */}
      {activeSubTab === 'OVERVIEW' && (
        <div className="space-y-6">
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 pb-3 border-b border-slate-800">
              <Users className="w-4 h-4 text-blue-400" />
              Commission Distribution Summary by Staff & Partner
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              {Object.entries(participantSummary).map(([name, data]) => (
                <div
                  key={name}
                  className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-100">{name}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                      {data.type}
                    </span>
                  </div>
                  <div className="text-xl font-bold text-emerald-400 font-mono">
                    ${data.dollarsSum.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/60 pt-2 font-mono">
                    <span>{data.count} Deal Allocations</span>
                    <span className="text-blue-400 font-semibold">{data.pointsSum.toFixed(2)}% pts</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* SUBTAB 2: DIRECTORY */}
      {/* ---------------------------------------------------- */}
      {activeSubTab === 'DIRECTORY' && (
        <div className="space-y-6">
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <UserSquare2 className="w-4 h-4 text-blue-400" />
                  Commission Participants Directory
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Preset internal staff, referral partners, and brokers for fast 1-click deal allocation.
                </p>
              </div>

              <button
                onClick={() => setShowAddDirModal(true)}
                className="flex items-center space-x-1 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Participant to Directory</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Name</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Default Role</th>
                    <th className="py-2.5 px-3">Company</th>
                    <th className="py-2.5 px-3">Default Points</th>
                    <th className="py-2.5 px-3">Contact</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {commissionDirectory.map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-3 font-bold text-slate-100">{entry.name}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-mono">
                          {entry.type}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-400">{entry.role}</td>
                      <td className="py-3 px-3 text-slate-400">{entry.company || 'Maple X'}</td>
                      <td className="py-3 px-3 font-mono font-bold text-blue-400">{entry.defaultPoints || 1.0}%</td>
                      <td className="py-3 px-3 text-slate-500 font-mono text-[10px]">{entry.email || entry.phone || 'Internal'}</td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => deleteCommissionDirectoryEntry(entry.id)}
                          className="p-1 text-slate-600 hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* SUBTAB 3: DEALS MATRIX */}
      {/* ---------------------------------------------------- */}
      {activeSubTab === 'DEALS' && (
        <div className="space-y-4">
          {deals.map((deal) => {
            const pList = commissions.filter((cp) => cp.dealId === deal.id);
            const totalCommission = (deal.fundingAmount * deal.percentage) / 100;
            const allocatedPoints = pList.reduce((sum, p) => sum + Number(p.points), 0);
            const unallocated = Number((deal.percentage - allocatedPoints).toFixed(3));

            return (
              <div key={deal.id} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                  <div>
                    <div className="text-sm font-bold text-slate-100 flex items-center gap-2">
                      <span>{deal.clientName} ({deal.businessName})</span>
                      <span className="text-xs text-blue-400 font-mono">[{deal.product}]</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Funding Amount: <strong className="text-slate-200 font-mono">${deal.fundingAmount.toLocaleString()}</strong> • Rate: <strong className="text-blue-400 font-mono">{deal.percentage}%</strong> (${totalCommission.toLocaleString()})
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleOpenClient(deal.clientId)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-blue-300 rounded-lg text-xs font-semibold border border-slate-700 transition-colors"
                    >
                      Manage Allocations in File
                    </button>
                  </div>
                </div>

                {/* Mini Participant Chips */}
                <div className="flex flex-wrap gap-2">
                  {pList.map((p) => (
                    <div
                      key={p.id}
                      className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs flex items-center gap-2"
                    >
                      <strong className="text-slate-200">{p.name}:</strong>
                      <span className="text-blue-400 font-mono">{p.points}%</span>
                      <span className="text-emerald-400 font-mono">(${p.dollarAmount.toLocaleString()})</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 font-mono border-t border-slate-800/60 pt-2">
                  <span>Allocated: {allocatedPoints.toFixed(3)}%</span>
                  {unallocated > 0.001 ? (
                    <span className="text-amber-400 font-bold">Unallocated: {unallocated}% (${((deal.fundingAmount * unallocated) / 100).toLocaleString()})</span>
                  ) : (
                    <span className="text-emerald-400">100% Fully Allocated</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Directory Modal */}
      {showAddDirModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 space-y-4">
            <h3 className="text-sm font-bold text-slate-100">Add Entry to Commission Directory</h3>
            <form onSubmit={handleAddDirectoryEntry} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={newDirForm.name}
                  onChange={(e) => setNewDirForm({ ...newDirForm, name: e.target.value })}
                  placeholder="e.g. Dana / Capital Partner"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Type</label>
                  <select
                    value={newDirForm.type}
                    onChange={(e) => setNewDirForm({ ...newDirForm, type: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Internal Staff">Internal Staff</option>
                    <option value="Referral Partner">Referral Partner</option>
                    <option value="Broker Partner">Broker Partner</option>
                    <option value="Business Partner">Business Partner</option>
                    <option value="Outside Partner">Outside Partner</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Default Points %</label>
                  <input
                    type="number"
                    step="0.001"
                    value={newDirForm.defaultPoints}
                    onChange={(e) => setNewDirForm({ ...newDirForm, defaultPoints: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Role Description</label>
                <input
                  type="text"
                  value={newDirForm.role}
                  onChange={(e) => setNewDirForm({ ...newDirForm, role: e.target.value })}
                  placeholder="e.g. Sales Origination & Closer"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddDirModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  Save to Directory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
