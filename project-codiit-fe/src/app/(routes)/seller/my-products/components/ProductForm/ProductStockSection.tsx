"use client";

import { ProductFormValues } from "@/lib/schemas/productForm.schema";
import Image from "next/image";
import { useEffect, useMemo } from "react";
import { Control, FieldErrors, useController } from "react-hook-form";

const APPAREL_SIZES = ["FREE", "XS", "S", "M", "L", "XL"];
const SHOES_SIZES = ["230", "235", "240", "245", "250", "255", "260", "265", "270", "275", "280", "285", "290"];

export function ProductStockSection({
  control,
  errors,
}: {
  control: Control<ProductFormValues>;
  errors: FieldErrors<ProductFormValues>;
}) {
  const { field: sizesField } = useController({ name: "sizes", control });
  const { field: stocksField } = useController({ name: "stocks", control });
  const { field: categoryField } = useController({ name: "category", control });

  const selectedSizes: string[] = sizesField.value || [];
  const stocks: Record<string, number | undefined> = stocksField.value || {};
  const isShoesCategory = String(categoryField.value || "").toUpperCase() === "SHOES";
  const availableSizes = useMemo(
    () => (isShoesCategory ? SHOES_SIZES : APPAREL_SIZES),
    [isShoesCategory]
  );

  useEffect(() => {
    const allowed = new Set(availableSizes);
    const normalizedSizes = selectedSizes.filter((size) => allowed.has(size));
    const normalizedStocks = Object.fromEntries(
      Object.entries(stocks).filter(([size]) => allowed.has(size))
    );

    if (JSON.stringify(selectedSizes) !== JSON.stringify(normalizedSizes)) {
      sizesField.onChange(normalizedSizes);
    }
    if (JSON.stringify(stocks) !== JSON.stringify(normalizedStocks)) {
      stocksField.onChange(normalizedStocks);
    }
  }, [availableSizes, selectedSizes, stocks, sizesField, stocksField]);

  const toggleSize = (size: string) => {
    let newSizes: string[];
    const isFree = size === "FREE";

    if (selectedSizes.includes(size)) {
      newSizes = selectedSizes.filter((s) => s !== size);
      const newStocks = { ...stocks };
      delete newStocks[size];
      stocksField.onChange(newStocks);
    } else {
      if (!isShoesCategory && isFree) {
        newSizes = ["FREE"];
        stocksField.onChange({ FREE: stocks.FREE });
      } else {
        newSizes = !isShoesCategory
          ? [...selectedSizes.filter((s) => s !== "FREE"), size]
          : [...selectedSizes, size];
        const nextStocks = { ...stocks, [size]: undefined };
        if (!isShoesCategory) {
          delete nextStocks.FREE;
        }
        stocksField.onChange(nextStocks);
      }
    }
    sizesField.onChange(newSizes);
  };

  const onStockChange = (size: string, value: string) => {
    // 수량 입력 하지 않은 경우
    if (value === "") {
      const updatedStocks = { ...stocks };
      delete updatedStocks[size];
      stocksField.onChange(updatedStocks);
      return;
    }
    // e.target 숫자 변환
    const num = parseInt(value, 10);
    if (isNaN(num) || num < 0) return;
    stocksField.onChange({ ...stocks, [size]: num });
  };

  // 총 재고수량
  const totalStock = selectedSizes.reduce((acc, size) => acc + (stocks[size] || 0), 0);

  return (
    <section className="mb-[60px]">
      <div className="flex items-center">
        <h3 className="text-xl font-extrabold">옵션 및 재고</h3>
        <p className="text-gray01 ml-5 text-sm">옵션은 적어도 1개 이상 선택, 재고는 0개 이상 입력해주세요</p>
      </div>
      <div className="bg-black01 mt-[10px] h-px w-full" />
      <div className="flex gap-10">
        {/* 왼쪽: 사이즈 버튼 */}
        <div className="flex w-[120px] flex-col gap-[20px]">
          <div className="mt-[30px] font-bold">사이즈</div>
          {availableSizes.map((size) => {
            const isSelected = selectedSizes.includes(size);
            return (
              <button
                key={size}
                type="button"
                onClick={() => toggleSize(size)}
                className={`flex h-[45px] items-center justify-between rounded-xl border bg-white px-5 py-2 font-bold ${
                  isSelected ? "border-black01" : "border-gray03"
                }`}
              >
                <span className="font-bold">{size}</span>
                {isSelected && (
                  <Image
                    src="/icon_check.svg"
                    alt="check"
                    width={28}
                    height={28}
                  />
                )}
              </button>
            );
          })}
        </div>
        {/* 오른쪽: 재고 입력 */}
        <div className="flex flex-col gap-[20px]">
          <div className="mt-[30px]">
            <span className="font-bold">재고</span>
            <span className="text-sm"> (총 재고수량 : {totalStock}) </span>
          </div>
          {availableSizes.map((size) => {
            const isSelected = selectedSizes.includes(size);
            const stockError = errors.stocks && errors.stocks[size]?.message;
            return (
              <div key={size}>
                {isSelected ? (
                  <div className="flex items-center">
                    <input
                      type="number"
                      value={stocks[size] !== undefined ? stocks[size] : ""}
                      onChange={(e) => onStockChange(size, e.target.value)}
                      placeholder="수량 입력"
                      className="border-gray03 placeholder:text-gray02 h-[45px] w-[347px] rounded-md border px-5 py-4 text-left focus:outline-none"
                    />
                    {stockError && <p className="ml-3 text-sm text-red-500">{stockError}</p>}
                  </div>
                ) : (
                  <input
                    value="-"
                    disabled
                    className="border-gray03 text-gray02 h-[45px] w-[347px] cursor-not-allowed rounded-md border px-5 py-4 text-left"
                  ></input>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <p className="mt-3 text-sm text-red-500">{errors.sizes?.message && <>{errors.sizes.message}</>}</p>
    </section>
  );
}
