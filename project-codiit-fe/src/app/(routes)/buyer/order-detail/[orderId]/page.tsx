"use client";

import Button from "@/components/button/Button";
import OrderCancelModal from "@/components/order/OrderCancelModal";
import OrderEditModal from "@/components/order/OrderEditModal";
import { getAxiosInstance } from "@/lib/api/axiosInstance";
import { canCancelOrder, getCancelRestrictReason } from "@/lib/api/orders.util";
import { Order, OrderItem, ShippingStatus } from "@/types/order";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type OrderResponseShape = Order & {
  payments?: Order["payment"];
};

type PaymentLike = NonNullable<Order["payment"]> & {
  paymentMethod?: string;
  cardNumber?: string;
  bankName?: string;
  phoneNumber?: string;
  status?: string;
};

type ItemSizeShape = OrderItem["size"] & {
  nameKo?: string;
  name?: string;
  size?: {
    ko?: string;
    en?: string;
  };
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;
  const axiosInstance = getAxiosInstance();

  const [showEditModal, setShowEditModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    data: order,
    isLoading,
    error,
    refetch,
  } = useQuery<Order | null>({
    queryKey: ["order-detail", orderId],
    queryFn: async () => {
      if (!orderId) return null;

      try {
        const { data } = await axiosInstance.get<OrderResponseShape>(`/orders/${orderId}`);

        console.log("📦 Full Order Response:", data);
        console.log("💰 usedPoints:", data?.usedPoints);
        console.log("💰 earnedPoints:", data?.earnedPoints);
        console.log("🔍 items:", data?.items);

        // ✅ items의 각 item 확인
        if (data?.items && Array.isArray(data.items)) {
          data.items.forEach((item: OrderItem, index: number) => {
            console.log(`📌 Item ${index}:`, {
              id: item.id,
              productName: item.productName,
              size: item.size,
              unitPrice: item.unitPrice,
              quantity: item.quantity,
            });
          });
        }

        // ✅ payments -> payment로 변환 (임시)
        if (data.payments && !data.payment) {
          data.payment = data.payments;
          delete data.payments;
        }

        return data || null;
      } catch (err) {
        console.error("주문 조회 오류:", err);
        return null;
      }
    },
    enabled: !!orderId && mounted,
    retry: 2,
  });

  // ✅ order 변경 시 포인트 로깅
  useEffect(() => {
    if (order) {
      console.log("🔍 Order loaded in component:");
      console.log("  usedPoints:", order.usedPoints);
      console.log("  earnedPoints:", order.earnedPoints);
      console.log("  items count:", order.items?.length);

      // ✅ 각 아이템의 사이즈 확인
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item: OrderItem, index: number) => {
          console.log(`  Item ${index} size:`, item.size);
        });
      }

      console.log("  Full order object:", order);
    }
  }, [order]);

  // ✅ 주문 상태 레이블 (한글 변환)
  const getOrderStatusLabel = (status?: string): string => {
    if (!status) return "정보 없음";

    switch (status) {
      case "WaitingPayment":
        return "결제 대기중";
      case "CompletedPayment":
        return "결제 완료";
      case "Canceled":
        return "주문 취소";
      default:
        return status;
    }
  };

  const getShippingStatusLabel = (status?: string): string => {
    if (!status) return "배송 정보 없음";

    switch (status) {
      case ShippingStatus.ReadyToShip:
      case "ReadyToShip":
        return "배송 준비중";
      case ShippingStatus.InShipping:
      case "InShipping":
        return "배송 중";
      case ShippingStatus.Delivered:
      case "Delivered":
        return "배송 완료";
      default:
        return "배송 정보 없음";
    }
  };

  // ✅ 결제수단 레이블
  const getPaymentMethodLabel = (payment?: PaymentLike): string => {
    if (!payment) return "정보 없음";

    if (payment.paymentMethod) {
      const method = payment.paymentMethod;
      if (method === "MOBILE_PHONE") return "휴대폰";
      if (method === "CREDIT_CARD") return "신용카드";
      if (method === "BANK_TRANSFER") return "계좌이체";
      return method;
    }

    if (payment.cardNumber) return `신용카드 (${payment.cardNumber})`;
    if (payment.bankName) return `${payment.bankName} (계좌이체)`;
    if (payment.phoneNumber) return "휴대폰";

    return payment.status || "정보 없음";
  };

  const getSizeLabel = (item: OrderItem): string => {
    const size = item.size as ItemSizeShape | undefined;
    return size?.size?.ko ?? size?.nameKo ?? size?.name ?? "정보 없음";
  };

  // ✅ 결제 상태 레이블 (한글 변환)
  const getPaymentStatusLabel = (status?: string): string => {
    if (!status) return "정보 없음";

    switch (status) {
      case "WaitingPayment":
        return "결제 대기중";
      case "CompletedPayment":
        return "결제 완료";
      case "FailedPayment":
        return "결제 실패";
      case "CanceledPayment":
        return "결제 취소";
      default:
        return status;
    }
  };

  if (!mounted) return null;

  if (isLoading) {
    return <div className="flex justify-center py-20">로딩 중...</div>;
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <div className="text-red-500">주문을 찾을 수 없습니다.</div>
        <Button
          label="돌아가기"
          size="medium"
          variant="secondary"
          color="black"
          onClick={() => router.back()}
        />
      </div>
    );
  }

  const canCancel = canCancelOrder(order);
  const cancelReason = !canCancel ? getCancelRestrictReason(order) : "";
  const items = order.items ?? order.orderItems ?? [];
  const paymentInfo = order.payment;
  const usedPoints = order.usedPoints ?? 0;
  const earnedPoints = order.earnedPoints ?? 0;

  // ✅ 렌더링 전 최종 확인
  console.log("🎯 Rendering with:");
  console.log("  usedPoints:", usedPoints);
  console.log("  earnedPoints:", earnedPoints);
  console.log("  items:", items);

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-[1000px] px-5 pt-8 pb-20">
        {/* 헤더 */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-extrabold">주문 상세</h1>
          <button
            onClick={() => router.back()}
            className="text-gray-500 hover:text-black"
          >
            ✕
          </button>
        </div>

        {/* 주문 정보 */}
        <div className="mb-8 rounded-lg border border-gray-300 p-6">
          <div className="mb-4 grid grid-cols-2 gap-6">
            <div>
              <p className="mb-1 text-sm text-gray-600">주문번호</p>
              <p className="text-lg font-bold">{order.id}</p>
            </div>
            <div>
              <p className="mb-1 text-sm text-gray-600">배송상태</p>
              <p className="text-lg font-bold text-blue-600">{getShippingStatusLabel(order.shipping?.status)}</p>
            </div>
            <div>
              <p className="mb-1 text-sm text-gray-600">주문일</p>
              <p className="text-lg font-bold">{new Date(order.createdAt).toLocaleDateString("ko-KR")}</p>
            </div>
            <div>
              <p className="mb-1 text-sm text-gray-600">주문상태</p>
              <p className="text-lg font-bold">{getOrderStatusLabel(order.status)}</p> {/* ✅ 수정됨 */}
            </div>
          </div>
        </div>

        {/* 배송 정보 */}
        <div className="mb-8 rounded-lg border border-gray-300 p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-extrabold">배송 정보</h2>
            {canCancel && (
              <button
                onClick={() => setShowEditModal(true)}
                className="text-sm font-bold text-blue-600 hover:text-blue-800"
              >
                수정하기
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center justify-between border-b py-2">
              <span className="text-gray-600">받는분</span>
              <span className="text-right font-bold">{order.buyerName}</span>
            </div>
            <div className="flex items-center justify-between border-b py-2">
              <span className="text-gray-600">전화번호</span>
              <span className="text-right font-bold">{order.phoneNumber}</span>
            </div>
            <div className="flex items-start justify-between py-2">
              <span className="text-gray-600">주소</span>
              <span className="max-w-[50%] text-right font-bold">{order.address}</span>
            </div>
          </div>
        </div>

        {/* 상품 정보 */}
        <div className="mb-8 rounded-lg border border-gray-300 p-6">
          <h2 className="mb-6 text-xl font-extrabold">상품 정보</h2>
          <div className="space-y-4">
            {items.map((item) => {
              console.log(`🛍️ Rendering Item:`, {
                productName: item.productName,
                size: item.size,
              });

              return (
                <div
                  key={item.id}
                  className="flex gap-4 border-b pb-4 last:border-b-0"
                >
                  <div className="relative h-20 w-20 flex-shrink-0">
                    <Image
                      src={item.product?.image || item.productImageUrl || "/images/Mask-group.svg"}
                      alt={item.product?.name || item.productName || "상품"}
                      fill
                      className="rounded object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="mb-1 font-bold">{item.product?.name || item.productName}</p>
                    <p className="mb-1 text-sm text-gray-600">
                      사이즈: {getSizeLabel(item)}
                    </p>
                    <p className="text-sm">
                      {(item.price ?? item.unitPrice ?? 0).toLocaleString()}원 × {item.quantity}개
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">
                      {((item.price ?? item.unitPrice ?? 0) * item.quantity).toLocaleString()}원
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 결제 정보 */}
        <div className="mb-8 rounded-lg border border-gray-300 p-6">
          <h2 className="mb-6 text-xl font-extrabold">결제 정보</h2>

          {/* 가격 정보 */}
          <div className="mb-6 rounded-lg bg-gray-50 p-4">
            <div className="mb-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">상품금액</span>
                <span className="font-bold">
                  {items
                    .reduce((sum: number, item) => sum + (item.price ?? item.unitPrice ?? 0) * item.quantity, 0)
                    .toLocaleString()}
                  원
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">배송료</span>
                <span className="font-bold">0원</span>
              </div>
              {usedPoints > 0 && (
                <div className="flex justify-between border-t pt-2 text-sm">
                  <span className="text-gray-600">사용 포인트</span>
                  <span className="font-bold text-red-600">-{usedPoints.toLocaleString()}원</span>
                </div>
              )}
            </div>

            <div className="flex justify-between border-t pt-4">
              <span className="text-lg font-bold">총결제금액</span>
              <span className="text-2xl font-extrabold text-blue-600">
                {(paymentInfo?.price ?? 0).toLocaleString()}원
              </span>
            </div>
          </div>

          {/* 결제 수단 및 상태 */}
          <div className="space-y-3 border-t pt-4">
            <div className="flex items-center justify-between py-2">
              <span className="font-medium text-gray-600">결제수단</span>
              <span className="font-bold">{getPaymentMethodLabel(paymentInfo)}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="font-medium text-gray-600">결제상태</span>
              <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-sm font-bold text-green-700">
                {getPaymentStatusLabel(paymentInfo?.status)}
              </span>
            </div>
            {earnedPoints > 0 && (
              <div className="flex items-center justify-between border-t py-2">
                <span className="font-medium text-gray-600">적립 포인트</span>
                <span className="font-bold text-orange-600">+{earnedPoints.toLocaleString()}P</span>
              </div>
            )}
          </div>
        </div>

        {/* 취소 불가능 메시지 */}
        {!canCancel && cancelReason && (
          <div className="mb-8 rounded-lg border-l-4 border-yellow-400 bg-yellow-50 p-4">
            <p className="font-bold text-yellow-800">⚠️ {cancelReason}</p>
          </div>
        )}

        {/* 버튼 */}
        <div className="flex gap-3">
          <Button
            label="닫기"
            size="large"
            variant="secondary"
            color="black"
            className="flex-1"
            onClick={() => router.back()}
          />
          {canCancel && (
            <Button
              label="주문 취소"
              size="large"
              variant="primary"
              color="black"
              className="flex-1 bg-red-600 hover:bg-red-700"
              onClick={() => setShowCancelModal(true)}
            />
          )}
        </div>
      </div>

      {/* 수정 모달 */}
      <OrderEditModal
        open={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          refetch();
        }}
        order={order}
        orderId={orderId}
      />

      {/* 취소 모달 */}
      <OrderCancelModal
        open={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        orderId={orderId}
        onSuccess={() => {
          refetch();
          router.back();
        }}
      />
    </div>
  );
}
