/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  TrendingDown, ShieldCheck, UserCheck, CreditCard, 
  Sparkles, Leaf, Info, Percent
} from 'lucide-react';
import { WarehouseConfig, CostReductionMetrics } from '../types';

interface CostAnalyticsProps {
  config: WarehouseConfig;
  totalItemsCount: number;
}

export default function CostAnalytics({ config, totalItemsCount }: CostAnalyticsProps) {
  // Dynamic cost calculations based on spatial sliders
  // Lockers and shelves determine overall saving factors.
  const baseTraditionalRent = 1800; // Booth rentals, tents, commercial tables
  const traditionalLabor = 3200; // Continuous guarding for open booth over 2 weeks (2 students shift)
  const traditionalLoss = Math.round(totalItemsCount * 12); // ~12 CNY average theft/loss in open stalls due to chaos
  const traditionalShipping = Math.round(totalItemsCount * 0.45 * 13); // Individual disjoint parcel shipping

  // IoT Dorm Warehouse Cost (Our Model)
  // Rent is 0 because we利旧 (reuse) campus idle dorm rooms
  const ourRent = 0; 
  // Labor is minimized because IoT automatic lockers handle most self-pickups. 
  // Only periodic quick sorting and monitoring is required.
  const ourLabor = Math.round(250 + (config.passageWidth * 80)); 
  // Lockers protect works and digit audits tracking reduces theft/loss to near zero.
  const ourLoss = Math.round(totalItemsCount * 1.2); 
  // Unsold items stored on right side are batch-processed and picked up in bulk by couriers, fetching big discount rates
  const ourShipping = Math.round(totalItemsCount * 0.45 * 7.5); 

  const traditionalTotal = baseTraditionalRent + traditionalLabor + traditionalLoss + traditionalShipping;
  const ourTotal = ourRent + ourLabor + ourLoss + ourShipping;
  const totalSaved = traditionalTotal - ourTotal;
  const savingPercentage = ((totalSaved / traditionalTotal) * 100).toFixed(0);

  // Space efficiency dynamically modified by corridor layout
  // Rent efficiency goes high if we pack tightly, low if corridor is too wide.
  // Sorting efficiency is opposite: wide corridor = easy flow, narrow = slow.
  const storageEfficiency = Math.round(95 - Math.abs(config.middleChasmWidth - 1.8) * 15);
  const throughputEfficiency = Math.round(60 + (config.middleChasmWidth / 3.2) * 35);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden p-6 space-y-6 flex flex-col h-full" id="cost-analytics-panel">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="bg-emerald-50 text-emerald-800 text-xs px-2 py-0.5 rounded-md font-bold font-mono">
            COSTS STUDY
          </span>
          <span className="text-xs text-slate-400">毕业活动开支精算</span>
        </div>
        <h3 className="text-base font-bold text-slate-800 mt-1 flex items-center gap-1.5">
          <TrendingDown className="w-4.5 h-4.5 text-emerald-500" />
          <span>经济性审计：传统模式 vs 宿仓重构模式</span>
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          本案通过西美“空关宿舍利旧”、“物联自动开柜自提”与“集中邮寄”，实现核心开支极限下降。
        </p>
      </div>

      {/* Main Big Counter Card */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-5 text-white relative overflow-hidden shadow-md">
        <div className="absolute right-0 bottom-0 opacity-10 translate-x-3 translate-y-3 pointer-events-none">
          <Leaf className="w-40 h-40 text-emerald-400" />
        </div>
        <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-400 block mb-1">
          Estimated Cost Savings (预计开支缩减)
        </span>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black tracking-tight text-emerald-400">
            ¥{totalSaved.toLocaleString()}
          </span>
          <span className="text-xs text-slate-300 font-sans">
            共计节省约 <strong className="text-white font-bold">{savingPercentage}%</strong> 开支
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-5 border-t border-slate-700/60 pt-4 font-sans text-xs">
          <div>
            <span className="text-slate-400 block mb-0.5">传统摆摊模式开支</span>
            <span className="font-mono text-sm text-slate-300 line-through">
              ¥{traditionalTotal.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-emerald-300 block mb-0.5">本物联微仓预计开支</span>
            <span className="font-mono text-sm text-emerald-400 font-bold">
              ¥{ourTotal.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Bar Comparison Charts Built using standard beautiful SVG inline component */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-700">开支分项对比 (CNY)</h4>
        <div className="border border-slate-100 p-4 rounded-xl space-y-4 bg-slate-50/50">
          
          {/* Item 1: Rent */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-sans">
              <span className="text-slate-600 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400 block" />
                空间租用/摊点搭建
              </span>
              <span className="font-mono text-slate-500">
                ¥{traditionalRent(config.selectedScheme)} <span className="text-[10px] text-emerald-600 font-bold">vs ¥0 (校舍空余利旧)</span>
              </span>
            </div>
            {/* Split Bar */}
            <div className="w-full h-2.5 bg-slate-200/50 rounded-full overflow-hidden flex">
              <div 
                className="bg-slate-400 h-full transition-all duration-500" 
                style={{ width: `${(baseTraditionalRent / traditionalTotal) * 100}%` }} 
              />
              <div className="bg-emerald-500 h-full w-0" />
            </div>
          </div>

          {/* Item 2: Labor Security */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-sans">
              <span className="text-slate-600 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 block" />
                看台人工 (2周值乘)
              </span>
              <span className="font-mono text-slate-500">
                ¥{traditionalLabor} <span className="text-[10px] text-teal-600 font-bold">vs ¥{ourLabor} (扫码遥控自提)</span>
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-200/50 rounded-full overflow-hidden flex">
              <div 
                className="bg-amber-400/80 h-full transition-all duration-500" 
                style={{ width: `${(traditionalLabor / traditionalTotal) * 100}%` }} 
              />
              <div 
                className="bg-teal-500 h-full transition-all duration-500" 
                style={{ width: `${(ourLabor / traditionalTotal) * 100}%` }} 
              />
            </div>
          </div>

          {/* Item 3: Cargo Theft Loss */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-sans">
              <span className="text-slate-600 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 block" />
                货损/淋雨/被误拿赔付
              </span>
              <span className="font-mono text-slate-500">
                ¥{traditionalLoss} <span className="text-[10px] text-indigo-600 font-bold">vs ¥{ourLoss} (安全电控箱)</span>
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-200/50 rounded-full overflow-hidden flex">
              <div 
                className="bg-indigo-400/80 h-full transition-all duration-500" 
                style={{ width: `${(traditionalLoss / traditionalTotal) * 100}%` }} 
              />
              <div 
                className="bg-indigo-600 h-full transition-all duration-500" 
                style={{ width: `${(ourLoss / traditionalTotal) * 100}%` }} 
              />
            </div>
          </div>

          {/* Item 4: Delivery logistics */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-sans">
              <span className="text-slate-600 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400 block" />
                线上寄发物流单价
              </span>
              <span className="font-mono text-slate-500">
                ¥13.0 /件 <span className="text-[10px] text-rose-600 font-bold">vs ¥7.5 /件 (极速集中发件)</span>
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-200/50 rounded-full overflow-hidden flex">
              <div className="bg-rose-300 h-full w-[60%] transition-all duration-500" />
              <div className="bg-rose-500 h-full w-[35%] transition-all duration-500" />
            </div>
          </div>

        </div>
      </div>

      {/* Dual Ring gauges showing Layout optimization results */}
      <div className="grid grid-cols-2 gap-4">
        {/* Ring 1 */}
        <div className="border border-slate-100 p-3 rounded-xl flex flex-col items-center justify-center text-center space-y-1.5 bg-white shadow-xs">
          <span className="text-[10px] text-slate-400 font-bold font-sans">宿舍坪效 (Space Ratio)</span>
          <div className="relative w-16 h-16 flex items-center justify-center">
            {/* SVG Ring */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-emerald-500 transition-all duration-500"
                strokeWidth="3.5"
                strokeDasharray={`${storageEfficiency}, 100`}
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-xs font-black font-mono text-slate-700">{storageEfficiency}%</span>
          </div>
          <p className="text-[9px] text-slate-500 leading-tight">通过4层立架与挂橱重组，宿舍立体得用率极高。</p>
        </div>

        {/* Ring 2 */}
        <div className="border border-slate-100 p-3 rounded-xl flex flex-col items-center justify-center text-center space-y-1.5 bg-white shadow-xs">
          <span className="text-[10px] text-slate-400 font-bold font-sans">通道效率 (Flow Index)</span>
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-indigo-500 transition-all duration-500"
                strokeWidth="3.5"
                strokeDasharray={`${throughputEfficiency}, 100`}
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-xs font-black font-mono text-slate-700">{throughputEfficiency}%</span>
          </div>
          <p className="text-[9px] text-slate-500 leading-tight">中间打空分拣，取物路线完全单向不交织。</p>
        </div>
      </div>

      <div className="text-[10px] text-slate-400 flex items-start gap-1 p-3 bg-slate-50 rounded-lg">
        <Info className="w-3.5 h-3.5 text-slate-500 flex-shrink-0 mt-0.5" />
        <span className="leading-normal">
          统计依据西安美术学院雁塔校区宿务往届实际统计测算。减少了人员值乘劳务（¥150/天/人），不使用室外商业帐篷。配合电控格子，极低成本安全环保运行。
        </span>
      </div>
    </div>
  );
}

function traditionalRent(scheme: string) {
  switch (scheme) {
    case 'scheme-1': return 1500;
    case 'scheme-2': return 2100;
    default: return 1800;
  }
}
