"use client";

import Modal from "@/components/Modal";
import Button from "@/components/button/Button";
import { getAxiosInstance } from "@/lib/api/axiosInstance";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

interface OrderCancelModalProps {
  open: boolean;
  onClose: () => void;
  orderId: string;
  onSuccess: () => void;
}

export default function OrderCancelModal({ open, onClose, orderId, onSuccess }: OrderCancelModalProps) {
  const axiosInstance = getAxiosInstance();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCancel = async () => {
    setIsLoading(true);
    setError("");

    try {
      console.log("🔍 주문 취소 요청 시작:", orderId);

      const response = await axiosInstance.delete(`/orders/${orderId}`);

      console.log("✅ 주문 취소 성공:", response);
      alert("주문이 취소되었습니다.");

      // ✅ 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ["order-detail"] });
      queryClient.invalidateQueries({ queryKey: ["mypage-orders"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });

      // ✅ 약간의 지연 후 실행
      setTimeout(() => {
        console.log("🔄 캐시 새로고침 시작");
        queryClient.refetchQueries({ queryKey: ["mypage-orders"] });
        queryClient.refetchQueries({ queryKey: ["orders"] });
      }, 500);

      // ✅ 모달 닫기
      console.log("🔍 모달 닫기 시작");
      onClose();

      // ✅ onSuccess 콜백 실행
      console.log("🔍 onSuccess 콜백 실행");
      onSuccess();

      setIsLoading(false); // ✅ 로딩 상태 해제 추가
    } catch (error: any) {
      setIsLoading(false);

      console.error("❌ 주문 취소 에러:", error);
      console.error("  status:", error.response?.status);
      console.error("  message:", error.response?.data?.message);

      let errorMsg =
        error.response?.data?.message || error.response?.data?.error || `취소 실패 (${error.response?.status})`;

      setError(errorMsg);
    }
  };

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      closeOnBackdropClick={false}
    >
      <div className="w-[400px] p-8">
        <h2 className="mb-4 text-2xl font-extrabold">주문 취소</h2>
        <p className="mb-6 text-gray-600">
          배송준비 상태인 주문만 취소할 수 있습니다.
          <br />
          정말로 이 주문을 취소하시겠습니까?
        </p>

        {error && (
          <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <p className="mb-1 font-bold">❌ 취소 실패</p>
            <p>{error}</p>
          </div>
        )}

        <div className="flex gap-3">
          <Button
            label="아니오"
            size="large"
            variant="secondary"
            color="black"
            className="flex-1"
            onClick={onClose}
            disabled={isLoading}
          />
          <Button
            label={isLoading ? "취소 중..." : "네, 취소하겠습니다"}
            size="large"
            variant="primary"
            color="black"
            className="flex-1 bg-red-600 hover:bg-red-700"
            onClick={handleCancel}
            disabled={isLoading}
          />
        </div>
      </div>
    </Modal>
  );
}
