"use client";

import { getAxiosInstance } from "@/lib/api/axiosInstance";
import { Shipping, ShippingHistory } from "@/types/order";
import axios from "axios";
import Image from "next/image";
import { useEffect, useState } from "react";

interface ShippingModalProps {
  isOpen: boolean;
  orderId: string;
  buyerName?: string;
  address?: string;
  onClose: () => void;
}

export default function ShippingModal({
  isOpen,
  orderId,
  buyerName = "받는사람",
  address = "주소 정보 없음",
  onClose,
}: ShippingModalProps) {
  const axiosInstance = getAxiosInstance();
  const [shipping, setShipping] = useState<Shipping | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // ✅ 초기 배송 정보 로드
  useEffect(() => {
    if (!isOpen || !orderId) return;

    const fetchShipping = async () => {
      try {
        setLoading(true);
        setError(null);
        setShipping(null);

        const response = await axiosInstance.get(`/shipping/${orderId}`, {
          timeout: 15000,
        });

        if (response.data.success && response.data.data) {
          setShipping(response.data.data);
          setRetryCount(0);
        } else {
          setError(response.data.message || "배송 정보를 찾을 수 없습니다");
        }
      } catch (err) {
        console.error("배송 조회 에러:", err);

        if (axios.isAxiosError(err)) {
          if (err.code === "ECONNABORTED") {
            setError("요청 시간 초과");
          } else if (err.response?.status === 404) {
            setError("배송 정보를 찾을 수 없습니다");
          } else if (err.response?.status === 500) {
            setError("서버 오류가 ���생했습니다");
          } else {
            setError(err.message || "배송 정보를 조회할 수 없습니다");
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchShipping();
  }, [isOpen, orderId, retryCount]); // ✅ retryCount 의존성 추가

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
  };

  // ✅ 수동으로 상태 진행 버튼
  const handleManualProgress = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.post(`/shipping/${orderId}/auto-progress`);

      if (response.data.success && response.data.data) {
        setShipping(response.data.data);
        console.log("✅ 배송 상태 업데이트:", response.data.data.status);
      }
    } catch (err) {
      console.error("상태 진행 에러:", err);
      setError("상태 진행 중 오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getStatusInfo = (status?: string) => {
    const today = new Date();
    const dateStr = `${today.getMonth() + 1}/${today.getDate()}(일)`;

    if (!status) {
      return {
        title: "배송 정보",
        subtitle: "배송 상태를 확인하세요.",
        icon: "📋",
        bgColor: "bg-gray-50",
        borderColor: "border-gray-200",
      };
    }

    switch (status) {
      case "ReadyToShip":
        return {
          title: `${dateStr} 배송준비중`,
          subtitle: "고객님이 주문하신 상품이 배송준비 중입니다.",
          icon: "📦",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
        };
      case "InShipping":
        return {
          title: `${dateStr} 배송출발`,
          subtitle: "고객님이 주문하신 상품이 배송 중입니다.",
          icon: "🚚",
          bgColor: "bg-orange-50",
          borderColor: "border-orange-200",
        };
      case "Delivered":
        return {
          title: `${dateStr} 도착완료`,
          subtitle: "고객님이 주문하신 상품이 배송완료 되었습니다.",
          icon: "✅",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
        };
      default:
        return {
          title: "배송 정보",
          subtitle: "배송 상태를 ���인하세요.",
          icon: "📋",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
        };
    }
  };

  const getCarrierIcon = (carrier?: string) => {
    if (!carrier) return "🚚";
    if (carrier.includes("로켓")) return "🚀";
    if (carrier.includes("CJ")) return "📦";
    if (carrier.includes("우체국")) return "📮";
    if (carrier.includes("한진")) return "🚛";
    return "🚚";
  };

  return (
    <>
      {/* 백그라운드 */}
      <div
        className="bg-opacity-50 fixed inset-0 z-40 bg-black"
        onClick={onClose}
      ></div>

      {/* 모달 컨텐츠 */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="relative w-full max-w-[600px] overflow-hidden rounded-2xl bg-white shadow-xl">
          {/* 닫기 버튼 */}
          <button
            className="absolute top-5 right-5 z-10 transition hover:opacity-70"
            onClick={onClose}
          >
            <Image
              src="/icon/deleteBlack.svg"
              alt="닫기"
              width={28}
              height={28}
            />
          </button>

          {/* 헤더 */}
          <div className="px-8 pt-8 pb-6">
            <h1 className="text-black01 text-2xl font-extrabold">배송 조회</h1>
          </div>

          {/* 로딩 상태 */}
          {loading && (
            <div className="flex justify-center py-16">
              <div className="text-center">
                <div className="mb-4 animate-spin text-4xl">⏳</div>
                <p className="font-medium text-gray-500">배송 정보 조회 중...</p>
              </div>
            </div>
          )}

          {/* 에러 상태 */}
          {error && !loading && (
            <div className="flex flex-col justify-center gap-4 px-8 py-16">
              <p className="text-center font-medium text-red-500">{error}</p>
              <button
                onClick={handleRetry}
                className="rounded-lg bg-black px-6 py-3 font-bold text-white transition hover:bg-gray-800"
              >
                다시 시도
              </button>
            </div>
          )}

          {/* 배송 정보 표시 */}
          {shipping && !loading && (
            <div className="max-h-[70vh] space-y-6 overflow-y-auto px-8 pb-8">
              {/* 배송 상태 헤더 */}
              {(() => {
                const info = getStatusInfo(shipping.status);
                return (
                  <div className={`${info.bgColor} ${info.borderColor} rounded-xl border-2 p-6 text-center`}>
                    <div className="mb-3 text-5xl">{info.icon}</div>
                    <h2 className="text-black01 mb-2 text-2xl font-extrabold">{info.title}</h2>
                    <p className="text-sm text-gray-600">{info.subtitle}</p>
                  </div>
                );
              })()}

              {/* 배송 정보 카드 */}
              <div className="space-y-4 rounded-xl bg-gray-50 p-6">
                <div className="flex items-start gap-4">
                  {/* 배송사 정보 */}
                  <div className="flex-1">
                    <div className="mb-4 flex items-center gap-2">
                      {/* ✅ carrier 타입 체크 추가 */}
                      <span className="text-3xl">{getCarrierIcon(shipping.carrier)}</span>
                      <div>
                        <p className="text-sm text-gray-500">배송업체</p>
                        <p className="text-black01 font-bold">{shipping.carrier || "정보 없음"}</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="mb-1 text-sm text-gray-500">송장번호</p>
                      <p className="text-black01 font-mono text-lg font-bold">
                        {shipping.trackingNumber || "정보 없음"}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">🔗 배송업체 웹사이트에서 확인할 수 있습니다.</p>
                    </div>
                  </div>

                  {/* 받는사람 정보 */}
                  <div className="w-48 rounded-lg border border-gray-200 bg-white p-4">
                    <p className="mb-3 block text-xs font-semibold text-gray-500">📬 받는 정보</p>
                    <div className="space-y-3">
                      <div>
                        <p className="mb-1 text-xs text-gray-400">받는사람</p>
                        <p className="text-black01 text-sm font-bold">{buyerName}</p>
                      </div>
                      <div>
                        <p className="mb-1 text-xs text-gray-400">받는주소</p>
                        <p className="text-black01 text-xs leading-tight break-words">{address}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 배송 타임라인 */}
              <div className="space-y-3">
                <h3 className="text-black01 text-sm font-bold">📊 배송 진행 상황</h3>

                <div className="space-y-2">
                  {shipping.readyToShipAt && (
                    <div className="flex items-start gap-3 rounded-lg bg-blue-50 p-3">
                      <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-500">
                        <span className="text-sm font-bold text-white">1</span>
                      </div>
                      <div>
                        <p className="text-black01 text-sm font-semibold">배송 준비</p>
                        <p className="text-xs text-gray-600">
                          {new Date(shipping.readyToShipAt).toLocaleString("ko-KR", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  )}

                  {shipping.inShippingAt && (
                    <div className="flex items-start gap-3 rounded-lg bg-orange-50 p-3">
                      <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-orange-500">
                        <span className="text-sm font-bold text-white">2</span>
                      </div>
                      <div>
                        <p className="text-black01 text-sm font-semibold">배송 출발</p>
                        <p className="text-xs text-gray-600">
                          {new Date(shipping.inShippingAt).toLocaleString("ko-KR", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  )}

                  {shipping.deliveredAt && (
                    <div className="flex items-start gap-3 rounded-lg bg-green-50 p-3">
                      <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-500">
                        <span className="text-sm font-bold text-white">3</span>
                      </div>
                      <div>
                        <p className="text-black01 text-sm font-semibold">도착 완료</p>
                        <p className="text-xs text-gray-600">
                          {new Date(shipping.deliveredAt).toLocaleString("ko-KR", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ✅ 수동 진행 버튼만 남김 */}
              {shipping.status !== "Delivered" && (
                <button
                  onClick={handleManualProgress}
                  disabled={loading}
                  className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:bg-gray-400"
                >
                  🎮 다음 단계로 진행
                </button>
              )}

              {/* 상세 배송 이력 */}
              {shipping.shippingHistories &&
                Array.isArray(shipping.shippingHistories) &&
                shipping.shippingHistories.length > 0 && (
                  <div className="space-y-3 border-t border-gray-200 pt-4">
                    <h3 className="text-black01 text-sm font-bold">📋 상세 배송 이력</h3>
                    <div className="max-h-[200px] space-y-2 overflow-y-auto">
                      {shipping.shippingHistories.map((history) => (
                        <div
                          key={history.id}
                          className="flex gap-3 rounded-lg bg-gray-50 p-3"
                        >
                          <div className="mt-1 w-1 flex-shrink-0 rounded-full bg-gray-400"></div>
                          <div className="min-w-0 flex-1">
                            <p className="text-black01 text-xs font-semibold">{history.description}</p>
                            {history.location && <p className="mt-1 text-xs text-gray-600">📍 {history.location}</p>}
                            <p className="mt-1 text-xs text-gray-400">
                              {new Date(history.createdAt).toLocaleString("ko-KR")}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
