"use client";

import { usePayment } from "@/lib/api/usePayment";
import { PaymentResponse } from "@/types/payment";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import PaymentLoading from "./PaymentLoading";

const creditCardSchema = z.object({
  cardholderName: z.string().min(2, "카드 소유자명을 입력해주세요"),
  cardNumber: z.string().regex(/^\d{4}-\d{4}-\d{4}-\d{4}$/, "카드번호 형식: 1234-5678-9012-3456"),
  expiryDate: z.string().regex(/^\d{2}\/\d{2}$/, "유효기간 형식: MM/YY"),
  cvv: z.string().regex(/^\d{3}$/, "CVV는 3자리 숫자"),
  cardType: z.string().min(1, "카드사를 선택해주세요"),
});

type CreditCardFormType = z.infer<typeof creditCardSchema>;

const CARD_TYPES = [
  { id: "kb", name: "KB국민카드", color: "from-amber-500 to-amber-600" },
  { id: "shinhan", name: "신한카드", color: "from-red-500 to-red-600" },
  { id: "samsung", name: "삼성카드", color: "from-blue-500 to-blue-600" },
  { id: "lotte", name: "롯데카드", color: "from-green-600 to-green-700" },
  { id: "hyundai", name: "현대카드", color: "from-purple-600 to-purple-700" },
  { id: "woori", name: "우리카드", color: "from-indigo-600 to-indigo-700" },
];

interface CreditCardFormProps {
  orderId: string;
  price: number;
  onBack: () => void;
  onSuccess: (payment: PaymentResponse) => Promise<void>;
}

