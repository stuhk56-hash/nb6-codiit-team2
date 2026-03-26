"use client";

import { PaymentResponse } from "@/types/payment";
import { useState } from "react";
import BankTransferForm from "./BankTransferForm";
import CreditCardForm from "./CreditCardForm";
import MobilePhoneForm from "./MobilePhoneForm";

interface PaymentModalProps {
  orderId: string;
  price: number;
  onClose: () => void;
  onSuccess: (payment: PaymentResponse) => Promise<void>;
}

export default function PaymentModal({ orderId, price, onClose, onSuccess }: PaymentModalProps) {
  const [step, setStep] = useState<"method" | "detail">("method");
  const [selectedMethod, setSelectedMethod] = useState<string>("");

  const handleMethodSelect = (method: string) => {
    setSelectedMethod(method);
    setStep("detail");
  };

  const handleBack = () => {
    setStep("method");
    setSelectedMethod("");
  };

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="w-full max-w-md rounded-lg bg-white p-8">
        {step === "method" ? (
          <>
            <h2 className="mb-6 text-2xl font-bold">결제 수단 선택</h2>
            <div className="space-y-4">
              <button
                onClick={() => handleMethodSelect("CREDIT_CARD")}
                className="w-full rounded-lg border-2 border-gray-300 py-4 text-lg font-bold hover:border-black hover:bg-gray-50"
              >
                💳 신용카드
              </button>
              <button
                onClick={() => handleMethodSelect("BANK_TRANSFER")}
                className="w-full rounded-lg border-2 border-gray-300 py-4 text-lg font-bold hover:border-black hover:bg-gray-50"
              >
                🏦 계좌이체
              </button>
              <button
                onClick={() => handleMethodSelect("MOBILE_PHONE")}
                className="w-full rounded-lg border-2 border-gray-300 py-4 text-lg font-bold hover:border-black hover:bg-gray-50"
              >
                📱 휴대폰
              </button>
            </div>
            <button
              onClick={onClose}
              className="mt-6 w-full rounded-lg bg-gray-200 py-3 font-bold"
            >
              취소
            </button>
          </>
        ) : selectedMethod === "CREDIT_CARD" ? (
          <CreditCardForm
            orderId={orderId}
            price={price}
            onBack={handleBack}
            onSuccess={onSuccess}
          />
        ) : selectedMethod === "BANK_TRANSFER" ? (
          <BankTransferForm
            orderId={orderId}
            price={price}
            onBack={handleBack}
            onSuccess={onSuccess}
          />
        ) : selectedMethod === "MOBILE_PHONE" ? (
          <MobilePhoneForm
            orderId={orderId}
            price={price}
            onBack={handleBack}
            onSuccess={onSuccess}
          />
        ) : null}
      </div>
    </div>
  );
}
