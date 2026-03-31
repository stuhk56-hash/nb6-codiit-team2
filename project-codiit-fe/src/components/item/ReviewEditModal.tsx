"use client";

import Stars from "@/app/(routes)/products/[productId]/components/Stars";
import Modal from "@/components/Modal";
import { getAxiosInstance } from "@/lib/api/axiosInstance";
import { useToaster } from "@/proviers/toaster/toaster.hook";
import { OrderItem } from "@/types/order";
import { resolveSizeLabel } from "@/utils/sizeLabel";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Image from "next/image";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import Button from "../button/Button";
import Divder from "../divider/Divder";
import TextArea from "../input/TextArea";

interface Review {
  id: string;
  rating: number;
  content: string;
  createdAt: string;
}

interface ReviewEditModalProps {
  open: boolean;
  onClose: () => void;
  purchase: OrderItem;
  review: Review;
  onComplete: () => void;
}

export default function ReviewEditModal({ open, onClose, purchase, review, onComplete }: ReviewEditModalProps) {
  const axiosInstance = getAxiosInstance();
  const queryClient = useQueryClient(); // ✅ 추가
  const toaster = useToaster();
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { rating: review.rating, content: review.content },
  });

  useEffect(() => {
    if (open) {
      reset({ rating: review.rating, content: review.content });
    }
  }, [open, review, reset]);

  const updateReviewMutation = useMutation({
    mutationFn: async (data: { rating: number; content: string }) => {
      console.log("📝 리뷰 수정 요청", data);

      const response = await axiosInstance.patch(`/review/${review.id}`, {
        rating: parseInt(String(data.rating), 10),
        content: String(data.content).trim(),
      });

      console.log("✅ 리뷰 수정 API 성공:", response.data);
      return response.data;
    },
    onSuccess: () => {
      console.log("✅ 리뷰 수정 완료");
      toaster("info", "리뷰가 수정되었습니다.");

      // ✅ 1. 즉시 폼 초기화
      reset({ rating: 0, content: "" });

      // ✅ 2. 캐시 무효화
      console.log("🗑️ 캐시 무효화 시작");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["mypage-orders"] });

      // ✅ 3. 캐시 새로고침
      setTimeout(() => {
        console.log("🔄 캐시 새로고침 시작");
        queryClient.refetchQueries({ queryKey: ["orders"] });
        queryClient.refetchQueries({ queryKey: ["mypage-orders"] });
      }, 300);

      // ✅ 4. 모달 닫기 (마지막에!)
      setTimeout(() => {
        onClose();
        onComplete();
      }, 100);
    },
    onError: (error: unknown) => {
      console.error("❌ 리뷰 수정 실패:", error);
      const message = axios.isAxiosError(error)
        ? (error.response?.data as { message?: string } | undefined)?.message
        : undefined;
      toaster("warn", message || "리뷰 수정 중 오류가 발생했습니다.");
    },
  });

  const handleReviewSubmit = (data: { rating: number; content: string }) => {
    updateReviewMutation.mutate(data);
  };

  if (!purchase) return null;

  const imageUrl = purchase.product?.image || purchase.productImageUrl || "/images/Mask-group.svg";
  const sizeLabel = resolveSizeLabel(purchase.size);

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      closeOnBackdropClick={true}
      isDimmed={false}
    >
      <form
        onSubmit={handleSubmit(handleReviewSubmit)}
        className="relative"
      >
        <button
          type="button"
          className="absolute top-0 right-0"
          onClick={onClose}
        >
          <Image
            src="/icon/deleteBlack.svg"
            alt="닫기"
            width={24}
            height={24}
          />
        </button>
        <div className="text-black01 mb-5 text-[1.75rem] font-extrabold">리뷰 수정</div>
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
                  구매일 : {new Date().toLocaleDateString("ko-KR")}
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
          <div className="flex flex-col gap-5">
            <label className="text-black01 text-xl font-extrabold">상품은 만족하셨나요?</label>
            <Controller
              name="rating"
              control={control}
              render={({ field: { value, onChange } }) => (
                <div className="flex items-center justify-center gap-1">
                  <Stars
                    size="XLarge"
                    rating={value}
                    onChange={onChange}
                  />
                  {errors.rating && <span className="text-red01 text-sm">평점을 선택해주세요.</span>}
                </div>
              )}
            />
            <Controller
              name="content"
              control={control}
              render={({ field }) => (
                <div className="flex flex-col gap-2.5">
                  <TextArea
                    {...field}
                    label="어떤 점이 좋았나요?"
                    placeholder="최소 10자 이상 입력"
                  />
                </div>
              )}
            />
          </div>
        </div>
        <Button
          type="submit"
          label={updateReviewMutation.isPending ? "수정 중..." : "리뷰 수정"}
          size="large"
          variant="primary"
          color="black"
          className="h-15 w-full"
          disabled={updateReviewMutation.isPending}
        />
      </form>
    </Modal>
  );
}
