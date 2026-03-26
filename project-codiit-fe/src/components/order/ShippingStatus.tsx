"use client";

interface ShippingStatusProps {
  status: "ReadyToShip" | "InShipping" | "Delivered";
}

export default function ShippingStatus({ status }: ShippingStatusProps) {
  const steps = [
    { key: "ReadyToShip", label: "배송준비", icon: "📦" },
    { key: "InShipping", label: "배송중", icon: "🚚" },
    { key: "Delivered", label: "배송완료", icon: "✅" },
  ];

  const currentStepIndex = steps.findIndex((step) => step.key === status);

  return (
    <div className="w-full">
      {/* 진행 바 */}
      <div className="mb-6 flex items-center justify-between">
        {steps.map((step, index) => (
          <div
            key={step.key}
            className="flex flex-1 flex-col items-center"
          >
            {/* 원형 상태 표시 */}
            <div
              className={`mb-2 flex h-12 w-12 items-center justify-center rounded-full text-xl font-bold transition-all ${
                index <= currentStepIndex ? "bg-black text-white" : "bg-gray-200 text-gray-400"
              }`}
            >
              {step.icon}
            </div>

            {/* 라벨 */}
            <span className={`text-sm font-bold ${index <= currentStepIndex ? "text-black" : "text-gray-400"}`}>
              {step.label}
            </span>

            {/* 연결선 */}
            {index < steps.length - 1 && (
              <div className="absolute top-6 left-1/2 mt-6 h-1 w-1/3">
                <div className={`h-full transition-all ${index < currentStepIndex ? "bg-black" : "bg-gray-200"}`} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
