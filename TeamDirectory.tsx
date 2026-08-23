import React from 'react';
import {
  UserSquare2,
  ShieldCheck,
  Phone,
  Mail,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

export const TeamDirectory: React.FC = () => {
  const { staffList, currentUser, setCurrentUser } = useAuth();
  const { clients, deals } = useData();

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl">
        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded uppercase font-mono">
            Internal Staff Authority (4 Operators)
          </span>
        </div>
        <h1 className="text-xl font-bold text-slate-100 mt-1 flex items-center gap-2">
          <UserSquare2 className="w-5 h-5 text-blue-400" />
          Maple X Team & Operators Directory
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          All 4 internal staff members possess identical administrative authority across all client files, verifications, underwriting evaluations, and commissions.
        </p>
      </div>

      {/* Staff Members Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {staffList.map((staff) => {
          const isCurrent = currentUser?.id === staff.id;
          const assignedClients = clients.filter((c) => c.assignedStaff === staff.name).length;
          const assignedDeals = deals.filter((d) => d.assignedStaff === staff.name).length;

          return (
            <div
              key={staff.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                isCurrent
                  ? 'bg-blue-500/10 border-blue-500/50 shadow-md shadow-blue-500/10'
                  : 'bg-slate-900/40 border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center justify-center font-bold text-sm">
                    {staff.name.charAt(0)}
                  </div>
                  {isCurrent && (
                    <span className="text-[9px] px-2 py-0.5 rounded bg-blue-600 text-white font-bold uppercase font-mono">
                      Active Operator
                    </span>
                  )}
                </div>

                <div className="mt-3">
                  <h3 className="text-sm font-bold text-slate-100">{staff.name}</h3>
                  <div className="text-xs text-blue-400 font-medium">{staff.jobTitle}</div>
                </div>

                <div className="space-y-1 mt-3 text-xs text-slate-400 font-mono">
                  <div>{staff.email}</div>
                  <div>{staff.phone}</div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-center text-xs font-mono">
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-500 block uppercase">Client Files</span>
                    <strong className="text-slate-200">{assignedClients}</strong>
                  </div>
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-500 block uppercase">Deals</span>
                    <strong className="text-slate-200">{assignedDeals}</strong>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setCurrentUser(staff)}
                disabled={isCurrent}
                className={`w-full mt-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                  isCurrent
                    ? 'bg-slate-800 text-slate-500 cursor-default'
                    : 'bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-300'
                }`}
              >
                {isCurrent ? 'Current Session' : `Switch to ${staff.name}`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
