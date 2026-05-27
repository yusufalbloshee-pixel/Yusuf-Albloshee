/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Maximize2, RotateCcw, Sliders, Box, HardHat, Info, 
  Sparkles, Layers, ArrowRight, CornerDownRight, Check
} from 'lucide-react';
import { WarehouseConfig, LockerUnit, RackCell, Item } from '../types';

interface SpatialPlannerProps {
  config: WarehouseConfig;
  onChangeConfig: (config: WarehouseConfig) => void;
  items: Item[];
  lockers: LockerUnit[];
  onSelectLocker: (lockerId: string) => void;
  onSelectRackCell: (cellId: string) => void;
  selectedElementId: string | null;
}

export default function SpatialPlanner({
  config,
  onChangeConfig,
  items,
  lockers,
  onSelectLocker,
  onSelectRackCell,
  selectedElementId,
}: SpatialPlannerProps) {
  const [elevationTab, setElevationTab] = useState<'rack-b' | 'cupboard-a'>('rack-b');
  const [showFlowlines, setShowFlowlines] = useState(true);

  // Layout schemes configurations presets
  const applyPreset = (preset: 'scheme-1' | 'scheme-2' | 'custom_optimized') => {
    if (preset === 'scheme-1') {
      onChangeConfig({
        ...config,
        selectedScheme: 'scheme-1',
        middleChasmWidth: 1.0,
        leftLockerColumns: 4,
        rightRackRows: 1,
        passageWidth: 1.2,
      });
    } else if (preset === 'scheme-2') {
      onChangeConfig({
        ...config,
        selectedScheme: 'scheme-2',
        middleChasmWidth: 0.8,
        leftLockerColumns: 2,
        rightRackRows: 3,
        passageWidth: 1.0,
      });
    } else {
      // Custom Optimized: "中间打空, 左右分区, 保证高效低成本"
      onChangeConfig({
        ...config,
        selectedScheme: 'custom_optimized',
        middleChasmWidth: 2.2,
        leftLockerColumns: 6,
        rightRackRows: 2,
        passageWidth: 1.8,
      });
    }
  };

  // Build simulated racks for the right chamber
  const rightRacks: RackCell[] = [
    { id: 'rack-0', tier: 3, sizeClass: 'medium', occupiedCount: items.filter(i => i.storageType === 'unsold_warehouse' && i.size === 'medium').length, maxCapacity: 8, row: 'right', itemNames: items.filter(i => i.storageType === 'unsold_warehouse' && i.size === 'medium').map(i => i.name) },
    { id: 'rack-1', tier: 2, sizeClass: 'small', occupiedCount: Math.ceil(items.filter(i => i.storageType === 'unsold_warehouse' && i.size === 'small').length / 2), maxCapacity: 12, row: 'right', itemNames: items.filter(i => i.storageType === 'unsold_warehouse' && i.size === 'small').slice(0, 5).map(i => i.name) },
    { id: 'rack-2', tier: 1, sizeClass: 'small', occupiedCount: Math.floor(items.filter(i => i.storageType === 'unsold_warehouse' && i.size === 'small').length / 2), maxCapacity: 12, row: 'right', itemNames: items.filter(i => i.storageType === 'unsold_warehouse' && i.size === 'small').slice(5).map(i => i.name) },
    { id: 'rack-3', tier: 0, sizeClass: 'large', occupiedCount: items.filter(i => i.storageType === 'unsold_warehouse' && i.size === 'large').length, maxCapacity: 5, row: 'right', itemNames: items.filter(i => i.storageType === 'unsold_warehouse' && i.size === 'large').map(i => i.name) },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full" id="spatial-planner-container">
      {/* Upper Navigation / Settings header */}
      <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-teal-50 text-teal-700 text-xs px-2.5 py-1 rounded-full font-medium border border-teal-100/50">
              西美雁塔校区 · 宿舍微仓规划
            </span>
            <span className="text-xs text-slate-400 font-mono">3.6m × 12.4m</span>
          </div>
          <h3 className="text-lg font-bold text-slate-800 tracking-tight mt-1">
            2D 宿舍重构与流线交互图纸
          </h3>
          <p className="text-xs text-slate-500">
            中间宿舍墙体打空作大通道，左侧宿舍实现自助扫码自提，右侧实施4层货架线上发货。
          </p>
        </div>

        {/* Scheme Selector */}
        <div className="flex bg-slate-100 p-1 rounded-xl self-start md:self-center">
          <button
            id="preset-scheme-1"
            onClick={() => applyPreset('scheme-1')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              config.selectedScheme === 'scheme-1'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            方案一 (紧凑自提柜)
          </button>
          <button
            id="preset-scheme-2"
            onClick={() => applyPreset('scheme-2')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              config.selectedScheme === 'scheme-2'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            方案二 (密集纯货架)
          </button>
          <button
            id="preset-custom"
            onClick={() => applyPreset('custom_optimized')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
              config.selectedScheme === 'custom_optimized'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            西美定制极低成本款
          </button>
        </div>
      </div>

      {/* Workspace Grid panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 min-h-[500px]">
        {/* Left Side: Interactive Map */}
        <div className="lg:col-span-8 p-6 flex flex-col items-center justify-center bg-slate-50/30 border-r border-slate-100 relative min-h-[400px]">
          {/* Legend Details */}
          <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-sm p-3 rounded-xl border border-slate-100 shadow-sm text-[11px] space-y-2 max-w-xs">
            <span className="font-bold text-slate-700 block">图例与运行流线:</span>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 font-sans">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-3 h-3 rounded bg-teal-500/20 border border-teal-500 block"></span>
                智能自提柜区
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-3 h-3 rounded bg-amber-500/20 border border-amber-500 block"></span>
                挂架/中型橱
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-3 h-3 rounded bg-indigo-500/20 border border-indigo-500 block"></span>
                4层分类货架
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-3 h-3 rounded bg-rose-500/10 border border-rose-400 border-dashed block"></span>
                核心分拨区
              </span>
            </div>
            <div className="border-t border-slate-100 pt-1.5 flex items-center justify-between gap-1">
              <span className="text-slate-500">显示路线动画</span>
              <button 
                id="toggle-flowlines"
                onClick={() => setShowFlowlines(!showFlowlines)}
                className={`w-8 h-4 rounded-full transition-colors relative ${showFlowlines ? 'bg-emerald-500' : 'bg-slate-300'}`}
              >
                <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-transform ${showFlowlines ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </div>

          {/* Interactive Blueprint Canvas SVG */}
          <div className="w-full h-full max-w-2xl flex items-center justify-center p-2">
            <svg 
              viewBox="0 0 800 500" 
              className="w-full h-auto drop-shadow-md select-none border border-slate-200 bg-[#FAFBFD] rounded-xl font-mono"
              id="blueprint-svg-interactive"
            >
              {/* Construction Blueprint grid */}
              <defs>
                <pattern id="blueprint-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E2E8F0" strokeWidth="0.5" />
                </pattern>
                <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#F43F5E" />
                </marker>
              </defs>
              <rect width="800" height="500" fill="url(#blueprint-grid)" rx="12" />

              {/* Outside boundary labels */}
              <text x="400" y="30" textAnchor="middle" fill="#94A3B8" className="text-xs font-bold font-sans tracking-widest">
                西美雁塔校区 A栋宿舍外侧通道
              </text>
              
              {/* Warehouse Walls Outline */}
              <rect x="50" y="70" width="700" height="340" fill="none" stroke="#475569" strokeWidth="4" />
              <line x1="50" y1="240" x2="180" y2="240" stroke="#475569" strokeWidth="3" /> {/* Internal dorm partition 1 */}
              <line x1="620" y1="240" x2="750" y2="240" stroke="#475569" strokeWidth="3" /> {/* Internal dorm partition 2 */}

              {/* THE HOLLOWED OUT CENTRAL PARTITION */}
              <g className="opacity-80">
                {/* Visualizer showing where the partition is knocked down/hollowed-out */}
                <line 
                  x1="180" y1="240" 
                  x2="620" y2="240" 
                  stroke="#F43F5E" 
                  strokeWidth="3" 
                  strokeDasharray="4 6" 
                />
                <rect x="180" y="234" width="440" height="12" fill="#FFE4E6" fillOpacity="0.4" />
                <rect x="300" y="225" width="200" height="30" fill="#FFF1F2" stroke="#F43F5E" strokeWidth="1" rx="4" />
                <text x="400" y="244" textAnchor="middle" fill="#E11D48" className="text-[10px] font-bold font-sans">
                  ✂️ 宿舍核心中空打断区 — 分拨物留主干通道
                </text>
              </g>

              {/* Sub-areas labeling */}
              {/* Left Chamber: SELF-PICKUP */}
              <rect x="50" y="70" width="250" height="340" fill="#0D9488" fillOpacity="0.02" />
              <text x="65" y="95" fill="#0D9488" className="text-sm font-bold font-sans">
                🟢 左半：无人值守自提空间
              </text>
              <text x="65" y="112" fill="#5E7C79" className="text-[10px] font-sans">
                (毕业生直接扫码/输手机号自提，全自动开门开柜)
              </text>

              {/* Right Chamber: STORAGE WRHOUSE */}
              <rect x="500" y="70" width="250" height="340" fill="#4F46E5" fillOpacity="0.02" />
              <text x="515" y="95" fill="#4F46E5" className="text-sm font-bold font-sans">
                🔵 右半：未出售物品大仓
              </text>
              <text x="515" y="112" fill="#6064AD" className="text-[10px] font-sans">
                (分级层重固货架，用于线上拍卖、集中寄送)
              </text>

              {/* Middle sorting area */}
              <rect x="320" y="80" width="160" height="130" fill="#F43F5E" fillOpacity="0.05" rx="6" stroke="#FDA4AF" strokeDasharray="2 3" />
              <text x="400" y="110" textAnchor="middle" fill="#E11D48" className="text-xs font-bold font-sans">
                分拣/分拨区 (Sorting)
              </text>
              <text x="400" y="125" textAnchor="middle" fill="#881337" className="text-[9px]">
                (毕业生刚送达物品的缓冲区)
              </text>
              
              {/* Active items inside sorting area */}
              <g transform="translate(360, 140)">
                <rect x="0" y="0" width="24" height="24" fill="#F1F5F9" stroke="#CBD5E1" rx="3" />
                <rect x="4" y="4" width="16" height="5" fill="#94A3B8" rx="1" />
                <text x="12" y="20" textAnchor="middle" fontSize="8" fill="#64748B">A</text>
              </g>
              <g transform="translate(390, 150)">
                <rect x="0" y="0" width="24" height="24" fill="#FBF7F5" stroke="#FDBA74" rx="3" />
                <circle cx="12" cy="12" r="5" fill="#F97316" />
                <text x="12" y="21" textAnchor="middle" fontSize="6" fill="#FFF">B</text>
              </g>
              <g transform="translate(420, 135)">
                <rect x="0" y="0" width="20" height="20" fill="#F1F5F9" stroke="#E2E8F0" rx="2" />
                <text x="10" y="12" textAnchor="middle" fontSize="8" fill="#94A3B8">📦</text>
              </g>

              {/* Core Layout Items - LEFT SIDE DORM (SELF-PICKUP) */}
              {/* Cupboard - 柜子 for hangers (可悬挂中型物品) */}
              <g 
                className="cursor-pointer group" 
                onClick={() => {
                  setElevationTab('cupboard-a');
                  onSelectRackCell('cupboard');
                }}
              >
                <rect 
                  x="60" y="130" width="100" height="60" 
                  fill={selectedElementId === 'cupboard' ? '#F2FAFA' : '#F8FAFC'} 
                  stroke={selectedElementId === 'cupboard' ? '#0D9488' : '#334155'} 
                  strokeWidth={selectedElementId === 'cupboard' ? "3" : "2"} 
                  rx="4" 
                />
                <line x1="60" y1="160" x2="160" y2="160" stroke="#94A3B8" strokeWidth="1" strokeDasharray="2 2" />
                {/* Hanger icons inside */}
                <text x="110" y="150" textAnchor="middle" fill="#0D9488" className="text-xs font-sans font-bold">
                  左侧衣帽挂橱
                </text>
                <text x="110" y="180" textAnchor="middle" fill="#64748B" className="text-[9px]">
                  (可挂毕业作品/中件)
                </text>
              </g>

              {/* IoT Smart lockers components (格子铺) */}
              <g transform="translate(60, 210)">
                <text x="0" y="-10" textAnchor="start" fill="#0F766E" className="text-[10px] font-bold">
                  智能电控自提柜 B门柜
                </text>
                {/* Draw cabinet containing lockers */}
                <rect x="0" y="0" width="130" height="180" fill="#F0FDFA" stroke="#0D9488" strokeWidth="2" rx="6" />
                
                {/* Individual grid elements mapping lockers */}
                {lockers.slice(0, 12).map((loc, idx) => {
                  const col = idx % 3;
                  const row = Math.floor(idx / 3);
                  const w = 36;
                  const h = 38;
                  const x = 7 + col * 40;
                  const y = 8 + row * 42;
                  
                  let cellFill = "#FFFFFF";
                  let cellStroke = "#5EEAD4";
                  let cellTextColor = "#0F766E";

                  if (selectedElementId === loc.id) {
                    cellFill = "#CCFBF1";
                    cellStroke = "#0D9488";
                  } else if (loc.status === 'opening' || loc.status === 'success') {
                    cellFill = "#FEF08A";
                    cellStroke = "#EAB308";
                    cellTextColor = "#854D0E";
                  } else if (loc.occupied) {
                    cellFill = "#E0F2FE";
                    cellStroke = "#38BDF8";
                  }

                  return (
                    <g 
                      key={loc.id} 
                      transform={`translate(${x}, ${y})`}
                      className="cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectLocker(loc.id);
                      }}
                    >
                      <rect 
                        x="0" y="0" width={w} height={h} 
                        fill={cellFill} 
                        stroke={cellStroke} 
                        strokeWidth="1.5" 
                        rx="3" 
                        className="transition-all duration-300 hover:fill-teal-50"
                      />
                      {/* Locker label */}
                      <text x={w/2} y={15} textAnchor="middle" fontSize="8" fontWeight="bold" fill={cellTextColor}>
                        {loc.label}
                      </text>
                      {/* Sub-status indicator */}
                      <circle 
                        cx={w - 6} cy={h - 6} r="2.5" 
                        fill={loc.status === 'opening' ? "#EAB308" : loc.occupied ? "#38BDF8" : "#10B981"} 
                      />
                      {loc.status === 'opening' && (
                        <path d="M4,28 L10,32 L20,24" stroke="#854D0E" strokeWidth="1.5" fill="none" />
                      )}
                    </g>
                  );
                })}
              </g>

              {/* Core Layout Items - RIGHT SIDE DORM (STORAGE & LOGISTICS) */}
              <g transform="translate(530, 130)">
                <text x="0" y="-12" textAnchor="start" fill="#4338CA" className="text-[10px] font-bold">
                  4层强级重性货架 R系列
                </text>
                
                {/* 3 rows of long shelves representing Rack Config */}
                {[0, 1, 2].map((sIdx) => {
                  const y = sIdx * 80;
                  const isSelected = selectedElementId === `rack-cell-${sIdx}`;
                  return (
                    <g 
                      key={sIdx}
                      transform={`translate(0, ${y})`}
                      className="cursor-pointer"
                      onClick={() => {
                        setElevationTab('rack-b');
                        onSelectRackCell(`rack-cell-${sIdx}`);
                      }}
                    >
                      <rect 
                        x="0" y="0" width="160" height="50" 
                        fill={isSelected ? "#EEF2FF" : "#F8FAFC"} 
                        stroke={isSelected ? "#4F46E5" : "#475569"} 
                        strokeWidth={isSelected ? "3" : "1.5"} 
                        rx="4" 
                      />
                      {/* Drawer shelf bars */}
                      <line x1="0" y1="25" x2="160" y2="25" stroke="#94A3B8" strokeWidth="1" />
                      
                      {/* Draw visual items on the shelves */}
                      <g transform="translate(10, 8)" className="opacity-80">
                        <rect x="0" y="0" width="30" height="12" fill="#E0E7FF" stroke="#818CF8" rx="2" />
                        <rect x="35" y="0" width="40" height="12" fill="#F1F5F9" stroke="#94A3B8" rx="2" />
                        <rect x="80" y="0" width="20" height="12" fill="#FEF3C7" stroke="#F59E0B" rx="2" />
                        <circle cx="120" cy="6" r="4.5" fill="#34D399" />
                      </g>
                      <g transform="translate(15, 30)" className="opacity-80">
                        <rect x="0" y="0" width="50" height="12" fill="#EDE9FE" stroke="#A78BFA" rx="2" />
                        <rect x="55" y="0" width="25" height="12" fill="#E0F2FE" stroke="#38BDF8" rx="2" />
                        <rect x="85" y="0" width="35" height="12" fill="#FEE2E2" stroke="#F87171" rx="2" />
                      </g>
                      
                      {/* Label of shelf */}
                      <rect x="115" y="16" width="35" height="16" fill="#312E81" rx="3" />
                      <text x="132" y="27" textAnchor="middle" fill="#FFF" className="text-[8px] font-bold">
                        货架 {String.fromCharCode(65 + sIdx)}
                      </text>
                    </g>
                  );
                })}
              </g>

              {/* Middle corridor dotted path representing efficient layout */}
              <g opacity={showFlowlines ? 0.9 : 0}>
                {/* Arrow from Front entrance, going through sorting area, then splitting */}
                {/* Door A (Entrance bottom right) */}
                <path 
                  d="M 430,410 L 430,370 L 400,320 L 400,200" 
                  fill="none" 
                  stroke="#F35F8A" 
                  strokeWidth="2.5" 
                  strokeDasharray="6 4"
                  markerEnd="url(#arrow)"
                >
                  <animate attributeName="stroke-dashoffset" values="30;0" dur="2s" repeatCount="indefinite" />
                </path>
                
                {/* Path from sorting split-left to self-pickup lockers */}
                <path 
                  d="M 370,160 L 320,160 L 260,160 L 200,250" 
                  fill="none" 
                  stroke="#0D9488" 
                  strokeWidth="2" 
                  strokeDasharray="5 5"
                  markerEnd="url(#arrow)"
                >
                  <animate attributeName="stroke-dashoffset" values="40;0" dur="3s" repeatCount="indefinite" />
                </path>

                {/* Path from sorting split-right to storage racks */}
                <path 
                  d="M 430,160 L 490,160 L 520,160 L 520,280" 
                  fill="none" 
                  stroke="#4F46E5" 
                  strokeWidth="2" 
                  strokeDasharray="5 5"
                  markerEnd="url(#arrow)"
                >
                  <animate attributeName="stroke-dashoffset" values="0;40" dur="3s" repeatCount="indefinite" />
                </path>
                
                {/* Human pick flow route */}
                <path 
                  d="M 120,390 L 120,410" 
                  fill="none" 
                  stroke="#10B981" 
                  strokeWidth="2" 
                  strokeDasharray="4 4"
                  markerEnd="url(#arrow)"
                />
              </g>

              {/* Doors structures */}
              {/* Bottom Entrance Door Right (Dorm A door) */}
              <g transform="translate(415, 395)" fill="none" stroke="#475569" strokeWidth="2.5">
                <rect x="0" y="10" width="30" height="8" fill="#CBD5E1" stroke="#334155" />
                <path d="M 0,10 A 30,30 0 0,0 -30,-20 L -30,10" strokeDasharray="2 2" />
                <line x1="0" y1="10" x2="-30" y2="-20" stroke="#EF4444" />
                <text x="35" y="3" fontSize="8" stroke="none" fill="#64748B">📥 入口(送收货)</text>
              </g>

              {/* Bottom Exit Door Left (Dorm B door for pickup) */}
              <g transform="translate(100, 395)" fill="none" stroke="#475569" strokeWidth="2.5">
                <rect x="0" y="10" width="30" height="8" fill="#CBD5E1" stroke="#334155" />
                <path d="M 30,10 A 30,30 0 0,1 60,-20 L 60,10" strokeDasharray="2 2" />
                <line x1="30" y1="10" x2="60" y2="-20" stroke="#22C55E" />
                <text x="-45" y="3" fontSize="8" stroke="none" fill="#64748B">📤 自提口(离场)</text>
              </g>

              {/* Dimension measurement line */}
              <g stroke="#94A3B8" strokeWidth="1" fill="#94A3B8" className="text-[10px] opacity-75">
                <line x1="50" y1="430" x2="750" y2="430" />
                <line x1="50" y1="425" x2="50" y2="435" />
                <line x1="750" y1="425" x2="750" y2="435" />
                <line x1="400" y1="425" x2="400" y2="435" stroke="#F43F5E" />
                {/* Marks */}
                <text x="225" y="445" textAnchor="middle" stroke="none" className="font-sans">大房左半宿舍宽 ~5.2米</text>
                <text x="400" y="445" textAnchor="middle" stroke="none" fill="#E11D48" className="font-sans font-bold">打空通道位 ({config.middleChasmWidth.toFixed(1)}m)</text>
                <text x="575" y="445" textAnchor="middle" stroke="none" className="font-sans">大房右半宿舍宽 ~5.2米</text>
              </g>
            </svg>
          </div>
        </div>

        {/* Right Side: Visual Elevation Section */}
        <div className="lg:col-span-4 p-5 flex flex-col justify-between bg-slate-50/10">
          <div>
            <div className="flex bg-slate-100 p-1 rounded-xl mb-4">
              <button
                id="tab-rack-ele"
                onClick={() => setElevationTab('rack-b')}
                className={`flex-1 text-center py-1.5 rounded-lg text-xs font-medium transition-all ${
                  elevationTab === 'rack-b'
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                右侧4层货架剖面 (≥1.8m)
              </button>
              <button
                id="tab-cupboard-ele"
                onClick={() => setElevationTab('cupboard-a')}
                className={`flex-1 text-center py-1.5 rounded-lg text-xs font-medium transition-all ${
                  elevationTab === 'cupboard-a'
                    ? 'bg-white text-teal-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
              }`}
              >
                左侧挂物柜细节
              </button>
            </div>

            <AnimatePresence mode="wait">
              {elevationTab === 'rack-b' ? (
                <motion.div
                  key="rack-b"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-4"
                >
                  {/* Detailed Description */}
                  <div className="bg-indigo-50/50 rounded-xl p-3 border border-indigo-100/50">
                    <div className="flex items-center gap-1.5 text-indigo-800 font-bold text-xs mb-1">
                      <Layers className="w-3.5 h-3.5" />
                      <span>4层精细分类货架 (根据草图设计)</span>
                    </div>
                    <p className="text-[11px] text-indigo-900/80 leading-relaxed font-sans">
                      高度 ≥1.8米。设计上将物品按<strong>“下重上轻、中巧”</strong>的原则分布：最底层放大件，顶层放中件，中间两层放小件，最大限度降低操作货损与理货体能成本。
                    </p>
                  </div>

                  {/* Rack vertical schematic representation */}
                  <div className="border border-indigo-100 rounded-xl p-3 bg-white space-y-2.5 shadow-xs font-mono">
                    <div className="text-[10px] text-slate-400 font-bold border-b border-dashed border-slate-100 pb-1.5 flex justify-between">
                      <span>高度对应配货规则</span>
                      <span className="text-indigo-600">层高 ≥ 1.8m</span>
                    </div>

                    {/* Rendering 4 categories as specified by hand drawing */}
                    {rightRacks.map((cell) => (
                      <div 
                        key={cell.id} 
                        className={`p-2.5 rounded-lg border flex flex-col gap-1 transition-all ${
                          cell.tier === 0 
                            ? 'bg-rose-50/30 border-rose-200/60' 
                            : cell.tier === 3 
                              ? 'bg-amber-50/20 border-amber-200/60' 
                              : 'bg-emerald-50/10 border-emerald-200/60'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-700">
                            第 {cell.tier + 1} 层 {cell.tier === 3 ? '(顶层)' : cell.tier === 0 ? '(底层)' : '(中层)'}
                          </span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                            cell.sizeClass === 'large' 
                              ? 'bg-rose-100 text-rose-700' 
                              : cell.sizeClass === 'medium' 
                                ? 'bg-amber-100 text-amber-700' 
                                : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            特配：{cell.sizeClass === 'large' ? '大型物品' : cell.sizeClass === 'medium' ? '中型物品' : '小型物品'}
                          </span>
                        </div>

                        {/* Inventory slots bar indicator */}
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex mt-1">
                          {Array.from({ length: cell.maxCapacity }).map((_, i) => (
                            <div 
                              key={i} 
                              className={`flex-1 border-r border-white last:border-0 ${
                                i < cell.occupiedCount 
                                  ? (cell.sizeClass === 'large' ? 'bg-rose-500' : cell.sizeClass === 'medium' ? 'bg-amber-500' : 'bg-emerald-500') 
                                  : 'bg-slate-200/60'
                              }`} 
                            />
                          ))}
                        </div>

                        <div className="flex justify-between items-center text-[9px] text-slate-400 mt-1 font-sans">
                          <span>
                            空间使用率: {(cell.occupiedCount / cell.maxCapacity * 100).toFixed(0)}%
                          </span>
                          <span className="truncate max-w-[140px] text-slate-500 italic">
                            {cell.itemNames.length > 0 ? cell.itemNames.slice(0, 2).join(' / ') : '暂无置放'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="cupboard-a"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-4 font-sans"
                >
                  <div className="bg-teal-50/60 rounded-xl p-3 border border-teal-100/50">
                    <div className="flex items-center gap-1.5 text-teal-800 font-bold text-xs mb-1">
                      <Box className="w-3.5 h-3.5" />
                      <span>自提侧衣橱挂架：中型精细分配</span>
                    </div>
                    <p className="text-[11px] text-teal-900/80 leading-relaxed">
                      利用宿舍原装实木柜的衣橱部分，重新设计内横管。免去了新购货架成本，专门挂置无法压折的美术毕业作品、画纸等高价值、不规则尺寸物品。
                    </p>
                  </div>

                  <div className="border border-teal-100 rounded-xl p-4 bg-white shadow-xs">
                    <h4 className="text-xs font-bold text-slate-700 mb-2 font-mono">
                      📐 悬挂柜免成本重构方案:
                    </h4>
                    <ul className="text-xs text-slate-600 space-y-2">
                      <li className="flex gap-2">
                        <span className="text-teal-500 font-bold">•</span>
                        <span><strong>直接利旧:</strong> 沿用西美学生寝室闲置原木橱，无需任何采购或组装费用。</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-teal-500 font-bold">•</span>
                        <span><strong>挂杆扩容:</strong> 挂杆可支持悬挂最高 15 幅装裱毕业作品画轴，降低挤压破损。</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-teal-500 font-bold">•</span>
                        <span><strong>下方叠放:</strong> 下部隔板用作中型电子产品（如数位板、考研书堆）的周转型自提点。</span>
                      </li>
                    </ul>

                    {/* Simple geometric drawing of customized cupboard structure */}
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <span className="text-[9px] text-slate-400 uppercase font-mono tracking-wider block mb-2">
                        橱柜纵深利用示意 (X-Ray)
                      </span>
                      <div className="h-24 bg-slate-50 border border-slate-200 rounded-lg relative flex items-center justify-center overflow-hidden">
                        {/* Hanging clothes outline inside */}
                        <div className="absolute top-2 left-6 w-12 h-0.5 bg-slate-400" />
                        <div className="absolute top-2 w-1.5 h-16 bg-emerald-500 rounded-xs left-8 opacity-75" />
                        <div className="absolute top-2 w-1.5 h-14 bg-amber-500 rounded-xs left-12 opacity-75" />
                        <div className="absolute top-2 w-1.5 h-18 bg-indigo-500 rounded-xs left-16 opacity-75" />
                        
                        <div className="absolute bottom-2 right-4 w-12 h-10 border border-teal-300 rounded bg-teal-50/60 flex items-center justify-center">
                          <span className="text-[8px] text-teal-700">叠放区</span>
                        </div>
                        <span className="text-[9px] text-slate-400 absolute left-2 bottom-1">利旧率 100%</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Interactive sliders for micro adjustment */}
          <div className="mt-5 pt-4 border-t border-slate-100 space-y-4 bg-slate-50/50 p-4 rounded-xl">
            <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-emerald-500" />
              <span>微调仓储中空与通行参数</span>
            </h4>

            {/* Middle chasm width adjustment */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono text-slate-500">
                <span>中间大通道(打空)宽度:</span>
                <span className="font-bold text-rose-600">{config.middleChasmWidth.toFixed(1)} 米</span>
              </div>
              <input
                type="range"
                min="0.6"
                max="3.2"
                step="0.2"
                value={config.middleChasmWidth}
                onChange={(e) => {
                  onChangeConfig({
                    ...config,
                    middleChasmWidth: parseFloat(e.target.value),
                    selectedScheme: 'custom_optimized' // switch to custom layout when manually editing
                  });
                }}
                className="w-full accent-rose-500 h-1 bg-slate-200 rounded-lg cursor-pointer"
              />
              <span className="text-[9px] text-slate-400 leading-tight block font-sans">
                💡 宽度增加降低货损和瓶颈，但会适当摊减左右侧货架陈列面积。
              </span>
            </div>

            {/* Passage Width */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono text-slate-500">
                <span>自提口单向通行道宽:</span>
                <span className="font-bold text-teal-600">{config.passageWidth.toFixed(1)} 米</span>
              </div>
              <input
                type="range"
                min="0.8"
                max="2.5"
                step="0.1"
                value={config.passageWidth}
                onChange={(e) => {
                  onChangeConfig({
                    ...config,
                    passageWidth: parseFloat(e.target.value),
                    selectedScheme: 'custom_optimized'
                  });
                }}
                className="w-full accent-teal-600 h-1 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
