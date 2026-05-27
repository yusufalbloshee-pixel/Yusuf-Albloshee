/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Smartphone, QrCode, Wifi, Battery, Key, ExternalLink, 
  HelpCircle, CheckCircle, Flame, MapPin, Sparkles, Send
} from 'lucide-react';
import { LockerUnit, Item } from '../types';

interface PhoneSimulatorProps {
  lockers: LockerUnit[];
  items: Item[];
  onTriggerUnlock: (pickupCode: string) => void;
  activeOpeningLocker: LockerUnit | null;
  activeOpeningItem: Item | null;
  onResetLockerState: () => void;
}

export default function PhoneSimulator({
  lockers,
  items,
  onTriggerUnlock,
  activeOpeningLocker,
  activeOpeningItem,
  onResetLockerState
}: PhoneSimulatorProps) {
  const [inputCode, setInputCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showScanAnimation, setShowScanAnimation] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Active items available for self pickup
  const pickableItems = items.filter(
    i => i.storageType === 'self_pickup' && i.status === 'available'
  );

  const handleKeyPress = (num: string) => {
    if (inputCode.length < 4) {
      setErrorMessage('');
      setInputCode(prev => prev + num);
    }
  };

  const handleDelete = () => {
    setInputCode(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setInputCode('');
    setErrorMessage('');
  };

  const handleManualSubmit = () => {
    if (inputCode.length !== 4) {
      setErrorMessage('请输入完整的4位自提数字验证码');
      return;
    }
    
    // Find item
    const matchedItem = items.find(i => i.pickupCode === inputCode);
    if (!matchedItem) {
      setErrorMessage('无效验证码，请在下方列表选择示例代码输入');
      return;
    }

    if (matchedItem.status === 'picked_up') {
      setErrorMessage('该物品已被提取');
      return;
    }

    onTriggerUnlock(inputCode);
  };

  const triggerQrScanSimulation = (code: string) => {
    setShowScanAnimation(true);
    setInputCode(code);
    setTimeout(() => {
      setShowScanAnimation(false);
      onTriggerUnlock(code);
    }, 1800);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full" id="phone-simulator-panel">
      {/* Container Header */}
      <div className="p-5 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-1.5 text-xs text-teal-700 font-bold mb-1">
          <Smartphone className="w-4 h-4" />
          <span>手机移动端遥控自提模拟器</span>
        </div>
        <h3 className="text-base font-bold text-slate-800">
          手机物联遥控开柜演示
        </h3>
        <p className="text-xs text-slate-500 mt-1 leading-normal">
          模拟毕业生物到现场后，手机近距离遥控宿舍电控格子柜开锁的完整IoT通信闭环。
        </p>
      </div>

      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6 flex-1 bg-slate-50/20">
        
        {/* Sub panel 1: The Phone Body Shell Mockup */}
        <div className="flex justify-center items-center">
          <div className="w-[280px] h-[550px] bg-slate-900 rounded-[40px] p-3 shadow-2xl border-4 border-slate-800 relative flex flex-col justify-between overflow-hidden">
            {/* Phone Speaker Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5 bg-slate-900 rounded-b-2xl z-50 flex items-center justify-center">
              <div className="w-12 h-1 bg-slate-700 rounded-full" />
            </div>

            {/* Status bar */}
            <div className="flex justify-between items-center text-[10px] text-slate-300 px-4 pt-1 pb-1 z-40 select-none">
              <span className="font-sans font-medium">10:42</span>
              <div className="flex items-center gap-1">
                <Wifi className="w-3 h-3 text-emerald-400" />
                <span className="text-[8px] font-bold bg-emerald-500/20 text-emerald-300 px-1 rounded-sm">5G IoT</span>
                <Battery className="w-3.5 h-3.5 rotate-90 text-slate-400" />
              </div>
            </div>

            {/* Internal phone operating system display */}
            <div className="bg-slate-950 flex-1 rounded-[32px] p-4 flex flex-col justify-between overflow-hidden relative text-white">
              {/* Scan flash animation */}
              <AnimatePresence>
                {showScanAnimation && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-4 text-center"
                  >
                    <div className="relative w-40 h-40 border border-emerald-500 rounded-lg overflow-hidden flex items-center justify-center">
                      <QrCode className="w-24 h-24 text-emerald-400/70" />
                      {/* Scanning laser line */}
                      <motion.div 
                        animate={{ top: ['0%', '100%', '0%'] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                        className="absolute left-0 right-0 h-0.5 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                      />
                    </div>
                    <span className="text-xs text-emerald-400 mt-4 font-mono font-bold tracking-widest animate-pulse">
                      扫码识别中...
                    </span>
                    <span className="text-[9px] text-slate-400 mt-1">自动获取自提密扣并申请开锁</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* LOCKER OPENING SUCCESS OVERLAY */}
              <AnimatePresence>
                {activeOpeningLocker && activeOpeningItem && (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="absolute inset-3 bg-emerald-950/95 backdrop-blur-md rounded-2xl z-40 p-4 flex flex-col justify-between border border-emerald-500/30 text-center"
                  >
                    <div className="space-y-3 mt-4">
                      <div className="inline-flex p-3 bg-emerald-500/10 rounded-full text-emerald-400 animate-bounce">
                        <CheckCircle className="w-8 h-8" />
                      </div>
                      <h4 className="text-sm font-bold text-emerald-300">🔓 手机指令送达成功</h4>
                      <p className="text-[11px] text-emerald-100/80 leading-relaxed font-sans">
                        宿舍 <strong className="text-white">B栋302室</strong> 的自提柜门 
                        <strong className="text-yellow-300 text-xs">【{activeOpeningLocker.label}】</strong> 已滑开！
                      </p>
                    </div>

                    <div className="bg-black/40 p-3 rounded-lg border border-emerald-500/20 text-left font-sans space-y-1.5">
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>提取物品:</span>
                        <span className="text-emerald-300 font-bold">{activeOpeningItem.name}</span>
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>物品大小:</span>
                        <span className="font-mono">{activeOpeningItem.size === 'small' ? '小型' : '中型'}</span>
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>卖方毕业级:</span>
                        <span className="text-slate-300">{activeOpeningItem.sellerName} ({activeOpeningItem.sellerDorm})</span>
                      </div>
                    </div>

                    <button
                      id="close-success-simulation"
                      onClick={() => {
                        onResetLockerState();
                        handleClear();
                      }}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-emerald-950 font-bold py-2 rounded-xl text-xs transition-all mt-4 font-sans"
                    >
                      我已取走，关闭闸门
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Phone Header */}
              <div className="border-b border-slate-800 pb-2 mb-2">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-[9px] text-emerald-400 font-bold uppercase font-mono tracking-widest">
                    西美雁塔校舍物联
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-200 font-sans mt-0.5">
                  毕业季闲置回收·自助提领端
                </h4>
              </div>

              {/* Password indicator area */}
              <div className="space-y-2 flex-1 flex flex-col justify-center">
                <div className="text-center">
                  <span className="text-[10px] text-slate-400 block mb-1">请输入 4 位提取验证码</span>
                  <div className="bg-slate-900 border border-slate-800 h-11 rounded-lg flex items-center justify-center gap-2 px-3 font-mono">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <span 
                        key={i} 
                        className={`w-6 text-center text-lg font-bold border-b-2 pb-0.5 ${
                          inputCode[i] ? 'border-emerald-500 text-emerald-300' : 'border-slate-800 text-slate-600'
                        }`}
                      >
                        {inputCode[i] || '•'}
                      </span>
                    ))}
                  </div>
                  
                  {errorMessage && (
                    <span className="text-[9px] text-rose-400 block mt-1 leading-normal font-sans">
                      ⚠️ {errorMessage}
                    </span>
                  )}
                </div>

                {/* Simulated Grid Keypad */}
                <div className="grid grid-cols-3 gap-1.5 px-4 mt-3">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                    <button
                      x-id={`keypad-${num}`}
                      key={num}
                      onClick={() => handleKeyPress(num)}
                      className="h-10 text-sm font-sans font-bold bg-slate-900/80 hover:bg-slate-800 active:bg-slate-700 rounded-lg text-slate-200 transition-all active:scale-95"
                    >
                      {num}
                    </button>
                  ))}
                  <button
                    id="keypad-clear"
                    onClick={handleClear}
                    className="h-10 text-[10px] bg-slate-900/40 hover:bg-slate-800 rounded-lg text-slate-400"
                  >
                    重输
                  </button>
                  <button
                    x-id="keypad-0"
                    key="0"
                    onClick={() => handleKeyPress('0')}
                    className="h-10 text-sm font-sans font-bold bg-slate-900/80 hover:bg-slate-800 active:bg-slate-700 rounded-lg text-slate-200 transition-all active:scale-95"
                  >
                    0
                  </button>
                  <button
                    id="keypad-delete"
                    onClick={handleDelete}
                    className="h-10 text-[10px] bg-slate-900/40 hover:bg-slate-800 rounded-lg text-slate-400 flex items-center justify-center"
                  >
                    删除
                  </button>
                </div>

                {/* Submitting button Remote Control */}
                <div className="px-4 mt-3">
                  <button
                    id="phone-remote-unlock-btn"
                    onClick={handleManualSubmit}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white text-xs font-bold py-2.5 rounded-lg flex items-center justify-center gap-1.5 shadow-md shadow-indigo-900/20 transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>手机遥控开柜自提</span>
                  </button>
                </div>
              </div>

              {/* Bottom footer bar instructions */}
              <div className="border-t border-slate-900 pt-1.5 mt-2 flex justify-between text-[8px] text-slate-500 font-sans">
                <span>西美雁塔校区Dorm单元 3F</span>
                <span>加密通信：AES</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sub panel 2: Examples list of Pickable Items with self-pickup codes for simulation */}
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-600 mb-1.5 block">
            📋 待自提物品密钥匙库 (演示直接点其“扫码自提”)
          </span>
          <div className="border border-slate-100 rounded-xl bg-white p-3 flex-1 overflow-y-auto max-h-[350px] space-y-2">
            
            {pickableItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <span className="text-2xl">🎉</span>
                <span className="text-xs font-bold text-slate-400 mt-1">目前暂无待自提物品</span>
                <p className="text-[10px] text-slate-400 mt-0.5">可在左下方“货源录入台”录入分配自提箱的物品进行解锁模拟。</p>
              </div>
            ) : (
              pickableItems.map((item) => {
                const associatedLocker = lockers.find(l => l.itemId === item.id);
                return (
                  <div 
                    key={item.id} 
                    className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 flex items-center justify-between gap-2 text-xs transition-all"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-slate-700 truncate">{item.name}</span>
                        <span className="bg-slate-200 text-slate-600 text-[8px] px-1 rounded-sm uppercase">
                          {associatedLocker?.label || '未定柜'}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-sans flex items-center gap-1.5">
                        <span>卖方: {item.sellerName}</span>
                        <span>•</span>
                        <span className="text-teal-600 font-bold font-mono">密口: {item.pickupCode}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        x-id={`type-code-${item.id}`}
                        onClick={() => setInputCode(item.pickupCode)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded text-[10px] font-medium"
                        title="将密匙填入输入框"
                      >
                        填码
                      </button>
                      <button
                        x-id={`scan-qr-code-${item.id}`}
                        onClick={() => triggerQrScanSimulation(item.pickupCode)}
                        className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/50 px-2 py-1 rounded text-[10px] font-medium flex items-center gap-1"
                      >
                        <QrCode className="w-3 h-3" />
                        <span>扫码自提</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}

          </div>

          <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100 text-[10px] text-slate-500 mt-3 flex items-start gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
            <span className="leading-relaxed">
              <strong>遥控机制:</strong> 学生到达宿舍门口，扫描柜体上的活动二维码即可拉起手机物联网页。输入对应物品密钥匙，后端即刻下发电控电磁锁脉冲，门轴微开，完成离线交付。不设值守人工，极大压减运营人头费。
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
