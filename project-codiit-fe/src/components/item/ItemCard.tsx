"use client";

import { useToaster } from "@/proviers/toaster/toaster.hook";
import { Order, OrderItem, ShippingStatus } from "@/types/order";
import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "../button/Button";
import ShippingModal from "../order/ShippingModal";
import ReviewViewModal from "./ReviewViewModal";
import ReviewWriteModal from "./ReviewWriteModal";

interface ItemCardProps {
  purchases: OrderItem[];
  orders?: Order[];
}

export default function ItemCard({ purchases, orders = [] }: ItemCardProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const toaster = useToaster();

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
    queryClient.invalidateQueries({ queryKey: ["orders"] });
  };

  // ✅ 리뷰 수정 완료 콜백
  const handleReviewEditComplete = async () => {
    console.log("📝 리뷰 수정 완료 - 전체 리페치 시작");

    setReviewViewTarget(null);

    queryClient.invalidateQueries({ queryKey: ["orders"] });
    queryClient.invalidateQueries({ queryKey: ["mypage-orders"] });

    await queryClient.refetchQueries({ queryKey: ["orders"] });
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

  // ✅ 리뷰 여부 판단 (item.reviews 배열로 판단 - MypageItemCard와 동일)
  const hasReview = (item: OrderItem): boolean => {
    return !!(item.reviews && item.reviews.length > 0);
  };

  // ✅ 리뷰 쓰기 클릭 시 권한 체크
  const handleReviewWriteClick = (item: OrderItem) => {
    const relatedOrder = getRelatedOrder(item.id);

    if (relatedOrder?.shipping?.status !== ShippingStatus.Delivered) {
      toaster("warn", "배송이 완료되어야 리뷰를 쓸 수 있습니다.");
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
        const itemHasReview = hasReview(item); // ✅ 수정됨

        console.log("🛍️ ItemCard rendering item:", {
          productName: item.productName,
          hasReview: itemHasReview,
          reviewsCount: item.reviews?.length, // ✅ 수정됨
        });

        return (
          <div
            key={item.id}
            className="border-gray03 rounded-2xl border bg-white p-[1.875rem]"
          >
            <div className="flex items-end justify-between">
              {/* 왼쪽: 상품 정보 */}
              <div className="flex flex-1 items-center gap-[1.875rem]">
                <div className="relative h-45 w-45">
                  <Image
                    src={imageUrl}
                    alt={item.product?.name || item.productName || "상품"}
                    fill
                    className="rounded-xl object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-[1.875rem]">
                  <div className="flex flex-col gap-[0.625rem]">
                    <div className="text-gray01 text-base font-normal">
                      구매일 : {new Date().toLocaleDateString("ko-KR")}
                    </div>
                    <div className="text-black01 text-lg font-bold">
                      {item.product?.name || item.productName || "상품명 없음"}
                    </div>
                  </div>
                  <div className="text-black01 text-lg font-normal">
                    사이즈 :{" "}
                    {(item.size as any)?.size?.ko ||
                      (item.size as any)?.nameKo ||
                      (item.size as any)?.name ||
                      "사이즈 정보 없음"}{" "}
                    {/* ✅ 수정됨 */}
                  </div>
                  <div className="flex items-center gap-[0.625rem]">
                    <span className="text-lg font-extrabold">
                      {(item.price ?? item.unitPrice ?? 0).toLocaleString()}원
                    </span>
                    <span className="text-gray01 text-base font-normal">| {item.quantity}개</span>
                  </div>
                </div>
              </div>

              {/* 오른쪽: 버튼 3개 */}
              <div className="ml-4 flex flex-col gap-2">
                {/* 배송 조회 버튼 */}
                {relatedOrder?.shipping && (
                  <Button
                    label="🚚 배송조회"
                    size="medium"
                    variant="secondary"
                    color="black"
                    className="h-[3.75rem] w-[12.5rem] px-[1.875rem] py-[0.875rem] font-bold"
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
                    className="h-[3.75rem] w-[12.5rem] px-[1.875rem] py-[0.875rem] font-bold"
                    onClick={() => router.push(`/buyer/order-detail/${relatedOrder.id}`)}
                  />
                )}

                {/* 리뷰 보기/쓰기 버튼 */}
                <Button
                  label={itemHasReview ? "⭐ 리뷰보기" : "📝 리뷰쓰기"} // ✅ 수정됨
                  size="medium"
                  variant="secondary"
                  color={itemHasReview ? "white" : "black"} // ✅ 수정됨
                  className={`h-[3.75rem] w-[12.5rem] px-[1.875rem] py-[0.875rem] font-bold ${
                    !itemHasReview && !isDelivered ? "cursor-not-allowed opacity-50" : "" // ✅ 수정됨
                  }`}
                  disabled={!itemHasReview && !isDelivered} // ✅ 수정됨
                  onClick={() => {
                    if (itemHasReview) {
                      // ✅ 수정됨
                      setReviewViewTarget(item);
                    } else {
                      handleReviewWriteClick(item);
                    }
                  }}
                />
              </div>
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
