"use client";

import Stars from "@/app/(routes)/products/[productId]/components/Stars";
import Modal from "@/components/Modal";
import { getAxiosInstance } from "@/lib/api/axiosInstance";
import { useToaster } from "@/proviers/toaster/toaster.hook";
import { OrderItem } from "@/types/order";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Image from "next/image";
import { useEffect, useState } from "react";
import Button from "../button/Button";
import Divder from "../divider/Divder";
import ReviewEditModal from "./ReviewEditModal";

interface Review {
  id: string;
  rating: number;
  content: string;
  createdAt: string;
}

interface ReviewViewModalProps {
  open: boolean;
  onClose: () => void;
  purchase: OrderItem | null;
  onEditComplete: () => void;
}

type ProductReviewLike = {
  id: string;
  rating: number;
  content: string;
  createdAt: string;
  orderItemId?: string | null;
};

type ItemSizeShape = OrderItem["size"] & {
  size?: {
    ko?: string;
  };
};

export default function ReviewViewModal({ open, onClose, purchase, onEditComplete }: ReviewViewModalProps) {
  const axiosInstance = getAxiosInstance();
  const queryClient = useQueryClient();
  const toaster = useToaster();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [review, setReview] = useState<Review | null>(null);

  useEffect(() => {
    if (!purchase?.product?.reviews) {
      setReview(null);
      return;
    }

    const reviews = purchase.product.reviews as ProductReviewLike[];
    const myReview = reviews.find((r) => r.orderItemId === purchase.id);

    setReview(myReview || null);
  }, [purchase]);

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!review?.id) {
        throw new Error("리뷰 ID가 없습니다.");
      }

      console.log("🗑️ 리뷰 삭제 시작 - reviewId:", review.id);

      const response = await axiosInstance.delete(`/review/${review.id}`);
      console.log("✅ 리뷰 삭제 성공:", response.data);

      return response.data;
    },
    onSuccess: () => {
      console.log("✅ 리뷰 삭제 완료");
      toaster("info", "리뷰가 삭제되었습니다.");

      // ✅ 1. 모달 닫기
      onClose();

      // ✅ 2. 캐시 무효화 및 리페치
      setTimeout(() => {
        console.log("🔄 캐시 무효화 및 리페치");
        queryClient.invalidateQueries({ queryKey: ["orders"] });
        queryClient.invalidateQueries({ queryKey: ["mypage-orders"] });
        queryClient.refetchQueries({ queryKey: ["orders"] });
        queryClient.refetchQueries({ queryKey: ["mypage-orders"] });
      }, 100);
    },
    onError: (error: unknown) => {
      console.error("❌ 리뷰 삭제 실패:", error);

      const status = axios.isAxiosError(error) ? error.response?.status : undefined;
      const message = axios.isAxiosError(error)
        ? (error.response?.data as { message?: string } | undefined)?.message
        : undefined;

      if (status === 403) {
        toaster("warn", "리뷰 삭제 권한이 없습니다.");
      } else if (status === 404) {
        toaster("warn", "리뷰를 찾을 수 없습니다.");
      } else {
        toaster("warn", message || "리뷰 삭제 중 오류가 발생했습니다.");
      }
    },
  });

  const handleDelete = () => {
    if (window.confirm("이 리뷰를 삭제하시겠습니까?")) {
      deleteMutation.mutate();
    }
  };

  const handleEditComplete = () => {
    console.log("✅ 수정 모달에서 완료 신호 받음");
    setIsEditModalOpen(false);

    // ✅ 부모에게 완료 알리기 (리페치 실행)
    onEditComplete();
  };

  if (!open) {
    return null;
  }

  if (!purchase || !review) {
    return (
      <Modal
        isOpen={open}
        onClose={onClose}
        closeOnBackdropClick={true}
        isDimmed={false}
      >
        <div className="w-[600px] py-12 text-center">
          <p className="text-lg text-gray-500">리뷰 정보를 찾을 수 없습니다.</p>
        </div>
      </Modal>
    );
  }

  const imageUrl = purchase.product?.image || purchase.productImageUrl || "/images/Mask-group.svg";
  const size = purchase.size as ItemSizeShape | undefined;
  const sizeLabel = size?.size?.ko ?? "사이즈 정보 없음";

  return (
    <>
      <Modal
        isOpen={open}
        onClose={onClose}
        closeOnBackdropClick={true}
        isDimmed={false}
      >
        <div className="relative">
          <button
            className="absolute top-0 right-0 transition hover:opacity-70"
            onClick={onClose}
          >
            <Image
              src="/icon/deleteBlack.svg"
              alt="닫기"
              width={24}
              height={24}
            />
          </button>

          <div className="text-black01 mb-5 text-[1.75rem] font-extrabold">작성한 리뷰</div>
          <Divder className="mb-10" />

          <div className="mb-10 flex flex-col gap-6">
            <div className="flex gap-2.5">
              <div className="relative h-[6.875rem] w-25 flex-shrink-0">
                <Image
                  src={imageUrl}
                  fill
                  alt={purchase.product?.name || purchase.productName || "상품"}
                  className="rounded-md object-cover"
                />
              </div>

              <div className="flex flex-1 flex-col gap-2.5">
                <div className="flex flex-col gap-[0.625rem]">
                  <div className="text-gray01 text-base/5 font-normal">
                    구매일 : {new Date(review.createdAt).toLocaleDateString("ko-KR")}
                  </div>
                  <div className="text-black01 text-lg/5 font-bold">
                    {purchase.product?.name || purchase.productName || "상품명 없음"}
                  </div>
                </div>
                <div className="text-black01 text-lg/5 font-normal">
                  사이즈 : {sizeLabel}
                </div>
                <div className="flex items-center gap-[0.625rem]">
                  <span className="text-lg/5 font-extrabold">
                    {(purchase.price ?? purchase.unitPrice ?? 0).toLocaleString()}원
                  </span>
                  <span className="text-gray01 text-base/4.5 font-normal">| {purchase.quantity}개</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 rounded-lg bg-gray-50 p-6">
              <div>
                <p className="text-gray01 mb-2 text-sm font-semibold">평점</p>
                <div className="mb-3">
                  <Stars
                    size="normal"
                    rating={review.rating}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-black01 text-sm font-bold">리뷰</span>
                <span className="text-gray01 text-sm font-normal">
                  {new Date(review.createdAt).toLocaleDateString("ko-KR")}
                </span>
              </div>

              <div className="rounded border border-gray-200 bg-white p-4">
                <p className="text-black01 text-base leading-relaxed whitespace-pre-wrap">{review.content}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              label="✏️ 수정"
              size="large"
              variant="primary"
              color="black"
              className="h-15 flex-1"
              onClick={() => setIsEditModalOpen(true)}
              disabled={deleteMutation.isPending} // ✅ 삭제 중이면 비활성화
            />
            <Button
              label={deleteMutation.isPending ? "삭제 중..." : "🗑️ 삭제"}
              size="large"
              variant="secondary"
              color="white"
              className="h-15 flex-1"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            />
          </div>
        </div>
      </Modal>

      {purchase && review && (
        <ReviewEditModal
          open={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          purchase={purchase}
          review={review}
          onComplete={handleEditComplete}
        />
      )}
    </>
  );
}
