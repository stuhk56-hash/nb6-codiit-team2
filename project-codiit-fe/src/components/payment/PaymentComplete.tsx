"use client";

import { PaymentResponse } from "@/types/payment";
import Link from "next/link";

interface PaymentCompleteProps {
  payment: PaymentResponse;
}

export default function PaymentComplete({ payment }: PaymentCompleteProps) {
  return (
    <div className="mx-auto max-w-2xl py-12 text-center">
      <div className="mb-8">
        <div className="text-6xl">✅</div>
      </div>

      <h1 className="mb-4 text-3xl font-bold">결제가 완료되었습니다!</h1>

      <div className="mb-8 rounded-lg bg-gray-100 p-6">
        <div className="mb-4 flex justify-between">
          <span>거래번호</span>
          <span className="font-bold">{payment.transactionId || "N/A"}</span>
        </div>
        <div className="mb-4 flex justify-between">
          <span>결제액</span>
          <span className="font-bold">{payment.price.toLocaleString()}원</span>
        </div>
        <div className="mb-4 flex justify-between">
          <span>결제 수단</span>
          <span className="font-bold">{payment.paymentMethodLabel}</span>
        </div>
        <div className="flex justify-between">
          <span>상태</span>
          <span className="font-bold text-green-600">{payment.statusLabel}</span>
        </div>
      </div>

      <div className="flex gap-4">
        <Link
          href="/buyer/mypage"
          className="flex-1 rounded-lg bg-black py-4 font-bold text-white"
        >
          주문목록으로
        </Link>
        <Link
          href="/products"
          className="flex-1 rounded-lg border-2 border-black py-4 font-bold"
        >
          계속 쇼핑하기
        </Link>
      </div>
    </div>
  );
}
