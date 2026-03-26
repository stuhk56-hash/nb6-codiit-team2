"use client";

import { usePayment } from "@/lib/api/usePayment";
import { PaymentResponse } from "@/types/payment";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
// ✅ Controller 추가
import { z } from "zod";
import PaymentLoading from "./PaymentLoading";

const mobilePhoneSchema = z.object({
  phoneNumber: z.string().regex(/^\d{3}-\d{4}-\d{4}$/, "형식: 010-1234-5678"),
  carrier: z.string().min(1, "통신사를 선택해주세요"),
});

type MobilePhoneFormType = z.infer<typeof mobilePhoneSchema>;

const CARRIERS = [
  { id: "skt", name: "SKT", color: "from-red-500 to-red-600", logo: "🔴" },
  { id: "kt", name: "KT", color: "from-yellow-500 to-yellow-600", logo: "🟡" },
  { id: "lg", name: "LG U+", color: "from-orange-500 to-orange-600", logo: "🟠" },
];

interface MobilePhoneFormProps {
  orderId: string;
  price: number;
  onBack: () => void;
  onSuccess: (payment: PaymentResponse) => Promise<void>;
}

export default function MobilePhoneForm({ orderId, price, onBack, onSuccess }: MobilePhoneFormProps) {
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<MobilePhoneFormType>({
    resolver: zodResolver(mobilePhoneSchema),
    defaultValues: {
      phoneNumber: "", // ✅ 기본값 빈 문자열
      carrier: "skt",
    },
  });

  const paymentMutation = usePayment();
  const [isLoading, setIsLoading] = useState(false);
  const selectedCarrier = watch("carrier");
  const phoneNumber = watch("phoneNumber"); // ✅ watch로 실시간 감지

  const selectedCarrierInfo = CARRIERS.find((c) => c.id === selectedCarrier);

  const onSubmit = async (data: MobilePhoneFormType) => {
    setIsLoading(true);
    try {
      const payment = await paymentMutation.mutateAsync({
        orderId,
        price,
        paymentMethod: "MOBILE_PHONE",
        phoneNumber: data.phoneNumber.replace(/-/g, ""),
      });

      setTimeout(() => {
        onSuccess(payment);
      }, 3000);
    } catch (error) {
      setIsLoading(false);
      alert("❌ 결제에 실패했습니다");
    }
  };

  if (isLoading) {
    return <PaymentLoading />;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h2 className="mb-8 text-3xl font-bold">휴대폰 결제</h2>

      {/* ✅ 휴대폰 미리보기 카드 */}
      <div className={`mb-8 rounded-2xl bg-gradient-to-br ${selectedCarrierInfo?.color} p-8 text-white shadow-2xl`}>
        <div className="mb-12 flex items-center justify-between">
          <div className="text-4xl">{selectedCarrierInfo?.logo}</div>
          <div className="text-2xl font-bold">{selectedCarrierInfo?.name}</div>
        </div>

        {/* ✅ 실시간으로 반영되는 전화번호 */}
        <div className="mb-8 text-center">
          <div className="text-4xl font-bold tracking-wider">{phoneNumber || "010-0000-0000"}</div>
        </div>

        <div className="text-sm opacity-75">결제용 휴대폰</div>
      </div>

      {/* 통신사 선택 */}
      <div className="mb-8">
        <label className="mb-4 block text-lg font-bold">통신사 선택</label>
        <div className="grid grid-cols-3 gap-4">
          {CARRIERS.map((carrier) => (
            <label
              key={carrier.id}
              className="relative cursor-pointer"
            >
              <Controller
                name="carrier"
                control={control}
                render={({ field }) => (
                  <input
                    type="radio"
                    {...field}
                    value={carrier.id}
                    className="sr-only"
                  />
                )}
              />
              <div
                className={`rounded-lg p-4 text-center transition-all ${
                  selectedCarrier === carrier.id
                    ? "scale-105 ring-2 ring-black ring-offset-2"
                    : "border-2 border-gray-300 hover:border-gray-400"
                }`}
              >
                <div className="mb-2 text-3xl">{carrier.logo}</div>
                <div className="text-sm font-bold">{carrier.name}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* ✅ 휴대폰번호 입력 - Controller 사용으로 실시간 동기화 */}
      <div className="mb-8">
        <label className="mb-2 block font-bold">휴대폰번호</label>
        <Controller
          name="phoneNumber"
          control={control}
          render={({ field: { value, onChange } }) => (
            <input
              type="text"
              value={value}
              placeholder="010-1234-5678"
              maxLength={13}
              className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 font-mono text-lg tracking-wider transition-all focus:border-black focus:outline-none"
              onChange={(e) => {
                let inputValue = e.target.value.replace(/\D/g, "");
                if (inputValue.length > 11) inputValue = inputValue.slice(0, 11);
                const formatted = inputValue.replace(/^(\d{3})(\d{4})(\d{4})$/, "$1-$2-$3");
                onChange(formatted); // ✅ watch와 동기화
                e.target.value = formatted;
              }}
            />
          )}
        />
        {errors.phoneNumber && <p className="mt-2 text-sm text-red-500">{errors.phoneNumber.message}</p>}
      </div>

      {/* 결제 정보 */}
      <div className="mb-8 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="mb-2 text-sm font-semibold text-blue-800">ℹ️ 결제 안내</div>
        <div className="space-y-1 text-xs text-blue-700">
          <div>• 본인 명의 휴대폰으로만 결제 가능합니다</div>
          <div>• 결제 후 본인 인증이 필요할 수 있습니다</div>
          <div>• 요금제에 따라 한도가 제한될 수 있습니다</div>
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
