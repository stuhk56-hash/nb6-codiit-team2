"use client";

import { Order, OrderStatus, ShippingStatus } from "@/types/order";
import Image from "next/image";
import { useState } from "react";
import ShippingModal from "../order/ShippingModal";

interface MypageItemCardProps {
  orders: Order[];
}

export default function MypageItemCard({ orders }: MypageItemCardProps) {
  const [showShippingModal, setShowShippingModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");

  const handleShippingClick = (orderId: string) => {
    setSelectedOrderId(orderId);
    setShowShippingModal(true);
  };

  const handleCloseModal = () => {
    setShowShippingModal(false);
    setSelectedOrderId("");
  };

  const getShippingStatusLabel = (status?: ShippingStatus) => {
    switch (status) {
      case ShippingStatus.ReadyToShip:
        return "배송 준비중";
      case ShippingStatus.InShipping:
        return "배송 중";
      case ShippingStatus.Delivered:
        return "배송 완료";
      default:
        return "배송 정보 없음";
    }
  };

  const getOrderStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.CompletedPayment:
        return "배송 준비중";
      case OrderStatus.WaitingPayment:
        return "결제 대기";
      case OrderStatus.Canceled:
        return "취소됨";
      default:
        return "주문 대기";
    }
  };

  // items 또는 orderItems 호환성 처리
  const getOrderItems = (order: Order) => {
    return order.items ?? order.orderItems ?? [];
  };

  return (
    <div className="space-y-8">
      {orders && orders.length > 0 ? (
        orders.map((order) => {
          const orderItems = getOrderItems(order);

          if (!orderItems || orderItems.length === 0) {
            return (
              <div
                key={order.id}
                className="border-b pb-8"
              >
                <p className="text-gray-500">주문 상품이 없습니다.</p>
              </div>
            );
          }

          return (
            <div key={order.id}>
              {orderItems.map((item) => (
                <div
                  key={item.id}
                  className="border-b pb-8"
                >
                  {/* 주문 정보 헤더 */}
                  <div className="mb-6">
                    <p className="text-sm text-gray-500">
                      주문일: {order.createdAt ? new Date(order.createdAt).toLocaleDateString("ko-KR") : "정보 없음"}
                    </p>
                    <p className="mt-2 text-sm font-bold">
                      {order.shipping
                        ? getShippingStatusLabel(order.shipping.status as ShippingStatus)
                        : getOrderStatusLabel(order.status)}
                    </p>
                  </div>

                  {/* 상품 정보 + 가격/버튼 (가로 레이아웃) */}
                  <div className="mb-4 flex gap-6">
                    {/* 왼쪽: 상품 정보 */}
                    <div className="flex flex-1 gap-4">
                      <div className="relative h-24 w-24 flex-shrink-0">
                        {item.product?.image ? (
                          <Image
                            src={item.product.image}
                            alt={item.product.name || "상품"}
                            fill
                            className="rounded object-cover"
                          />
                        ) : item.productImageUrl ? (
                          <Image
                            src={item.productImageUrl}
                            alt={item.productName || "상품"}
                            fill
                            className="rounded object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center rounded bg-gray-200 text-xs text-gray-500">
                            이미지 없음
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="mb-2 text-base font-bold">
                          {item.product?.name || item.productName || "상품명 없음"}
                        </p>
                        <p className="text-sm text-gray-600">
                          {(item.price ?? item.unitPrice ?? 0).toLocaleString()}원 × {item.quantity}개
                        </p>
                      </div>
                    </div>

                    {/* 오른쪽: 가격 + 버튼들 */}
                    <div className="flex min-w-[140px] flex-col items-end gap-3">
                      {/* 가격 */}
                      <p className="text-lg font-bold">
                        {((item.price ?? item.unitPrice ?? 0) * item.quantity).toLocaleString()}원
                      </p>

                      {/* 버튼들 (세로) */}
                      <div className="w-full space-y-2">
                        {/* ✅ 배송 정보 있으면 배송 조회 버튼 */}
                        {order.shipping && (
                          <button
                            onClick={() => handleShippingClick(order.id)}
                            className="w-full rounded border-2 border-black px-3 py-2 text-sm font-bold transition-all hover:bg-black hover:text-white"
                          >
                            🚚 배송 조회
                          </button>
                        )}

                        {/* ✅ 항상 리뷰 쓰기 버튼 표시 */}
                        <button className="w-full rounded bg-black px-3 py-2 text-sm font-bold text-white transition-all hover:bg-gray-800">
                          리뷰 쓰기
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          );
        })
      ) : (
        <div className="py-8 text-center text-gray-500">주문 내역이 없습니다.</div>
      )}

      {/* ✅ 배송 조회 모달 - 받는사람, 주소 추가 */}
      {showShippingModal && (
        <ShippingModal
          isOpen={showShippingModal}
          orderId={selectedOrderId}
          buyerName={orders.find((o) => o.id === selectedOrderId)?.buyerName || "받는사람"}
          address={orders.find((o) => o.id === selectedOrderId)?.address || "주소 정보 없음"}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
