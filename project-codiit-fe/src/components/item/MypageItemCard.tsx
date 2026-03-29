"use client";

import { Order, OrderItem, ShippingStatus } from "@/types/order";
import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "../button/Button";
import ShippingModal from "../order/ShippingModal";
import ReviewViewModal from "./ReviewViewModal";
import ReviewWriteModal from "./ReviewWriteModal";

interface MypageItemCardProps {
  purchases: OrderItem[];
  orders?: Order[];
}

type ItemSizeShape = OrderItem["size"] & {
  nameKo?: string;
  name?: string;
  size?: {
    ko?: string;
    en?: string;
  };
};

export default function MypageItemCard({ purchases, orders = [] }: MypageItemCardProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [reviewViewTarget, setReviewViewTarget] = useState<OrderItem | null>(null);
  const [reviewWriteTarget, setReviewWriteTarget] = useState<OrderItem | null>(null);
  const [showShippingModal, setShowShippingModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");

  const handleCloseView = () => setReviewViewTarget(null);
  const handleCloseWrite = () => setReviewWriteTarget(null);

  const handleReviewSubmit = () => {
    handleCloseWrite();
  };

  const handleShippingClick = (orderId: string) => {
    setSelectedOrderId(orderId);
    setShowShippingModal(true);
  };

  const handleCloseShippingModal = () => {
    setShowShippingModal(false);
    setSelectedOrderId("");
    queryClient.invalidateQueries({ queryKey: ["mypage-orders"] });
  };

  // ✅ 리뷰 수정 완료 콜백 함수 추가
  const handleReviewEditComplete = async () => {
    console.log("📝 리뷰 수정 완료 - 전체 리페치 시작");

    // 1. 모달 닫기
    setReviewViewTarget(null);

    // 2. 캐시 무효화
    queryClient.invalidateQueries({ queryKey: ["orders"] });
    queryClient.invalidateQueries({ queryKey: ["mypage-orders"] });

    // 3. 새 데이터 불러오기
    await queryClient.refetchQueries({ queryKey: ["mypage-orders"] });
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

  const getRelatedOrder = (itemId: string): Order | undefined => {
    return orders.find((order) => (order.items ?? order.orderItems ?? []).some((oi) => oi.id === itemId));
  };

  const getSizeLabel = (item: OrderItem): string => {
    const size = item.size as ItemSizeShape | undefined;
    return size?.size?.ko ?? size?.nameKo ?? size?.name ?? "정보 없음";
  };

  // ✅ 리뷰 여부 판단 (product.reviews 배열의 길이로 판단)
  const hasReview = (item: OrderItem): boolean => {
    // product.reviews가 아니라, orderItem 자체의 리뷰 여부를 확인
    return !!(item.reviews && item.reviews.length > 0);
  };

  // ✅ 리뷰 쓰기 클릭 시 권한 체크
  const handleReviewWriteClick = (item: OrderItem) => {
    const relatedOrder = getRelatedOrder(item.id);

    if (relatedOrder?.shipping?.status !== ShippingStatus.Delivered) {
      alert("배송이 완료되어야 리뷰를 쓸 수 있습니다.");
      return;
    }

    setReviewWriteTarget(item);
  };

  return (
    <div className="flex w-full flex-col gap-5">
      {purchases.map((item) => {
        const imageUrl = item.product?.image || item.productImageUrl || "/images/Mask-group.svg";
        const relatedOrder = getRelatedOrder(item.id);
        const isDelivered = relatedOrder?.shipping?.status === ShippingStatus.Delivered;
        const itemHasReview = hasReview(item);

        console.log("🛍️ MypageItemCard rendering item:", {
          productName: item.productName,
          hasReview: itemHasReview,
          reviewsCount: item.reviews?.length,
        });

        return (
          <div
            key={item.id}
            className="border-gray03 flex items-center justify-between gap-6 rounded-xl border bg-white p-6"
          >
            {/* ✅ 왼쪽: 상품 정보 섹션 */}
            <div className="flex flex-1 items-center gap-6">
              {/* 사진 - 크기 키움 */}
              <div className="relative h-32 w-32 flex-shrink-0">
                <Image
                  src={imageUrl}
                  alt={item.product?.name || item.productName || "상품"}
                  fill
                  className="rounded-lg object-cover"
                />
              </div>

              {/* 텍스트 정보 */}
              <div className="flex flex-1 flex-col gap-3">
                <div className="flex flex-col gap-2">
                  <div className="text-black01 text-base font-extrabold">
                    {relatedOrder?.shipping
                      ? getShippingStatusLabel(relatedOrder.shipping.status as ShippingStatus)
                      : "배송 정보 없음"}
                  </div>
                  <div className="text-gray01 text-sm font-normal">
                    구매일 : {new Date().toLocaleDateString("ko-KR")}
                  </div>
                  <div className="text-black01 text-lg font-bold">
                    {item.product?.name || item.productName || "상품명 없음"}
                  </div>
                </div>

                {/* 사이즈, 가격, 수량 */}
                  <div className="flex items-center gap-4">
                    <div className="text-black01 text-base font-normal">
                      사이즈:{" "}
                      <span className="font-bold">{getSizeLabel(item)}</span>
                    </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-extrabold">
                      {(item.price ?? item.unitPrice ?? 0).toLocaleString()}원
                    </span>
                    <span className="text-gray01 text-base font-normal">| {item.quantity}개</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ✅ 오른쪽: 버튼 섹션 (배송조회/주문상세/리뷰) */}
            <div className="flex flex-col gap-2">
              {/* 배송 조회 버튼 */}
              {relatedOrder?.shipping && (
                <Button
                  label="🚚 배송조회"
                  size="medium"
                  variant="secondary"
                  color="black"
                  className="h-10 w-28 px-3 py-2 text-sm font-bold whitespace-nowrap"
                  onClick={() => relatedOrder.id && handleShippingClick(relatedOrder.id)}
                />
              )}

              {/* 주문상세 버튼 */}
              {relatedOrder && (
                <Button
                  label="📋 주문상세"
                  size="medium"
                  variant="secondary"
                  color="black"
                  className="h-10 w-28 px-3 py-2 text-sm font-bold whitespace-nowrap"
                  onClick={() => router.push(`/buyer/order-detail/${relatedOrder.id}`)}
                />
              )}

              {/* ✅ 리뷰 보기/쓰기 버튼 - product.reviews 배열로 판단 */}
              <Button
                label={itemHasReview ? "⭐ 리뷰보기" : "📝 리뷰쓰기"}
                size="medium"
                variant="secondary"
                color={itemHasReview ? "white" : "black"}
                className={`h-10 w-28 px-3 py-2 text-sm font-bold whitespace-nowrap ${
                  !itemHasReview && !isDelivered ? "cursor-not-allowed opacity-50" : ""
                }`}
                disabled={!itemHasReview && !isDelivered}
                onClick={() => {
                  if (itemHasReview) {
                    setReviewViewTarget(item);
                  } else {
                    handleReviewWriteClick(item);
                  }
                }}
              />
            </div>
          </div>
        );
      })}

      {/* 배송 조회 모달 */}
      {showShippingModal && (
        <ShippingModal
          isOpen={showShippingModal}
          orderId={selectedOrderId}
          buyerName={orders.find((o) => o.id === selectedOrderId)?.buyerName || "받는사람"}
          address={orders.find((o) => o.id === selectedOrderId)?.address || "주소 정보 없음"}
          onClose={handleCloseShippingModal}
        />
      )}

      {/* 리뷰 보기 모달 */}
      <ReviewViewModal
        open={!!reviewViewTarget}
        onClose={handleCloseView}
        purchase={reviewViewTarget}
        onEditComplete={handleReviewEditComplete}
      />

      {/* 리뷰 작성 모달 */}
      <ReviewWriteModal
        open={!!reviewWriteTarget}
        onClose={handleCloseWrite}
        purchase={reviewWriteTarget}
        onSubmit={handleReviewSubmit}
      />
    </div>
  );
}
