"use client";

import OrderInfoSection from "@/components/order/OrderInfoSection";
import OrderPointSection from "@/components/order/OrderPointSection";
import OrderProductList from "@/components/order/OrderProductList";
import OrderSummary from "@/components/order/OrderSummary";
import PaymentComplete from "@/components/payment/PaymentComplete";
import PaymentModal from "@/components/payment/PaymentModal";
import { getAxiosInstance } from "@/lib/api/axiosInstance";
import { useOrderStore } from "@/store/orderStore";
import { PaymentResponse } from "@/types/payment";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function OrderPage() {
  const axiosInstance = getAxiosInstance();
  const router = useRouter();
  const { selectedItems, getOrderRequest, reset } = useOrderStore();
  const isOrderCompleted = useRef(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentResponse | null>(null);
  const [orderPrice, setOrderPrice] = useState(0);
  const [currentOrderId, setCurrentOrderId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (selectedItems.length === 0 && !isOrderCompleted.current) {
      router.replace("/buyer/shopping");
    }
  }, [selectedItems, router]);

  const deleteCartItemsMutation = useMutation({
    mutationFn: async () => {
      const deletePromises = selectedItems.map((item) => axiosInstance.delete(`/cart/${item.id}`));
      await Promise.all(deletePromises);
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: async () => {
      const requestData = getOrderRequest();
      const response = await axiosInstance.post("/orders", requestData);

      console.log("📥 response:", response);
      console.log("📥 response.data:", response.data);

      // ✅ response.data가 바로 orderData!
      // (response.data.data가 아님)
      const orderData = response.data;

      console.log("✅ 최종 orderData:", orderData);
      console.log("✅ orderData.id:", orderData?.id);

      return orderData; // ✅ 반드시 return!
    },
    onSuccess: (orderData) => {
      try {
        console.log("🎉 onSuccess 호출됨");
        console.log("📦 전달받은 orderData:", orderData);

        const orderId = orderData?.id;

        if (!orderId) {
          console.error("❌ orderId가 없습니다:", orderData);
          alert("주문 ID를 받을 수 없습니다");
          return;
        }

        setCurrentOrderId(orderId);

        const totalPrice = selectedItems.reduce((sum, item) => {
          const price = item.product.price;
          const discountRate = item.product.discountRate;
          const discountedPrice = Math.floor(price * (1 - discountRate / 100));
          return sum + discountedPrice * item.quantity;
        }, 0);

        setOrderPrice(totalPrice);
        setIsPaymentModalOpen(true);
        setIsLoading(false);
      } catch (error) {
        console.error("주문 처리 중 오류:", error);
        alert("주문 처리 중 오류가 발생했습니다");
        setIsLoading(false);
      }
    },
    onError: (error: any) => {
      console.error("❌ 주문 생성 실패:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "주문 생성에 실패했습니다";
      alert(errorMessage);
      setIsLoading(false);
    },
  });

  const handlePaymentSuccess = async (payment: PaymentResponse) => {
    try {
      // 결제 성공 후 장바구니 아이템 삭제
      await deleteCartItemsMutation.mutateAsync();
      isOrderCompleted.current = true;
      reset();
      setIsPaymentModalOpen(false);

      // 결제 완료 화면 표시
      setPaymentData(payment);
    } catch (error) {
      console.error("장바구니 삭제 중 오류:", error);
      // 장바구니 삭제 실패해도 결제는 완료되었으므로 완료 화면 표시
      setPaymentData(payment);
    }
  };

  // ✅ 결제 완료 후 최종 화면
  if (paymentData) {
    return <PaymentComplete payment={paymentData} />;
  }

  return (
    <div>
      <div className="mx-auto h-full max-w-[1520px] bg-white pt-8">
        <div className="flex items-center gap-5">
          <h1 className="text-black01 flex items-center text-[1.75rem] font-extrabold">주문 및 결제</h1>
        </div>
        <div className="mt-8 flex gap-15">
          <div className="flex-1">
            <OrderInfoSection />
            <OrderProductList />
            <OrderPointSection />
          </div>

          <OrderSummary
            onClick={() => {
              if (isLoading || createOrderMutation.isPending) return;
              setIsLoading(true);
              createOrderMutation.mutate();
            }}
          />
        </div>
      </div>

      {/* ✅ 결제 모달 */}
      {isPaymentModalOpen && (
        <PaymentModal
          orderId={currentOrderId}
          price={orderPrice}
          onClose={() => setIsPaymentModalOpen(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
