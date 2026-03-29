"use client";

import { usePayment } from "@/lib/api/usePayment";
import { PaymentResponse } from "@/types/payment";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import PaymentLoading from "./PaymentLoading";

const bankTransferSchema = z.object({
  bankName: z.string().min(1, "은행을 선택해주세요"),
});

type BankTransferFormType = z.infer<typeof bankTransferSchema>;

const BANKS = ["신한은행", "국민은행", "우리은행", "KB국민은행", "NH농협은행", "IBK기업은행"];

interface BankTransferFormProps {
  orderId: string;
  price: number;
  onBack: () => void;
  onSuccess: (payment: PaymentResponse) => Promise<void>;
}

export default function BankTransferForm({ orderId, price, onBack, onSuccess }: BankTransferFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<BankTransferFormType>({
    resolver: zodResolver(bankTransferSchema),
  });

  const paymentMutation = usePayment();
  const [isLoading, setIsLoading] = useState(false);
  const selectedBank = watch("bankName");

  const onSubmit = async (data: BankTransferFormType) => {
    setIsLoading(true);
    try {
      const payment = await paymentMutation.mutateAsync({
        orderId,
        price,
        paymentMethod: "BANK_TRANSFER",
        bankName: data.bankName,
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
      <h2 className="mb-8 text-3xl font-bold">계좌이체</h2>

      {/* 통장 미리보기 */}
      <div className="mb-8 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 p-8 text-white shadow-2xl">
        <div className="mb-12 text-sm font-semibold opacity-75">🏦 {selectedBank || "은행 선택"}</div>

        <div className="mb-8">
          <div className="mb-2 text-xs opacity-75">계좌번호</div>
          <div className="text-2xl font-bold tracking-widest">1234-5678-9012</div>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <div className="mb-2 text-xs opacity-75">예금주</div>
            <div className="text-lg font-semibold">CODIIT</div>
          </div>
          <div className="text-right">
            <div className="mb-2 text-xs opacity-75">계좌 종류</div>
            <div className="text-lg font-semibold">일반 계좌</div>
          </div>
        </div>
      </div>

      {/* 은행 선택 */}
      <div className="mb-8">
        <label className="mb-3 block text-lg font-bold">은행 선택</label>
        <select
          {...register("bankName")}
          className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-lg focus:border-black focus:outline-none"
        >
          <option value="">은행을 선택해주세요</option>
          {BANKS.map((bank) => (
            <option
              key={bank}
              value={bank}
            >
              {bank}
            </option>
          ))}
        </select>
        {errors.bankName && <p className="mt-2 text-sm text-red-500">{errors.bankName.message}</p>}
      </div>

      {/* 결제 정보 */}
      <div className="mb-8 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="mb-2 text-sm font-semibold text-blue-800">ℹ️ 결제 안내</div>
        <div className="space-y-1 text-xs text-blue-700">
          <div>• 선택하신 은행으로 계좌이체 해주세요</div>
          <div>• 입금 확인 후 자동으로 결제가 완료됩니다</div>
          <div>• 일반적으로 1-2시간 소요됩니다</div>
        </div>
      </div>

      {/* 예금주 정보 */}
      <div className="mb-8 space-y-2 rounded-lg bg-gray-100 p-4">
        <div className="text-sm font-bold text-gray-700">계좌 정보</div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">은행</span>
          <span className="font-bold">{selectedBank || "-"}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">계좌번호</span>
          <span className="font-bold">1234-5678-9012</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">예금주</span>
          <span className="font-bold">CODIIT</span>
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
        disabled={isLoading || !selectedBank}
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
