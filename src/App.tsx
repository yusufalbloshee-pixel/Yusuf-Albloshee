/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Box, Sparkles, HardHat, TrendingDown, Bell, Zap, 
  MapPin, HelpCircle, RefreshCw, Layers, CheckCircle, Truck, Info
} from 'lucide-react';

import { Item, LockerUnit, WarehouseConfig } from './types';
import SpatialPlanner from './components/SpatialPlanner';
import CostAnalytics from './components/CostAnalytics';
import PhoneSimulator from './components/PhoneSimulator';
import InventoryManager from './components/InventoryManager';

// Pre-populate core beautiful items to make the simulation immediately interactive
const INITIAL_ITEMS: Item[] = [
  {
    id: 'item-1',
    name: '西美油画系定制实木伸缩大画架',
    category: '画具/数位板',
    size: 'large',
    price: 90,
    storageType: 'unsold_warehouse',
    status: 'available',
    pickupCode: '1102',
    assignedLocation: '货架 A 底层 [大型]',
    reclaimedTime: '2026-05-27',
    sellerName: '王同学',
    sellerDorm: '雁塔校区南楼 304',
  },
  {
    id: 'item-2',
    name: 'iPad Pro M1 专用手写电容压感笔',
    category: '日常数码',
    size: 'small',
    price: 180,
    storageType: 'self_pickup',
    status: 'available',
    pickupCode: '8849',
    assignedLocation: 'A-01 柜',
    reclaimedTime: '2026-05-27',
    sellerName: '李同学',
    sellerDorm: '雁塔校区中3 B-302',
  },
  {
    id: 'item-3',
    name: 'Wacom 影拓 Medium 数位板 (9.5成新)',
    category: '日常数码',
    size: 'medium',
    price: 360,
    storageType: 'self_pickup',
    status: 'available',
    pickupCode: '2048',
    assignedLocation: '挂橱下叠放段 [中型]',
    reclaimedTime: '2026-05-27',
    sellerName: '赵同学',
    sellerDorm: '雁塔校区东阁 502',
  },
  {
    id: 'item-4',
    name: '康颂(Canson) 300g重绘精装水彩长轴画纸',
    category: '画具/数位板',
    size: 'medium',
    price: 45,
    storageType: 'self_pickup',
    status: 'available',
    pickupCode: '3362',
    assignedLocation: 'A-04 柜',
    reclaimedTime: '2026-05-27',
    sellerName: '钱同学',
    sellerDorm: '雁塔校区中3 B-302',
  },
  {
    id: 'item-5',
    name: '考研全国名校美术史论高分笔记图集',
    category: '课研书籍',
    size: 'small',
    price: 25,
    storageType: 'unsold_warehouse',
    status: 'available',
    pickupCode: '7729',
    assignedLocation: '货架 B 中层 [小型]',
    reclaimedTime: '2026-05-27',
    sellerName: '孙同学',
    sellerDorm: '雁塔校区中4 C-101',
  },
  {
    id: 'item-6',
    name: '寝室伸缩折叠双层大容量晾衣铁架',
    category: '寝室生活',
    size: 'large',
    price: 15,
    storageType: 'unsold_warehouse',
    status: 'available',
    pickupCode: '9045',
    assignedLocation: '货架 C 底层 [大型]',
    reclaimedTime: '2026-05-27',
    sellerName: '吴同学',
    sellerDorm: '雁塔校区中2 208',
  }
];

// 12 empty lockers definition
const INITIAL_LOCKERS: LockerUnit[] = [
  { id: 'locker-1', label: 'A-01', occupied: false, status: 'empty' },
  { id: 'locker-2', label: 'A-02', occupied: false, status: 'empty' },
  { id: 'locker-3', label: 'A-03', occupied: false, status: 'empty' },
  { id: 'locker-4', label: 'A-04', occupied: false, status: 'empty' },
  { id: 'locker-5', label: 'A-05', occupied: false, status: 'empty' },
  { id: 'locker-6', label: 'A-06', occupied: false, status: 'empty' },
  { id: 'locker-7', label: 'B-01', occupied: false, status: 'empty' },
  { id: 'locker-8', label: 'B-02', occupied: false, status: 'empty' },
  { id: 'locker-9', label: 'B-03', occupied: false, status: 'empty' },
  { id: 'locker-10', label: 'B-04', occupied: false, status: 'empty' },
  { id: 'locker-11', label: 'B-05', occupied: false, status: 'empty' },
  { id: 'locker-12', label: 'B-06', occupied: false, status: 'empty' },
];

