"use client";

export default function PaymentLoading() {
  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="w-full max-w-sm rounded-2xl bg-white p-12 text-center">
        {/* 로딩 스피너 */}
        <div className="mb-8 flex justify-center">
          <div className="relative h-20 w-20">
            <div className="absolute inset-0 rounded-full border-4 border-gray-200" />
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-black border-r-black" />
          </div>
        </div>

        {/* 텍스트 */}
        <h2 className="mb-2 text-2xl font-bold">결제가 진행중입니다</h2>
        <p className="text-sm text-gray-600">잠시만 기다려주세요...</p>

        {/* 진행 단계 */}
        <div className="mt-8 space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-black" />
            <p className="text-sm text-gray-700">결제 처리 중</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-gray-300" />
            <p className="text-sm text-gray-500">거래 확인 대기</p>
          </div>
        </div>
      </div>
    </div>
  );
}
