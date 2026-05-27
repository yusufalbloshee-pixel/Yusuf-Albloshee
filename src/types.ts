/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Item {
  id: string;
  name: string;
  category: string;
  size: 'small' | 'medium' | 'large'; // Determines placement on shelves or lockers
  price: number;
  storageType: 'self_pickup' | 'unsold_warehouse';
  status: 'available' | 'locked' | 'picked_up' | 'mailing' | 'mailed';
  pickupCode: string; // 4-digit mobile remote pickup code
  assignedLocation: string; // e.g., "A-04 柜" or "B行 4层 中"
  reclaimedTime: string;
  trackingNumber?: string;
  sellerName: string;
  sellerDorm: string;
}

export interface LockerUnit {
  id: string;
  label: string;
  occupied: boolean;
  itemId?: string;
  status: 'empty' | 'available' | 'opening' | 'success';
}

export interface RackCell {
  id: string; // e.g. "shelf-left-tier-0"
  tier: number; // 0, 1, 2, 3 (bottom to top, 4-layers)
  sizeClass: 'small' | 'medium' | 'large';
  occupiedCount: number;
  maxCapacity: number;
  row: 'left' | 'right';
  itemNames: string[];
}

export interface WarehouseConfig {
  passageWidth: number; // in meters (e.g., 1.5 - 2.8)
  middleChasmWidth: number; // the central cleared/hollowed-out space size (m)
  leftLockerColumns: number; // number of locker units (columns)
  rightRackRows: number; // number of rack structures
  rackHeight: number; // >= 1.8m default is 1.8m or 2m
  selectedScheme: 'scheme-1' | 'scheme-2' | 'custom_optimized';
}

export interface CostReductionMetrics {
  rentCostTarget: number; // using idle dorm instead of commercial space
  laborCostTarget: number; // self-pickup IoT eliminates on-site student-labor
  logisticsCostTarget: number; // combined bulk dispatch shipping
  damageLossTarget: number; // locked lockers keep goods safe
  savedTotal: number;
  efficiencyIndex: number; // space utilization efficiency
}
