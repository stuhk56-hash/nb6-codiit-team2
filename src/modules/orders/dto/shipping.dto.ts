export interface ShippingDto {
  id: string;
  status: string;
  trackingNumber: string;
  carrier: string;
  readyToShipAt: string | null;
  inShippingAt: string | null;
  deliveredAt: string | null;
  createdAt: string;
  updatedAt: string;
}
