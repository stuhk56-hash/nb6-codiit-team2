"use client";

import { uploadImageToS3 } from "@/lib/api/products";
import { ProductFormValues } from "@/lib/schemas/productForm.schema";
import { useToaster } from "@/proviers/toaster/toaster.hook";
import "@/styles/textviewer.css";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { Control, FieldErrors, useController } from "react-hook-form";
import type ReactQuillType from "react-quill-new";
import ReactQuill from "./ReactQuillWrapper";

export function ProductDetailSection({
  control,
  errors,
}: {
  control: Control<ProductFormValues>;
  errors: FieldErrors<ProductFormValues>;
}) {
  type SizeSpecRow = NonNullable<ProductFormValues["sizeSpecs"]>[number];
  const { field: detailField } = useController({
    name: "detail",
    control,
  });
  const { field: materialField } = useController({
    name: "noticeInfo.material",
    control,
  });
  const { field: colorField } = useController({
    name: "noticeInfo.color",
    control,
  });
  const { field: manufacturerNameField } = useController({
    name: "noticeInfo.manufacturerName",
    control,
  });
  const { field: manufactureCountryField } = useController({
    name: "noticeInfo.manufactureCountry",
    control,
  });
  const { field: manufactureDateField } = useController({
    name: "noticeInfo.manufactureDate",
    control,
  });
  const { field: qualityGuaranteeStandardField } = useController({
    name: "noticeInfo.qualityGuaranteeStandard",
    control,
  });
  const { field: asManagerNameField } = useController({
    name: "noticeInfo.asManagerName",
    control,
  });
  const { field: asPhoneNumberField } = useController({
    name: "noticeInfo.asPhoneNumber",
    control,
  });
  const { field: cautionField } = useController({
    name: "noticeInfo.caution",
    control,
  });
  const { field: shippingFeeField } = useController({
    name: "tradeInfo.shippingFee",
    control,
  });
  const { field: extraShippingFeeField } = useController({
    name: "tradeInfo.extraShippingFee",
    control,
  });
  const { field: shippingCompanyField } = useController({
    name: "tradeInfo.shippingCompany",
    control,
  });
  const { field: deliveryPeriodField } = useController({
    name: "tradeInfo.deliveryPeriod",
    control,
  });
  const { field: returnShippingFeeField } = useController({
    name: "tradeInfo.returnShippingFee",
    control,
  });
  const { field: exchangeShippingFeeField } = useController({
    name: "tradeInfo.exchangeShippingFee",
    control,
  });
  const { field: returnExchangePolicyField } = useController({
    name: "tradeInfo.returnExchangePolicy",
    control,
  });
  const { field: sizeSpecsField } = useController({
    name: "sizeSpecs",
    control,
  });
  const { field: sizesField } = useController({
    name: "sizes",
    control,
  });
  const { field: categoryField } = useController({
    name: "category",
    control,
  });
  const toNumberInputValue = (value: unknown) =>
    typeof value === "number" && Number.isFinite(value) ? String(value) : "";
  const parseNullableNumber = (raw: string) => {
    if (raw === "") return null;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const toaster = useToaster();
  const quillRef = useRef<ReactQuillType | null>(null);

  const handleImageUpload = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.click();

    input.onchange = async () => {
      if (!input.files || input.files.length === 0) return;

      const file = input.files[0];
      try {
        const response = await uploadImageToS3(file);
        const imageUrl = response.url;

        const editor = quillRef.current?.getEditor();
        if (!editor) {
          toaster("warn", "에디터가 준비되지 않았습니다.");
          return;
        }

        const range = editor.getSelection(true);
        if (range) {
          editor.insertEmbed(range.index, "image", imageUrl);
          editor.setSelection(range.index + 1);
        }
      } catch {
        toaster("warn", "이미지 업로드 실패");
      }
    };
  }, [toaster]);

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ color: [] }, { background: [] }],
          [{ align: [] }],
          [{ list: "ordered" }, { list: "bullet" }],
          ["blockquote", "code-block"],
          ["link", "image", "video"],
          ["clean"],
        ],
        handlers: {
          image: handleImageUpload,
        },
      },
    }),
    [handleImageUpload]
  );

  const sizeGuideType: "TOP" | "BOTTOM" | "NONE" = useMemo(() => {
    const category = (categoryField.value || "").toString().toUpperCase();
    if (category === "TOP" || category === "OUTER" || category === "DRESS") {
      return "TOP";
    }
    if (category === "BOTTOM" || category === "SKIRT") {
      return "BOTTOM";
    }
    return "NONE";
  }, [categoryField.value]);

  const selectedSizes = useMemo(() => {
    const value = sizesField.value;
    return Array.isArray(value) ? value : [];
  }, [sizesField.value]);

  useEffect(() => {
    const existing = Array.isArray(sizeSpecsField.value) ? sizeSpecsField.value : [];
    const existingMap = new Map(existing.map((spec: SizeSpecRow) => [spec.sizeLabel, spec]));
    const normalized = selectedSizes.map((label: string, index: number) => {
      const prev: Partial<SizeSpecRow> = existingMap.get(label) ?? {};
      return {
        sizeLabel: label,
        displayOrder: index,
        totalLengthCm: prev.totalLengthCm ?? null,
        shoulderCm: prev.shoulderCm ?? null,
        chestCm: prev.chestCm ?? null,
        sleeveCm: prev.sleeveCm ?? null,
        waistCm: prev.waistCm ?? null,
        hipCm: prev.hipCm ?? null,
        thighCm: prev.thighCm ?? null,
        riseCm: prev.riseCm ?? null,
        hemCm: prev.hemCm ?? null,
      };
    });
    if (JSON.stringify(existing) !== JSON.stringify(normalized)) {
      sizeSpecsField.onChange(normalized);
    }
  }, [selectedSizes, sizeSpecsField]);

  const sizeGuideColumns =
    sizeGuideType === "TOP"
      ? ([
          ["totalLengthCm", "총장"],
          ["shoulderCm", "어깨너비"],
          ["chestCm", "가슴단면"],
          ["sleeveCm", "소매길이"],
        ] as const)
      : ([
          ["totalLengthCm", "총장"],
          ["waistCm", "허리단면"],
          ["hipCm", "엉덩이단면"],
          ["thighCm", "허벅지단면"],
          ["riseCm", "밑위"],
          ["hemCm", "밑단단면"],
        ] as const);

  const sizeSpecRows = Array.isArray(sizeSpecsField.value) ? sizeSpecsField.value : [];

  const updateSizeSpecValue = (
    rowIndex: number,
    key:
      | "totalLengthCm"
      | "shoulderCm"
      | "chestCm"
      | "sleeveCm"
      | "waistCm"
      | "hipCm"
      | "thighCm"
      | "riseCm"
      | "hemCm",
    raw: string
  ) => {
    const next = [...sizeSpecRows];
    const parsed = raw === "" ? null : Number(raw);
    next[rowIndex] = {
      ...next[rowIndex],
      [key]: Number.isFinite(parsed) ? parsed : null,
    };
    sizeSpecsField.onChange(next);
  };

  return (
    <section>
      <h3 className="text-xl font-extrabold">상품 상세정보</h3>
      <div className="bg-black01 mt-[10px] h-px w-full" />
      <div className="mt-[30px] flex flex-col gap-[30px]">
        <div className="space-y-4">
          <h4 className="text-lg font-bold">상품정보 고시</h4>
          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder="제품 소재"
              value={materialField.value ?? ""}
              onChange={materialField.onChange}
              className="border-gray03 h-[45px] rounded-md border bg-white px-4"
            />
            <input
              placeholder="색상"
              value={colorField.value ?? ""}
              onChange={colorField.onChange}
              className="border-gray03 h-[45px] rounded-md border bg-white px-4"
            />
            <input
              placeholder="제조자(수입자)"
              value={manufacturerNameField.value ?? ""}
              onChange={manufacturerNameField.onChange}
              className="border-gray03 h-[45px] rounded-md border bg-white px-4"
            />
            <input
              placeholder="제조국"
              value={manufactureCountryField.value ?? ""}
              onChange={manufactureCountryField.onChange}
              className="border-gray03 h-[45px] rounded-md border bg-white px-4"
            />
            <input
              placeholder="제조연월"
              value={manufactureDateField.value ?? ""}
              onChange={manufactureDateField.onChange}
              className="border-gray03 h-[45px] rounded-md border bg-white px-4"
            />
            <input
              placeholder="품질보증기준"
              value={qualityGuaranteeStandardField.value ?? ""}
              onChange={qualityGuaranteeStandardField.onChange}
              className="border-gray03 h-[45px] rounded-md border bg-white px-4"
            />
            <input
              placeholder="A/S 책임자"
              value={asManagerNameField.value ?? ""}
              onChange={asManagerNameField.onChange}
              className="border-gray03 h-[45px] rounded-md border bg-white px-4"
            />
            <input
              placeholder="A/S 전화번호"
              value={asPhoneNumberField.value ?? ""}
              onChange={asPhoneNumberField.onChange}
              className="border-gray03 h-[45px] rounded-md border bg-white px-4"
            />
          </div>
          <textarea
            placeholder="세탁방법 및 취급 시 주의사항"
            value={cautionField.value ?? ""}
            onChange={cautionField.onChange}
            className="border-gray03 min-h-[90px] w-full rounded-md border bg-white px-4 py-3"
          />
        </div>
        <div className="space-y-4">
          <h4 className="text-lg font-bold">거래조건 고시</h4>
          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder="배송비(원)"
              value={toNumberInputValue(shippingFeeField.value)}
              onChange={(e) =>
                shippingFeeField.onChange(parseNullableNumber(e.target.value))
              }
              className="border-gray03 h-[45px] rounded-md border bg-white px-4"
            />
            <input
              placeholder="추가 배송비(원)"
              value={toNumberInputValue(extraShippingFeeField.value)}
              onChange={(e) =>
                extraShippingFeeField.onChange(parseNullableNumber(e.target.value))
              }
              className="border-gray03 h-[45px] rounded-md border bg-white px-4"
            />
            <input
              placeholder="배송사"
              value={shippingCompanyField.value ?? ""}
              onChange={shippingCompanyField.onChange}
              className="border-gray03 h-[45px] rounded-md border bg-white px-4"
            />
            <input
              placeholder="배송기간 안내"
              value={deliveryPeriodField.value ?? ""}
              onChange={deliveryPeriodField.onChange}
              className="border-gray03 h-[45px] rounded-md border bg-white px-4"
            />
            <input
              placeholder="반품 배송비(원)"
              value={toNumberInputValue(returnShippingFeeField.value)}
              onChange={(e) =>
                returnShippingFeeField.onChange(parseNullableNumber(e.target.value))
              }
              className="border-gray03 h-[45px] rounded-md border bg-white px-4"
            />
            <input
              placeholder="교환 배송비(원)"
              value={toNumberInputValue(exchangeShippingFeeField.value)}
              onChange={(e) =>
                exchangeShippingFeeField.onChange(parseNullableNumber(e.target.value))
              }
              className="border-gray03 h-[45px] rounded-md border bg-white px-4"
            />
          </div>
          <textarea
            placeholder="반품/교환/환불 안내"
            value={returnExchangePolicyField.value ?? ""}
            onChange={returnExchangePolicyField.onChange}
            className="border-gray03 min-h-[90px] w-full rounded-md border bg-white px-4 py-3"
          />
        </div>
        {sizeGuideType !== "NONE" ? (
          <div className="space-y-4">
            <h4 className="text-lg font-bold">
              {sizeGuideType === "TOP" ? "상의 사이즈 스펙" : "하의 사이즈 스펙"}
            </h4>
            {sizeSpecRows.length ? (
              <div className="overflow-x-auto rounded-md border border-gray-200">
                <table className="w-full min-w-[720px] border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-200 px-3 py-2 text-left">사이즈</th>
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
                    {sizeSpecRows.map((row: SizeSpecRow, rowIndex: number) => (
                      <tr key={row.sizeLabel}>
                        <td className="border border-gray-200 px-3 py-2 font-semibold">
                          {row.sizeLabel}
                        </td>
                        {sizeGuideColumns.map(([key]) => (
                          <td
                            key={`${row.sizeLabel}-${key}`}
                            className="border border-gray-200 px-2 py-2"
                          >
                            <input
                              type="number"
                              step="0.1"
                              placeholder="cm"
                              value={toNumberInputValue(row[key])}
                              onChange={(e) =>
                                updateSizeSpecValue(rowIndex, key, e.target.value)
                              }
                              className="border-gray03 h-9 w-full rounded-md border bg-white px-2"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-500">먼저 옵션 및 재고에서 사이즈를 선택해주세요.</p>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            SHOES/ACC 카테고리는 사이즈표 대신 규격/고시 필드 중심으로 안내됩니다.
          </p>
        )}
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={detailField.value}
          onChange={detailField.onChange}
          placeholder="상품 상세 설명을 입력하세요."
          style={{ height: "600px" }}
          modules={modules}
        />
      </div>
      {errors.detail?.message && <p className="ml-3 text-sm text-red-500">{errors.detail.message}</p>}
    </section>
  );
}