export default function App() {
  // Config
  const [config, setConfig] = useState<WarehouseConfig>({
    passageWidth: 1.8,
    middleChasmWidth: 2.2,
    leftLockerColumns: 6,
    rightRackRows: 2,
    rackHeight: 1.8,
    selectedScheme: 'custom_optimized'
  });

  // Items State (supports local storage for consistency)
  const [items, setItems] = useState<Item[]>(() => {
    const saved = localStorage.getItem('ximei_recycled_items');
    return saved ? JSON.parse(saved) : INITIAL_ITEMS;
  });

  // Lockers State
  const [lockers, setLockers] = useState<LockerUnit[]>(INITIAL_LOCKERS);

  // Active IoT Remote opening locker and item details
  const [activeOpeningLocker, setActiveOpeningLocker] = useState<LockerUnit | null>(null);
  const [activeOpeningItem, setActiveOpeningItem] = useState<Item | null>(null);

  // Selected element for details drawer in main blueprint
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  // Success Notification banner states
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLogisticsAnimating, setIsLogisticsAnimating] = useState(false);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem('ximei_recycled_items', JSON.stringify(items));
  }, [items]);

  // Synchronize lockers occupancy based on items allocation
  useEffect(() => {
    const updatedLockers = INITIAL_LOCKERS.map(lock => {
      // Find item assigned to this locker
      const assignedItem = items.find(
        i => i.storageType === 'self_pickup' && i.status === 'available' && i.assignedLocation === `${lock.label} 柜`
      );
      
      if (assignedItem) {
        return {
          ...lock,
          occupied: true,
          itemId: assignedItem.id,
          status: 'available' as const
        };
      }
      return {
        ...lock,
        occupied: false,
        itemId: undefined,
        status: 'empty' as const
      };
    });

    setLockers(updatedLockers);
  }, [items]);

  // Trigger custom toast alert
  const displayToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Add recycled item helper
  const handleAddItem = (newItemData: Omit<Item, 'id' | 'pickupCode' | 'assignedLocation' | 'reclaimedTime'>) => {
    // Determine assigned location depending on size & storage type
    let assignedLocation = '';
    const itemId = `item-${Date.now()}`;
    const randCode = Math.floor(1000 + Math.random() * 9000).toString(); // generate 4 digit pick code
    
    if (newItemData.storageType === 'self_pickup') {
      // Find first empty locker
      const firstFreeLocker = lockers.find(l => !l.occupied);
      if (firstFreeLocker) {
        assignedLocation = `${firstFreeLocker.label} 柜`;
      } else {
        // Fallback to cupboard hanging area on leftmost side
        assignedLocation = `挂橱下叠放段 [中型]`;
      }
    } else {
      // Warehouse Racks
      if (newItemData.size === 'large') {
        const racks = ['A', 'B', 'C'];
        const randomRack = racks[Math.floor(Math.random() * racks.length)];
        assignedLocation = `货架 ${randomRack} 底层 [大型]`;
      } else if (newItemData.size === 'medium') {
        assignedLocation = `货架 A 顶层 [中型]`;
      } else {
        assignedLocation = `货架 B 中层 [小型]`;
      }
    }

    const createdItem: Item = {
      ...newItemData,
      id: itemId,
      pickupCode: randCode,
      assignedLocation,
      reclaimedTime: new Date().toISOString().split('T')[0],
    };

    setItems(prev => [createdItem, ...prev]);
    displayToast(`🛍️ 登记成功！物品【${newItemData.name}】已成功入库安置到: ${assignedLocation}`);
  };

  // Delete/Wreak waste item
  const handleDeleteItem = (itemId: string) => {
    const matched = items.find(i => i.id === itemId);
    setItems(prev => prev.filter(i => i.id !== itemId));
    if (matched) {
      displayToast(`🗑️ 物品【${matched.name}】已从流转库里报废清出`);
    }
  };

  // Remote cellular internet phone remote control unlock trigger
  const handleTriggerUnlock = (pickupCode: string) => {
    const matchedItem = items.find(i => i.pickupCode === pickupCode);
    if (!matchedItem) return;

    // Find associated locker
    const targetLocker = lockers.find(l => l.itemId === matchedItem.id);
    
    if (targetLocker) {
      // Set opening flow states
      const refreshedLockers = lockers.map(l => 
        l.id === targetLocker.id ? { ...l, status: 'opening' as const } : l
      );
      setLockers(refreshedLockers);
      
      setActiveOpeningLocker({ ...targetLocker, status: 'opening' });
      setActiveOpeningItem(matchedItem);
      setSelectedElementId(targetLocker.id);

      displayToast(`⚡ IoT下发开电控锁指令中... 柜体【${targetLocker.label}】已自动弹开！`);
    } else {
      // If it's stored in the cupboard (for medium items)
      displayToast(`🔑 密码匹配成功！【${matchedItem.name}】存入的是左衣橱。已手机无线授权自取。`);
      // Simulating manual extraction directly
      setTimeout(() => {
        setItems(prev => prev.map(i => i.id === matchedItem.id ? { ...i, status: 'picked_up' } : i));
      }, 1000);
    }
  };

  // When student confirms they took the item on screen
  const handleResetLockerState = () => {
    if (activeOpeningItem && activeOpeningLocker) {
      // Update item status to picked up
      setItems(prev => prev.map(i => i.id === activeOpeningItem.id ? { ...i, status: 'picked_up' as const } : i));
      
      // Reset active simulators
      setActiveOpeningLocker(null);
      setActiveOpeningItem(null);
      setSelectedElementId(null);
      displayToast(`✨ 提货交易圆满结束！由于采用全自助提领，本次节损在场人工看守劳务 1 件次。`);
    }
  };

  // Batch Courier Shipping for unsold catalog items
  const handleMailingBatch = () => {
    setIsLogisticsAnimating(true);
    displayToast(`🚛 顺丰速运快递小哥接单完成！正在为大仓内所有积压未售件进行合并批量打单打包...`);
    
    setTimeout(() => {
      // update all storageType unsold && status available items to mailed
      setItems(prev => prev.map(i => {
        if (i.storageType === 'unsold_warehouse' && i.status === 'available') {
          const randSF = `SF-${Math.floor(100000000000 + Math.random() * 900000000000)}`;
          return {
            ...i,
            status: 'mailed' as const,
            trackingNumber: randSF
          };
        }
        return i;
      }));
      setIsLogisticsAnimating(false);
      displayToast(`📦 批量贴单发出完毕！合并发件享受高校毕业季特惠价格 (¥7.50/件，节损约45%物流运费)。`);
    }, 3800);
  };

  const handleSelectLocker = (lockerId: string) => {
    const l = lockers.find(lock => lock.id === lockerId);
    if (l) {
      setSelectedElementId(lockerId);
      if (l.occupied && l.itemId) {
        const item = items.find(i => i.id === l.itemId);
        if (item) {
          displayToast(`📍 关联物品: ${item.name} | 🔑 自提提取码: ${item.pickupCode}`);
        }
      } else {
        displayToast(`📍 空置储物格: ${l.label} (可用于存管新回收的日常数码手套及中小型书包)`);
      }
    }
  };

  const handleSelectRackCell = (cellId: string) => {
    setSelectedElementId(cellId);
    if (cellId === 'cupboard') {
      displayToast(`📐 左侧利旧衣帽架: 用于置挂无法压折破损的美术毕业大作。`);
    } else {
      displayToast(`📐 右侧高强度货架: 可负重层叠，最底层摆放毕业写生箱与大型重物。`);
    }
  };

  const resetAllDatabaseMock = () => {
    if (window.confirm("确定要恢复默认西美商品库数据吗？这会抹除您新添加和自提模拟的动作。")) {
      setItems(INITIAL_ITEMS);
      localStorage.removeItem('ximei_recycled_items');
      setActiveOpeningItem(null);
      setActiveOpeningLocker(null);
      setSelectedElementId(null);
      displayToast("🔄 数据库已重置回初始美院闲置物项！");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col pb-12" id="ximei-app-root">
      
      {/* Toast Notification slide-in block */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-55 w-full max-w-lg px-4"
          >
            <div className="bg-slate-900/95 backdrop-blur-md border border-slate-800 text-white rounded-xl shadow-xl p-4 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="bg-emerald-500/20 text-emerald-400 p-1.5 rounded-lg">
                  <Bell className="w-4 h-4" />
                </div>
                <span className="leading-relaxed whitespace-pre-line">{toastMessage}</span>
              </div>
              <button 
                id="close-toast"
                onClick={() => setToastMessage(null)} 
                className="text-slate-400 hover:text-white px-1 py-1"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logistics Dispatch Loader Overlay */}
      <AnimatePresence>
        {isLogisticsAnimating && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-55 flex flex-col items-center justify-center text-center p-6"
          >
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 10, ease: 'linear' }}
              className="w-24 h-24 border-t-2 border-r-2 border-indigo-500 rounded-full flex items-center justify-center opacity-40 mb-6"
            />
            <div className="absolute flex flex-col items-center">
              <Truck className="w-14 h-14 text-indigo-400 animate-bounce" />
              <h3 className="text-white font-bold mt-4 text-base">顺丰特快批量揽货中...</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm leading-relaxed">
                西美右库货架 unsold items 系统正在与快递API握手，一键拼单批量打印面贴。本次集中发件大幅平摊首公斤寄件起步开销！
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Academic Header Banner */}
      <div className="w-full bg-[#1A1F2C] border-b border-slate-800 drop-shadow-sm text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-bold tracking-widest px-2.5 py-1 rounded-md uppercase font-mono">
                XI&apos;AN ACADEMY OF FINE ARTS
              </span>
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
              <span className="text-xs text-slate-400 font-mono">西美雁塔校区 · 毕业季特别企划</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span>🎓</span>
              <span>宿仓互换：毕业季闲置物品回收流转智系统</span>
            </h1>
            <p className="text-xs text-slate-400">
              重组闲置寝房空间，打造“中空排队、左箱自助、右库发邮”的高效零租金、极低人力毕业生绿色流转微仓。
            </p>
          </div>

          <div className="flex gap-2.5">
            <button
              id="reset-db-btn"
              onClick={resetAllDatabaseMock}
              title="重置数据库"
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white border border-slate-700/60 text-xs px-3.5 py-2 rounded-xl font-medium transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>重置演示库数据</span>
            </button>
            <a
              id="external-link-preview"
              href="https://ai.studio/build"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3.5 py-2 rounded-xl font-bold shadow-sm transition-all"
            >
              <span>绿色回收理念书</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Structural Layout (Bento Grid Workspace) */}
      <main className="max-w-7xl mx-auto w-full px-4 md:px-8 mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        
        {/* TOP SPATIAL PLANNING WORKSPACE (12 cols) */}
        <section className="lg:col-span-12 h-full flex flex-col" id="section-spatial-blueprint">
          <SpatialPlanner 
            config={config}
            onChangeConfig={setConfig}
            items={items}
            lockers={lockers}
            onSelectLocker={handleSelectLocker}
            onSelectRackCell={handleSelectRackCell}
            selectedElementId={selectedElementId}
          />
        </section>

        {/* BOTTOM DOUBLE-COLUMN LAYOUT: Left analytics & mobile lock simulator, Right catalog recorder */}
        {/* COLUMN A: Dynamic cost reduction calculations & mobile controller (6 cols) */}
        <section className="col-span-1 lg:col-span-6 space-y-6 flex flex-col" id="col-financial-simulator">
          {/* Real-time costs minimizing ledger charts */}
          <CostAnalytics 
            config={config}
            totalItemsCount={items.length}
          />

          {/* Student remote internet phone code unlocks panel */}
          <PhoneSimulator 
            lockers={lockers}
            items={items}
            onTriggerUnlock={handleTriggerUnlock}
            activeOpeningLocker={activeOpeningLocker}
            activeOpeningItem={activeOpeningItem}
            onResetLockerState={handleResetLockerState}
          />
        </section>

        {/* COLUMN B: Inventory manager & labeling dispatcher (6 cols) */}
        <section className="col-span-1 lg:col-span-6 h-full" id="col-inventory-desk">
          <InventoryManager 
            items={items}
            lockers={lockers}
            onAddItem={handleAddItem}
            onDeleteItem={handleDeleteItem}
            onMailingBatch={handleMailingBatch}
          />
        </section>

      </main>

      {/* Bottom Legal footer */}
      <footer className="max-w-7xl mx-auto w-full px-4 md:px-8 mt-12 border-t border-slate-200/80 pt-6 text-center text-xs text-slate-400 font-mono tracking-wide">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 font-sans">
          <span>西安美术学院雁塔校区宿务安全办公室 · 毕业季联合发起</span>
          <span>系统核心：中空双室交互 · 低成本低货损率设计 · 版权所有 © 2026 XIMA</span>
        </div>
      </footer>
    </div>
  );
}
