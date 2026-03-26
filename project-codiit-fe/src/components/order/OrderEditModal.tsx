"use client";

import Modal from "@/components/Modal";
import Button from "@/components/button/Button";
import { getAxiosInstance } from "@/lib/api/axiosInstance";
import { Order } from "@/types/order";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

interface OrderEditModalProps {
  open: boolean;
  onClose: () => void;
  order: Order;
  orderId: string;
}

export default function OrderEditModal({ open, onClose, order, orderId }: OrderEditModalProps) {
  const axiosInstance = getAxiosInstance();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: order.buyerName,
    phone: order.phoneNumber,
    address: order.address,
  });

  const [error, setError] = useState<string>("");

  const updateMutation = useMutation({
    mutationFn: async () => {
      const response = await axiosInstance.patch(`/orders/${orderId}`, {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
      });
      return response.data;
    },
    onSuccess: () => {
      alert("주문 정보가 수정되었습니다.");
      setError("");

      queryClient.invalidateQueries({ queryKey: ["order-detail"] });
      queryClient.invalidateQueries({ queryKey: ["mypage-orders"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });

      onClose();
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.message || "주문 정보 수정에 실패했습니다.";
      setError(errorMsg);
      console.error("수정 실패:", error.response?.data);
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.phone || !formData.address) {
      setError("모든 필드를 입력해주세요.");
      return;
    }

    updateMutation.mutate();
  };

  // ✅ 주석 제거하고 return 분리
  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      closeOnBackdropClick={false} // ❌ 배경 클릭 불가
      isDimmed={true} // ✅ 어두운 배경
    >
      <form
        onSubmit={handleSubmit}
        className="w-[500px] p-8"
      >
        <h2 className="mb-6 text-2xl font-extrabold">배송 정보 수정</h2>

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        <div className="mb-4 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-bold">받는분</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-black focus:outline-none"
              placeholder="받는분 이름"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold">전화번호</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-black focus:outline-none"
              placeholder="010-1234-5678"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold">주소</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-black focus:outline-none"
              placeholder="배송 주소"
            />
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <Button
            type="button"
            label="취소"
            size="large"
            variant="secondary"
            color="black"
            className="flex-1"
            onClick={onClose}
          />
          <Button
            type="submit"
            label="수정하기"
            size="large"
            variant="primary"
            color="black"
            className="flex-1"
            disabled={updateMutation.isPending}
          />
        </div>
      </form>
    </Modal>
  );
}