export default function CreditCardForm({ orderId, price, onBack, onSuccess }: CreditCardFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreditCardFormType>({
    resolver: zodResolver(creditCardSchema),
    defaultValues: {
      cardType: "kb",
    },
  });

  const paymentMutation = usePayment();
  const [isLoading, setIsLoading] = useState(false);
  const selectedCardType = watch("cardType");
  const cardNumber = watch("cardNumber");
  const cardholderName = watch("cardholderName");
  const expiryDate = watch("expiryDate");

  const selectedCard = CARD_TYPES.find((card) => card.id === selectedCardType);

  const onSubmit = async (data: CreditCardFormType) => {
    setIsLoading(true);
    try {
      const payment = await paymentMutation.mutateAsync({
        orderId,
        price,
        paymentMethod: "CREDIT_CARD",
        cardNumber: data.cardNumber.replace(/-/g, ""),
      });

      // 3초 지연 후 성공 처리
      setTimeout(() => {
        onSuccess(payment);
      }, 3000);
    } catch {
      setIsLoading(false);
      alert("❌ 결제에 실패했습니다");
    }
  };

  // ✅ 로딩 상태일 때만 로딩 화면 표시
  if (isLoading) {
    return <PaymentLoading />;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h2 className="mb-8 text-3xl font-bold">신용카드 결제</h2>

      {/* 카드 미리보기 */}
      <div className={`mb-8 rounded-2xl bg-gradient-to-br ${selectedCard?.color} p-8 text-white shadow-2xl`}>
        <div className="mb-12 text-sm font-semibold opacity-75">{selectedCard?.name}</div>

        <div className="mb-8 text-2xl font-bold tracking-widest">
          {cardNumber ? cardNumber.slice(0, 4) : "••••"} {cardNumber ? cardNumber.slice(5, 9) : "••••"}{" "}
          {cardNumber ? cardNumber.slice(10, 14) : "••••"} {cardNumber ? cardNumber.slice(15, 19) : "••••"}
        </div>

        <div className="flex items-end justify-between">
          <div>
            <div className="mb-2 text-xs opacity-75">카드 소유자</div>
            <div className="text-lg font-semibold">{cardholderName || "YOUR NAME"}</div>
          </div>
          <div className="text-right">
            <div className="mb-2 text-xs opacity-75">유효기간</div>
            <div className="text-lg font-semibold">{expiryDate || "MM/YY"}</div>
          </div>
        </div>
      </div>

      {/* 카드사 선택 */}
      <div className="mb-6">
        <label className="mb-3 block text-lg font-bold">카드사 선택</label>
        <div className="grid grid-cols-3 gap-3">
          {CARD_TYPES.map((card) => (
            <label
              key={card.id}
              className="relative cursor-pointer"
            >
              <input
                type="radio"
                {...register("cardType")}
                value={card.id}
                className="sr-only"
              />
              <div
                className={`rounded-lg p-3 text-center font-bold transition-all ${
                  selectedCardType === card.id
                    ? "scale-105 ring-2 ring-black ring-offset-2"
                    : "border-2 border-gray-300 hover:border-gray-400"
                }`}
              >
                <div className={`bg-gradient-to-br ${card.color} rounded px-2 py-1 text-sm text-white`}>
                  {card.name}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* 카드 소유자명 */}
      <div className="mb-6">
        <label className="mb-2 block font-bold">카드 소유자명</label>
        <input
          {...register("cardholderName")}
          placeholder="HONG GILDONG"
          className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 uppercase focus:border-black focus:outline-none"
        />
        {errors.cardholderName && <p className="mt-2 text-sm text-red-500">{errors.cardholderName.message}</p>}
      </div>

      {/* 카드번호 */}
      <div className="mb-6">
        <label className="mb-2 block font-bold">카드번호</label>
        <input
          {...register("cardNumber")}
          placeholder="1234-5678-9012-3456"
          maxLength={19}
          className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 font-mono text-lg tracking-wider focus:border-black focus:outline-none"
          onChange={(e) => {
            let value = e.target.value.replace(/\D/g, "");
            if (value.length > 16) value = value.slice(0, 16);
            const formatted = value.replace(/(\d{4})(?=\d)/g, "$1-").toUpperCase();
            e.target.value = formatted;
          }}
        />
        {errors.cardNumber && <p className="mt-2 text-sm text-red-500">{errors.cardNumber.message}</p>}
      </div>

      {/* 유효기간 & CVV */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        <div>
          <label className="mb-2 block font-bold">유효기간</label>
          <input
            {...register("expiryDate")}
            placeholder="MM/YY"
            maxLength={5}
            className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 font-mono focus:border-black focus:outline-none"
            onChange={(e) => {
              let value = e.target.value.replace(/\D/g, "");
              if (value.length >= 2) {
                value = value.slice(0, 2) + "/" + value.slice(2, 4);
              }
              e.target.value = value;
            }}
          />
          {errors.expiryDate && <p className="mt-2 text-sm text-red-500">{errors.expiryDate.message}</p>}
        </div>
        <div>
          <label className="mb-2 block font-bold">CVV</label>
          <input
            {...register("cvv")}
            placeholder="123"
            maxLength={3}
            className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 font-mono focus:border-black focus:outline-none"
            onChange={(e) => {
              e.target.value = e.target.value.replace(/\D/g, "").slice(0, 3);
            }}
          />
          {errors.cvv && <p className="mt-2 text-sm text-red-500">{errors.cvv.message}</p>}
        </div>
      </div>

      {/* 결제 금액 */}
      <div className="mb-8 rounded-lg bg-gray-100 p-4">
        <div className="flex items-center justify-between">
          <span className="font-bold text-gray-600">결제 금액</span>
          <span className="text-3xl font-extrabold text-black">{price.toLocaleString()}원</span>
        </div>
      </div>

      {/* 결제 버튼 */}
      <button
        type="submit"
        disabled={isLoading}
        className="mb-3 w-full rounded-lg bg-black py-4 text-lg font-bold text-white hover:bg-gray-800 disabled:opacity-50"
      >
        {isLoading ? "결제 중..." : "결제하기"}
      </button>

      <button
        type="button"
        onClick={onBack}
        disabled={isLoading}
        className="w-full rounded-lg bg-gray-200 py-3 font-bold text-gray-700 hover:bg-gray-300 disabled:opacity-50"
      >
        뒤로가기
      </button>
    </form>
  );
}
