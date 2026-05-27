/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Box, Sparkles, PlusCircle, Check, Trash2, Mail, 
  Truck, Search, Filter, ShieldAlert, BadgeDollarSign
} from 'lucide-react';
import { Item, LockerUnit } from '../types';

interface InventoryManagerProps {
  items: Item[];
  lockers: LockerUnit[];
  onAddItem: (item: Omit<Item, 'id' | 'pickupCode' | 'assignedLocation' | 'reclaimedTime'>) => void;
  onDeleteItem: (itemId: string) => void;
  onMailingBatch: () => void;
}

export default function InventoryManager({
  items,
  lockers,
  onAddItem,
  onDeleteItem,
  onMailingBatch,
}: InventoryManagerProps) {
  // Add item form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState('画具/数位板');
  const [size, setSize] = useState<'small' | 'medium' | 'large'>('small');
  const [storageType, setStorageType] = useState<'self_pickup' | 'unsold_warehouse'>('self_pickup');
  const [price, setPrice] = useState('35');
  const [sellerName, setSellerName] = useState('王同学');
  const [sellerDorm, setSellerDorm] = useState('雁塔中4号楼-501');

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [storageFilter, setStorageFilter] = useState<string>('all');

  // Generate presets to make user's typing experience easier
  const applyProductPreset = (presetName: string, sizeClass: 'small' | 'medium' | 'large', cat: string, priceStr: string, store: 'self_pickup' | 'unsold_warehouse') => {
    setName(presetName);
    setSize(sizeClass);
    setCategory(cat);
    setPrice(priceStr);
    setStorageType(store);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddItem({
      name,
      category,
      size,
      storageType,
      price: parseFloat(price) || 0,
      status: 'available',
      sellerName: sellerName || '匿名毕业生',
      sellerDorm: sellerDorm || '西美雁塔校区',
    });

    // Reset standard input, randomizing name so user doesn't struggle with duplicate entries
    setName('');
  };

  // Filter items
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.sellerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesStorage = storageFilter === 'all' || item.storageType === storageFilter;
    return matchesSearch && matchesStatus && matchesStorage;
  });

  const unsoldToMailCount = items.filter(
    i => i.storageType === 'unsold_warehouse' && i.status === 'available'
  ).length;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full" id="inventory-manager-panel">
      {/* Header Tabs */}
      <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-indigo-700 font-bold mb-1">
            <Box className="w-4 h-4" />
            <span>货源流转处理台 (毕业生物品登机录入)</span>
          </div>
          <h3 className="text-base font-bold text-slate-800">
            闲置收条录入与流转大厅
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            设置物品尺寸分类。系统根据草图规范自动推荐物理隔位摆放，并激活提货密口。
          </p>
        </div>

        {/* Action Button: Batch Courier Dispatch */}
        {unsoldToMailCount > 0 && (
          <button
            id="batch-mailing-btn"
            onClick={onMailingBatch}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs px-3.5 py-2 rounded-xl font-bold shadow-sm cursor-pointer transition-all self-start sm:self-center"
          >
            <Truck className="w-4 h-4 animate-bounce" />
            <span>一键顺丰集中收件发件 ({unsoldToMailCount}件)</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 flex-1">
        {/* Left Side Column: Intake Form (xl:col-span-4) */}
        <div className="xl:col-span-4 p-5 border-b xl:border-b-0 xl:border-r border-slate-100 space-y-5 bg-slate-50/20">
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">毕业生回收物品录入</h4>
            <p className="text-[11px] text-slate-400">快速勾选收录，智能划分存储类型</p>
          </div>

          {/* Quick presets selectors */}
          <div className="space-y-1.5">
            <span className="text-[10px] text-slate-400 font-bold block">💡 快速物品样本一键填充:</span>
            <div className="flex flex-wrap gap-1.5">
              <button
                id="preset-painting"
                type="button"
                onClick={() => applyProductPreset('美术专业写生画架', 'large', '画具/数位板', '80', 'unsold_warehouse')}
                className="bg-white hover:bg-slate-50 text-[10px] text-slate-600 px-2 py-1 rounded-md border border-slate-200"
              >
                + 大画架
              </button>
              <button
                id="preset-keyboard"
                type="button"
                onClick={() => applyProductPreset('iPad妙控蓝牙键盘', 'small', '日常数码', '150', 'self_pickup')}
                className="bg-white hover:bg-slate-50 text-[10px] text-slate-600 px-2 py-1 rounded-md border border-slate-200"
              >
                + 蓝牙键盘
              </button>
              <button
                id="preset-kettle"
                type="button"
                onClick={() => applyProductPreset('寝室不锈钢保温水壶', 'medium', '寝室生活', '12', 'self_pickup')}
                className="bg-white hover:bg-slate-50 text-[10px] text-slate-600 px-2 py-1 rounded-md border border-slate-200"
              >
                + 热水壶
              </button>
              <button
                id="preset-book"
                type="button"
                onClick={() => applyProductPreset('考研美术史精编讲义', 'small', '课研书籍', '20', 'unsold_warehouse')}
                className="bg-white hover:bg-slate-50 text-[10px] text-slate-600 px-2 py-1 rounded-md border border-slate-200"
              >
                + 考研书籍
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
            {/* Name input */}
            <div className="space-y-1">
              <label className="font-bold text-slate-600 block">物品名称 <span className="text-red-500">*</span></label>
              <input
                id="input-item-name"
                type="text"
                placeholder="名称 (如：西美写生手提纸袋 / 考前素描头像集)"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>

            {/* Price & Category */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-600 block">指导转手价 (CNY)</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-slate-400">¥</span>
                  <input
                    id="input-item-price"
                    type="number"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg pl-6 pr-3 py-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none font-mono"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-600 block">分类大类</label>
                <select
                  id="input-item-cat"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="画具/数位板">画具/作品</option>
                  <option value="日常数码">日常数码</option>
                  <option value="课研书籍">课研书籍</option>
                  <option value="寝室生活">寝室生活</option>
                  <option value="其他大件">其他大件</option>
                </select>
              </div>
            </div>

            {/* Size Specification */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-600 block">物理尺寸大小</label>
              <div className="grid grid-cols-3 gap-2">
                {['small', 'medium', 'large'].map((sz) => (
                  <button
                    x-id={`size-btn-${sz}`}
                    key={sz}
                    type="button"
                    onClick={() => setSize(sz as any)}
                    className={`border p-2 rounded-lg text-center font-medium transition-all ${
                      size === sz 
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 font-bold shadow-xs' 
                        : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {sz === 'small' ? '小型 (数码/书)' : sz === 'medium' ? '中型 (水壶/挂架)' : '大型 (画架板格)'}
                  </button>
                ))}
              </div>
              <span className="text-[10px] text-slate-400">
                ⚠️ **物理定位约束**: 
                {size === 'large' && " 大型物品禁止自提柜入储，限右侧强货架底盘堆放。"}
                {size === 'medium' && " 中型物品将分配至挂橱或大容量格子，规避超限占用。"}
                {size === 'small' && " 小型物品推荐放至智能自提电控箱。"}
              </span>
            </div>

            {/* Storage flow pathway */}
            <div className="space-y-1.5 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <label className="font-bold text-slate-700 block mb-1">流转仓储交付方案</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    id="flow-self"
                    type="radio"
                    name="storageType"
                    checked={storageType === 'self_pickup'}
                    onChange={() => setStorageType('self_pickup')}
                    disabled={size === 'large'}
                    className="accent-indigo-600"
                  />
                  <span>
                    <strong>智能自提服务 (Self)</strong>
                    <span className="text-[10px] text-slate-400 block ml-5">分配左侧格子并生成手机4位遥控提取密口。</span>
                  </span>
                </label>
                
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    id="flow-warehouse"
                    type="radio"
                    name="storageType"
                    checked={storageType === 'unsold_warehouse'}
                    onChange={() => setStorageType('unsold_warehouse')}
                    className="accent-indigo-600"
                  />
                  <span>
                    <strong>置入大仓线上出售发货 (Warehouse)</strong>
                    <span className="text-[10px] text-slate-400 block ml-5">存入右侧大架，由后台进行统一线上交易或集中打顺丰寄出。</span>
                  </span>
                </label>
              </div>
            </div>

            {/* Graduate details */}
            <div className="grid grid-cols-2 gap-3 pb-2">
              <div className="space-y-1">
                <label className="font-bold text-slate-500 block">毕业生宿位</label>
                <input
                  id="input-seller-dorm"
                  type="text"
                  placeholder="如雁塔中2-302"
                  value={sellerDorm}
                  onChange={e => setSellerDorm(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-600 focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-500 block">卖家姓名/昵称</label>
                <input
                  id="input-seller-name"
                  type="text"
                  placeholder="如李同学"
                  value={sellerName}
                  onChange={e => setSellerName(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Action submit */}
            <button
              id="submit-intake-btn"
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl shadow-md cursor-pointer transition-all active:scale-[0.98] leading-none"
            >
              登记入库 & 分隔货位
            </button>
          </form>
        </div>

        {/* Right Side Column: Active Items Table (xl:col-span-8) */}
        <div className="xl:col-span-8 p-5 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Search and Filters bar */}
            <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
              {/* Search */}
              <div className="relative w-full md:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-2.5" />
                <input
                  id="search-items"
                  type="text"
                  placeholder="搜索物品名/卖家名字..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 bg-slate-50/50 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* Filters grid */}
              <div className="flex items-center gap-2 w-full md:w-auto self-start sm:self-center">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  id="filter-storage-type"
                  value={storageFilter}
                  onChange={e => setStorageFilter(e.target.value)}
                  className="border border-slate-200 rounded-lg py-1 px-1.5 bg-white text-xs text-slate-600 focus:outline-none"
                >
                  <option value="all">所有存储类型</option>
                  <option value="self_pickup">自提柜储存 (Self)</option>
                  <option value="unsold_warehouse">仓储存储 (Warehouse)</option>
                </select>

                <select
                  id="filter-status"
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="border border-slate-200 rounded-lg py-1 px-1.5 bg-white text-xs text-slate-600 focus:outline-none"
                >
                  <option value="all">所有流转进度</option>
                  <option value="available">入库待取/待发</option>
                  <option value="picked_up">已提取结束</option>
                  <option value="mailed">已线上邮寄发出</option>
                </select>
              </div>
            </div>

            {/* Main Table for Goods */}
            <div className="border border-slate-100 rounded-xl overflow-hidden bg-white max-h-[360px] overflow-y-auto">
              {filteredItems.length === 0 ? (
                <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center">
                  <Box className="w-10 h-10 text-slate-200 mb-2" />
                  <span className="text-xs font-bold text-slate-500">未检索到匹配的流转物品</span>
                  <p className="text-[10px] text-slate-400 mt-1">请重置筛选条件，或在左侧重新登记一件毕业生物品。</p>
                </div>
              ) : (
                <table className="w-full text-[11px] text-left border-collapse font-sans">
                  <thead className="bg-[#FAFBFD] border-b border-indigo-50/60 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">物品描述 & 入档位置</th>
                      <th className="py-3 px-3">尺寸 & 售价</th>
                      <th className="py-3 px-3">卖家毕业生</th>
                      <th className="py-3 px-3">流转方案</th>
                      <th className="py-3 px-3">状态/物流追踪</th>
                      <th className="py-3 px-3 text-center">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600">
                    {filteredItems.map(item => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-800 text-xs">{item.name}</div>
                          <div className="text-[9px] text-slate-400 mt-0.5 flex items-center gap-1.5 font-mono">
                            <span className="bg-slate-100 px-1 rounded-xs text-slate-500">ID: {item.id.slice(0, 7)}</span>
                            <span>📍 固排位: <strong className="text-slate-700">{item.assignedLocation}</strong></span>
                          </div>
                        </td>
                        <td className="py-3 px-3 font-mono">
                          <span className={`px-1 rounded-sm text-[8px] mr-1.5 font-bold uppercase ${
                            item.size === 'large' ? 'bg-rose-50 text-rose-600' : item.size === 'medium' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                          }`}>
                            {item.size === 'large' ? '大' : item.size === 'medium' ? '中' : '小'}
                          </span>
                          <span className="font-bold text-slate-800">¥{item.price}</span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-medium text-slate-700">{item.sellerName}</div>
                          <div className="text-[9px] text-slate-400">{item.sellerDorm}</div>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            item.storageType === 'self_pickup' 
                              ? 'bg-teal-50 text-teal-700 border border-teal-100/40' 
                              : 'bg-indigo-50 text-indigo-700 border border-indigo-100/40'
                          }`}>
                            {item.storageType === 'self_pickup' ? '智能开柜自提' : '后台仓储寄至'}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          {item.status === 'available' && (
                            <span className="inline-flex items-center gap-1 text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full font-bold text-[9px]">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 block animate-pulse" />
                              待自提 / 待售
                            </span>
                          )}
                          {item.status === 'picked_up' && (
                            <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full font-bold text-[9px]">
                              ✓ 手机开柜自提完结
                            </span>
                          )}
                          {item.status === 'mailed' && (
                            <div className="space-y-0.5">
                              <span className="inline-flex items-center gap-1 text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-full font-bold text-[9px]">
                                ✈️ 顺丰特快寄出
                              </span>
                              <div className="text-[8px] text-slate-400 font-mono italic">单号: {item.trackingNumber}</div>
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            id={`del-item-${item.id}`}
                            onClick={() => onDeleteItem(item.id)}
                            className="p-1 hover:text-red-500 hover:bg-red-50 text-slate-400 rounded-md transition-all cursor-pointer"
                            title="报损作废"
                          >
                            <Trash2 className="w-3.5 h-3.5 whitespace-nowrap" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap justify-between items-center text-[10px] text-slate-400 gap-2 font-mono">
            <span>总计流转款：¥{items.reduce((acc, i) => acc + i.price, 0)} 元</span>
            <div className="flex gap-4">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-teal-500 block" />
                已扫码自提: {items.filter(i => i.status === 'picked_up').length}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-indigo-500 block" />
                顺丰集件发出: {items.filter(i => i.status === 'mailed').length}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-amber-500 rounded-full block" />
                在库待领: {items.filter(i => i.status === 'available').length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
