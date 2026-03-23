export type DashboardPeriodKey = 'today' | 'week' | 'month' | 'year';

export type DashboardSalesRecord = {
  createdAt: Date;
  quantity: number;
  unitPrice: number;
  product: {
    id: string;
    name: string;
    price: number;
  };
};

export type DashboardDateRange = {
  currentStart: Date;
  currentEnd: Date;
  previousStart: Date;
  previousEnd: Date;
};

export type PriceRangeBucket = {
  label: string;
  min: number;
  max: number;
};

export type TopSalesSummary = {
  totalOrders: number;
  totalSales: number;
  product: {
    id: string;
    name: string;
    price: number;
  };
};

export type PriceRangeSummary = {
  priceRange: string;
  totalSales: number;
  percentage: number;
};
