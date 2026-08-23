import React from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  PieChart,
  Building2,
  Scale,
} from 'lucide-react';
import { useData } from '../../context/DataContext';

export const OperationsReports: React.FC = () => {
  const { clients, deals, leads } = useData();

  // Metrics
  const totalFundedVolume = deals
    .filter((d) => d.status === 'FUNDED')
    .reduce((sum, d) => sum + Number(d.fundingAmount), 0);

  const totalCommissions = deals
    .filter((d) => d.status === 'FUNDED')
    .reduce((sum, d) => sum + (Number(d.fundingAmount) * Number(d.percentage)) / 100, 0);

  // Volume by Product
  const volumeByProduct: Record<string, number> = {};
  for (const d of deals) {
    volumeByProduct[d.product] = (volumeByProduct[d.product] || 0) + Number(d.fundingAmount);
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl">
        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded uppercase font-mono">
            Intelligence & Analytics
          </span>
        </div>
        <h1 className="text-xl font-bold text-slate-100 mt-1 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-400" />
          Maple X Operations & Financial Performance Reports
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Real-time analysis of funded volume, multi-product distribution, and operational metrics.
        </p>
      </div>

      {/* Volume by Product Breakdown */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 pb-3 border-b border-slate-800">
          <PieChart className="w-4 h-4 text-emerald-400" />
          Funding Capital Distributed by Product Type
        </h3>

        <div className="space-y-3 mt-4">
          {Object.entries(volumeByProduct).map(([product, vol]) => {
            const total = Object.values(volumeByProduct).reduce((a, b) => a + b, 0) || 1;
            const pct = Math.round((vol / total) * 100);

            return (
              <div key={product} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">{product}</span>
                  <span className="font-mono text-slate-400 font-bold">${vol.toLocaleString()} ({pct}%)</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-blue-400 h-full rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
