"use client";

import Modal from "@/components/Modal";
import Button from "@/components/button/Button";
import Divder from "@/components/divider/Divder";
import OptionSelect from "@/components/select/OptionSelect";
import { getCart, patchCart, postCart } from "@/lib/api/cart";
import { useToaster } from "@/proviers/toaster/toaster.hook";
import { useOrderStore } from "@/store/orderStore";
import { useUserStore } from "@/stores/userStore";
import { ProductInfoData } from "@/types/Product";
import { CartEdit, CartEditSize } from "@/types/cart";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ProductContent from "./ProductContent";
import ProductOptions from "./ProductOptions";
import Stars from "./Stars";

interface ProductInfoProps {
  productId: string;
  data: ProductInfoData;
}

const ProductInfo = ({ productId, data }: ProductInfoProps) => {
  const [options, setOptions] = useState<CartEditSize[]>([]);
  const { user } = useUserStore();
  const [image, setImage] = useState<string>(data.image);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNoticeOpen, setIsNoticeOpen] = useState(false);
  const [isSellerOpen, setIsSellerOpen] = useState(false);
  const [isShippingOpen, setIsShippingOpen] = useState(false);

  const queryClient = useQueryClient();
  const setSelectedItems = useOrderStore((state) => state.setSelectedItems);
  const router = useRouter();
  const toaster = useToaster();
  const INVALID_DISPLAY_TEXTS = new Set(["?", "-", "n/a", "na", "none", "null", "undefined"]);
  const displayText = (value: string | null | undefined) => {
    if (!value) return "미제공";
    const normalized = value.trim();
    if (!normalized) return "미제공";
    if (INVALID_DISPLAY_TEXTS.has(normalized.toLowerCase())) return "미제공";
    return normalized;
  };
  const displayManufactureDate = (value: string | null | undefined) => {
    const text = displayText(value);
    if (text === "미제공") return text;
    if (!/^\d{4}(?:[-/.])\d{1,2}(?:[-/.])\d{1,2}$/.test(text)) return "미제공";
    return text;
  };
  const displayPrice = (value: number | null | undefined) =>
    typeof value === "number" ? `${value.toLocaleString()}원` : "미제공";
  const formatPhoneNumber = (value: string | null | undefined) => {
    const text = displayText(value);
    if (text === "미제공") return text;

    const digits = text.replace(/\D/g, "");
    if (!digits) return text;
    if (digits.length === 8) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
    if (digits.length === 9) return `${digits.slice(0, 2)}-${digits.slice(2, 5)}-${digits.slice(5)}`;
    if (digits.length === 10) {
      if (digits.startsWith("02")) {
        return `02-${digits.slice(2, 6)}-${digits.slice(6)}`;
      }
      return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    if (digits.length === 11) {
      return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
    }
    return text;
  };
  const formatBusinessRegistrationNumber = (value: string | null | undefined) => {
    const text = displayText(value);
    if (text === "미제공") return text;

    const digits = text.replace(/\D/g, "");
    if (digits.length === 10) {
      return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
    }
    return text;
  };
  const noticeRows = [
    ["제품 소재", displayText(data.noticeInfo.material)],
    ["색상", displayText(data.noticeInfo.color)],
    ["치수", "상세 페이지 참조"],
    ["제조자", displayText(data.noticeInfo.manufacturerName)],
    ["제조국", displayText(data.noticeInfo.manufactureCountry)],
    ["세탁방법 및 취급시 주의사항", displayText(data.noticeInfo.caution)],
    ["제조연월", displayManufactureDate(data.noticeInfo.manufactureDate)],
    ["품질보증기준", displayText(data.noticeInfo.qualityGuaranteeStandard)],
    [
      "A/S 책임자와 전화번호",
      `${displayText(data.noticeInfo.asManagerName)} / ${displayText(
        data.noticeInfo.asPhoneNumber
      )}`,
    ],
  ];
  const sellerInfoRows = [
    ["상호명", data.storeName],
    ["대표자", displayText(data.sellerInfo.representativeName)],
    ["사업자등록번호", formatBusinessRegistrationNumber(data.sellerInfo.businessRegistrationNumber)],
    ["사업자 연락처", formatPhoneNumber(data.sellerInfo.businessPhoneNumber)],
    ["통신판매업 신고번호", displayText(data.sellerInfo.mailOrderSalesNumber)],
    ["사업장 소재지", displayText(data.sellerInfo.businessAddress)],
  ];
  const shippingTradeRows = [
    ["배송비", displayPrice(data.tradeInfo.shippingFee)],
    ["추가 배송비", displayPrice(data.tradeInfo.extraShippingFee)],
    ["배송사", displayText(data.tradeInfo.shippingCompany)],
    ["배송기간", displayText(data.tradeInfo.deliveryPeriod)],
    ["반품 배송비", displayPrice(data.tradeInfo.returnShippingFee)],
    ["교환 배송비", displayPrice(data.tradeInfo.exchangeShippingFee)],
    ["반품/교환/환불", displayText(data.tradeInfo.returnExchangePolicy)],
  ];
  const sizeGuideColumns =
    data.sizeGuideType === "TOP"
      ? ([
          ["totalLengthCm", "총장"],
          ["shoulderCm", "어깨너비"],
          ["chestCm", "가슴단면"],
          ["sleeveCm", "소매길이"],
        ] as const)
      : data.sizeGuideType === "BOTTOM"
      ? ([
          ["totalLengthCm", "총장"],
          ["waistCm", "허리단면"],
          ["hipCm", "엉덩이단면"],
          ["thighCm", "허벅지단면"],
          ["riseCm", "밑위"],
          ["hemCm", "밑단단면"],
        ] as const)
      : ([
          ["totalLengthCm", "발길이(mm)"],
        ] as const);
  const isShoesGuide = data.sizeGuideType === "SHOES";
  const stockSizeLabels = Array.from(
    new Set(
      data.stocks
        .map((stock) => stock.size.name?.trim().toUpperCase())
      .filter((label): label is string => Boolean(label))
    )
  );
  const shoeSizeLabels = [...stockSizeLabels].sort((a, b) => {
    const aNumber = Number(a);
    const bNumber = Number(b);
    if (Number.isFinite(aNumber) && Number.isFinite(bNumber)) return aNumber - bNumber;
    return a.localeCompare(b);
  });
  const sizeSpecMap = new Map(
    data.sizeSpecs.map((spec) => [spec.sizeLabel.trim().toUpperCase(), spec] as const)
  );
  const sizeGuideRows = stockSizeLabels.map((sizeLabel, index) => {
    const existing = sizeSpecMap.get(sizeLabel);
    if (existing) return existing;

    return {
      sizeLabel,
      displayOrder: index,
      totalLengthCm: null,
      shoulderCm: null,
      chestCm: null,
      sleeveCm: null,
      waistCm: null,
      hipCm: null,
      thighCm: null,
      riseCm: null,
      hemCm: null,
    };
  });
  const hasSizeGuide =
    data.sizeGuideType !== "NONE" &&
    (isShoesGuide ? shoeSizeLabels.length > 0 : sizeGuideRows.length > 0);

  const { data: cartData, refetch: refetchCartData } = useQuery({
    queryKey: ["cartData"],
    queryFn: () => getCart(),
    enabled: user !== null,
    select: (data): CartEditSize[] => {
      return data.items
        .filter((i) => {
          return i.productId === productId;
        })
        .map((i) => {
          return { sizeId: i.sizeId, quantity: i.quantity };
        });
    },
  });

  const { mutate: editCart, isPending } = useMutation({
    mutationFn: (body: CartEdit) => patchCart(body),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      setSelectedItems(
        response.map((item) => {
          return { ...item, product: data as ProductInfoData };
        })
      );
      setOptions([]);
    },
    onError: (error) => {
      toaster("warn", error.message);
    },
  });

  // 상품 선택 개수
  const totalCount = options.map((option) => option.quantity).reduce((acc, cur) => acc + cur, 0);

  // 옵션 추가 함수
  const handleSelect = (value: number) => {
    if (options.map((option) => option.sizeId).includes(value)) {
      toaster("warn", "이미 선택한 옵션입니다.");
      return;
    }
    setOptions((prev) => [...prev, { sizeId: value, quantity: 1 }]);
  };

  const setModalOpen = () => {
    setIsModalOpen(true);
  };

  // 장바구니 담기
  // 카트 생성이 안되있을경우 카트 수정이 불가능 하여 카트 생성 후 카트에 상품 담도록 설정
  const addCart = async () => {
    if (options.length === 0) {
      toaster("warn", "옵션을 선택해 주세요.");
      return;
    }
    // 로그인 확인
    if (!user) {
      toaster("warn", "로그인이 필요합니다.");
      return;
    }
    // 셀러일 경우 바이어 로그인 요청
    if (user.type === "SELLER") {
      toaster("warn", "바이어로 로그인해 주세요.");
      return;
    }

    await postCart(); // 카트 생성

    // 카트에 있는 상품 갯수와 추가로 담을 상품 갯수 합치기
    const grouped: { [key: number]: CartEditSize } = {};

    if (cartData !== undefined) {
      [options, cartData].forEach((arr) => {
        arr.forEach(({ sizeId, quantity }) => {
          grouped[sizeId] = { sizeId, quantity: (grouped[sizeId]?.quantity || 0) + quantity };
        });
      });
    }

    editCart({ productId, sizes: Object.values(grouped) });
    refetchCartData();
    setModalOpen();
  };

  // 구매하기
  const orderProduct = async () => {
    if (options.length === 0) {
      toaster("warn", "옵션을 선택해 주세요.");
      return;
    }
    // 로그인 확인
    if (!user) {
      toaster("warn", "로그인이 필요합니다.");
      return;
    }
    // 셀러일 경우 바이어 로그인 요청
    if (user.type === "SELLER") {
      toaster("warn", "바이어로 로그인해 주세요.");
      return;
    }

    await postCart(); // 카트 생성
    editCart({ productId, sizes: options });

    router.push("/buyer/order");
  };

  return (
    <>
      <div className="flex items-start justify-between">
        <div className="relative size-182.5">
          {data.image && (
            <Image
              className="rounded-xl object-cover"
              src={image}
              alt="image"
              priority
              fill
              unoptimized
              onError={() => setImage("/icon/image_fail.svg")}
            />
          )}
        </div>
        <div className="w-182.5">
          <Link
            className="text-gray01 mb-2.5 flex w-fit items-center gap-2.5 text-lg leading-none"
            href={`/stores/${data.storeId}`}
          >
            {data.storeName}
            <Image
              src="/icon/arrowRight.svg"
              alt="icon"
              width={22}
              height={22}
            />
          </Link>
          <h2 className="mb-5 text-[1.75rem] leading-10.5 font-bold">{data.name}</h2>
          <div className="mb-7.5 flex items-center gap-2.5">
            <Stars
              rating={data.reviewsRating}
              size="medium"
            />
            <p className="leading-none underline decoration-1">리뷰 {data.reviewsCount}개</p>
          </div>
          <Divder className="my-7.5" />
          <div className="text-gray01 text-lg">
            <div className="flex">
              <p>판매가</p>
              <p className="text-black01 ml-22.5 font-extrabold">{Math.floor(data.price * (1 - data.discountRate / 100)).toLocaleString()}원</p>
              {data.discountRate !== 0 && (
                <p className="ml-2 font-bold line-through">{data.price.toLocaleString()}원</p>
              )}
            </div>
            <OptionSelect
              options={data.stocks}
              onSelect={handleSelect}
            >
              <div className="my-5 flex cursor-pointer justify-between py-5">
                <p>사이즈</p>
                <Image
                  src="/icon/arrowBottom.svg"
                  alt="icon"
                  width={24}
                  height={24}
                />
              </div>
            </OptionSelect>
          </div>
          <Divder className="mb-7.5" />
          <div className="min-h-36.25 space-y-2.5">
            {options.map((option) => (
              <ProductOptions
                key={option.sizeId}
                price={Math.floor(data.discountPrice)}
                option={option}
                setOptions={setOptions}
                stock={data.stocks}
              />
            ))}
          </div>
          <Divder className="my-7.5" />
          <div>
            <div className="my-7.5 flex items-center justify-between">
              <p className="text-black01 text-lg leading-none font-extrabold">총 주문 금액</p>
              <p className="text-black01 text-4xl leading-10.5 font-extrabold">
                {(data.discountPrice !== undefined && Math.floor(data.discountPrice) * totalCount).toLocaleString()}원
              </p>
            </div>
            <div className="flex justify-between gap-5">
              <Button
                className="h-21.25 w-88.75"
                variant="secondary"
                label="장바구니 담기"
                size="large"
                color="white"
                onClick={addCart}
                disabled={isPending}
              />
              <Button
                className="h-21.25 w-88.75"
                label="구매하기"
                size="large"
                variant="secondary"
                onClick={orderProduct}
                disabled={isPending}
              />
            </div>
          </div>
        </div>
      </div>
      <Divder className="my-20" />
      <h2 className="text-black01 text-[1.75rem] leading-none font-extrabold">상품 상세 정보</h2>
      <div className="mt-10">
        <ProductContent content={data.content} />
      </div>
      <div className="mt-10 space-y-10">
        <div>
          <h3 className="mb-4 text-2xl leading-none font-extrabold">사이즈 정보</h3>
          {hasSizeGuide ? (
            <div>
              <p className="mb-3 text-sm text-gray-600">
                {isShoesGuide
                  ? "단위: mm | 브랜드/모델/측정 방식에 따라 착화감이 달라질 수 있습니다."
                  : "단위: cm | 측정 방식에 따라 1~3cm 오차가 발생할 수 있습니다."}
              </p>
              <div
                id="size-guide-section"
                className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm"
              >
              {isShoesGuide ? (
                <table className="w-full min-w-[320px] border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-200 px-3 py-2 text-left">신발 사이즈(mm)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shoeSizeLabels.map((sizeLabel) => (
                      <tr key={sizeLabel}>
                        <td className="border border-gray-200 px-3 py-2 font-semibold">{sizeLabel}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
              <table className="w-full min-w-[760px] border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 px-3 py-2 text-left">cm</th>
                    {sizeGuideColumns.map(([key, label]) => (
                      <th
                        key={key}
                        className="border border-gray-200 px-3 py-2 text-left"
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sizeGuideRows.map((row) => (
                    <tr key={row.sizeLabel}>
                      <td className="border border-gray-200 px-3 py-2 font-semibold">
                        {row.sizeLabel}
                      </td>
                      {sizeGuideColumns.map(([key]) => (
                        <td
                          key={`${row.sizeLabel}-${key}`}
                          className="border border-gray-200 px-3 py-2"
                        >
                          {typeof row[key] === "number" ? row[key] : "-"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              )}
              </div>
            </div>
          ) : (
            <div
              id="size-guide-section"
              className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600"
            >
              등록된 사이즈 정보가 없습니다.
            </div>
          )}
        </div>
        <div>
          <button
            type="button"
            className="mb-4 flex w-full items-center justify-between rounded-lg px-2 py-3 text-left"
            onClick={() => setIsNoticeOpen((prev) => !prev)}
            aria-expanded={isNoticeOpen}
            aria-controls="product-notice-section"
          >
            <h3 className="text-2xl leading-none font-extrabold">상품정보</h3>
            <Image
              src="/icon/arrowBottom.svg"
              alt="toggle"
              width={22}
              height={22}
              className={`transition-transform ${isNoticeOpen ? "rotate-180" : "rotate-0"}`}
            />
          </button>
          {isNoticeOpen && (
            <>
              <div
                id="product-notice-section"
                className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
              >
                {noticeRows.map(([label, value]) => (
                  <div
                    key={label}
                    className="grid grid-cols-[220px_1fr] border-b border-gray-100 last:border-b-0"
                  >
                    <div className="bg-gray-50 px-4 py-2 text-[15px] leading-6 font-semibold break-keep text-gray-700">{label}</div>
                    <div className="px-4 py-2 text-[15px] leading-6 text-gray-900 break-keep">{value}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        <div>
          <button
            type="button"
            className="mb-4 flex w-full items-center justify-between rounded-lg px-2 py-3 text-left"
            onClick={() => setIsSellerOpen((prev) => !prev)}
            aria-expanded={isSellerOpen}
            aria-controls="seller-info-section"
          >
            <h3 className="text-2xl leading-none font-extrabold">판매자정보</h3>
            <Image
              src="/icon/arrowBottom.svg"
              alt="toggle"
              width={22}
              height={22}
              className={`transition-transform ${isSellerOpen ? "rotate-180" : "rotate-0"}`}
            />
          </button>
          {isSellerOpen && (
            <div
              id="seller-info-section"
              className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
            >
              {sellerInfoRows.map(([label, value]) => (
                <div
                  key={label}
                  className="grid grid-cols-[220px_1fr] border-b border-gray-100 last:border-b-0"
                >
                  <div className="bg-gray-50 px-4 py-2 text-[15px] leading-6 font-semibold break-keep text-gray-700">{label}</div>
                  <div className="px-4 py-2 text-[15px] leading-6 text-gray-900 break-keep">{value}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <button
            type="button"
            className="mb-4 flex w-full items-center justify-between rounded-lg px-2 py-3 text-left"
            onClick={() => setIsShippingOpen((prev) => !prev)}
            aria-expanded={isShippingOpen}
            aria-controls="shipping-trade-section"
          >
            <h3 className="text-2xl leading-none font-extrabold">배송/교환/반품 안내</h3>
            <Image
              src="/icon/arrowBottom.svg"
              alt="toggle"
              width={22}
              height={22}
              className={`transition-transform ${isShippingOpen ? "rotate-180" : "rotate-0"}`}
            />
          </button>
          {isShippingOpen && (
            <div
              id="shipping-trade-section"
              className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
            >
              {shippingTradeRows.map(([label, value]) => (
                <div
                  key={label}
                  className="grid grid-cols-[220px_1fr] border-b border-gray-100 last:border-b-0"
                >
                  <div className="bg-gray-50 px-4 py-2 text-[15px] leading-6 font-semibold break-keep text-gray-700">{label}</div>
                  <div className="px-4 py-2 text-[15px] leading-6 text-gray-900 break-keep">{value}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        >
          <div className="flex h-fit w-130 flex-col gap-10">
            <div className="space-y-2 text-xl">
              <p className="">상품이 담겼습니다.</p>
              <p>장바구니로 이동하시겠습니까?</p>
            </div>
            <div className="flex gap-5">
              <Button
                className="h-15 w-full"
                variant="secondary"
                label="취소"
                size="large"
                color="white"
                onClick={() => setIsModalOpen(false)}
              />
              <Button
                className="h-15 w-full"
                label="이동하기"
                size="large"
                variant="secondary"
                onClick={() => router.push("/buyer/shopping")}
              />
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default ProductInfo;
