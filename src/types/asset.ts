export type AssetStatus = 'active' | 'transferred' | 'discarded' | 'stolen' | 'auctioned';

export interface Asset {
  id: string;
  assetNumber: string;
  sapNumber: string;
  model: string;
  brand: string;
  serial: string;
  specification: string;
  itemName: string;
  officeNumber: string;
  yearNumber: string;
  categoryNumber: string;
  itemNumber: string;
  sequenceNumber: string;
  location: string;
  sublocation: string;
  price: number;
  accruedDate: string;
  purchaseCode: string;
  voucherNumber: string;
  auctionedDate: string | null;
  tagAttached: boolean;
  quantity: number;
  comments: string;
  assignedTo: string;
  createdAt: string;
  imageUrl: string | null;
  status: AssetStatus;
}

export interface Category {
  id: string;
  code: string;
  name: string;
  subcategories: Subcategory[];
}

export interface Subcategory {
  code: string;
  name: string;
}

export interface Location {
  id: string;
  name: string;
  sublocations: string[];
}

export interface Brand {
  id: string;
  name: string;
}

export interface Model {
  id: string;
  name: string;
  brandId: string;
}
