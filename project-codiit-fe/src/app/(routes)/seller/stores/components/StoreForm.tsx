import Modal from "@/components/Modal";
import Button from "@/components/button/Button";
import BoxInput from "@/components/input/BoxInput";
import TextArea from "@/components/input/TextArea";
import { StoreCreateForm, storeCreateSchema } from "@/lib/schemas/storecreate.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useController, useForm } from "react-hook-form";

interface StoreFormProps {
  mode: "create" | "edit";
  onClose: () => void;
  onSubmit: (data: StoreCreateForm) => Promise<void>;
  defaultValues?: Partial<StoreCreateForm>;
  imagePreviewUrl?: string;
}

export default function StoreForm({ mode, onClose, onSubmit, defaultValues, imagePreviewUrl }: StoreFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<StoreCreateForm>({
    resolver: zodResolver(storeCreateSchema),
    defaultValues,
  });

  // defaultValues 변경 시 폼 리셋
  useEffect(() => {
    reset({
      disclosureAgreement: false,
      ...defaultValues,
    });
  }, [defaultValues, reset]);

  const {
    field: imageField,
    fieldState: { error: imageError },
  } = useController({
    name: "image",
    control,
  });

  const [preview, setPreview] = useState<string | null>(null);

  const isValidImage = (src?: string | null) => {
    if (!src || src.trim() === "") return false;
    return src.startsWith("http://") || src.startsWith("https://") || src.startsWith("/") || src.startsWith("blob:");
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      imageField.onChange(file);

      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
    }
  };

  useEffect(() => {
    if (typeof imageField.value === "string" && imageField.value) {
      setPreview(imageField.value);
    }
  }, [imageField.value]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  useEffect(() => {
    if (imagePreviewUrl) {
      setPreview(imagePreviewUrl);
    }
  }, [imagePreviewUrl]);

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="relative w-[599px] text-left"
      >
        <div className="relative w-[599px] text-left">
          <p className="text-[28px] font-extrabold">{mode === "create" ? "스토어 등록" : "스토어 수정"}</p>
          <div className="bg-gray04 mt-5 mb-10 h-px w-full" />
          <div className="mb-8 rounded-md border border-gray-200 bg-gray-50 p-4">
            <p className="text-base font-bold text-gray-900">구매자 노출 안내</p>
            <p className="mt-1 text-sm text-gray-600">
              아래 정보는 구매자에게 공개됩니다. (상품 상세 &gt; 판매자정보/배송·교환·반품 안내)
            </p>
            <p className="mt-2 text-xs text-gray-500">
              판매자 이용약관 및 개인정보 수집·이용 안내에 따라 공개 항목이 처리됩니다.
            </p>
            <div className="mt-3 space-y-2 text-sm text-gray-700">
              <div>스토어명, 주소, 전화번호, 스토어 설명</div>
              <div>대표자명, 사업자등록번호, 통신판매업 신고번호, 사업자 연락처, 사업장 소재지</div>
            </div>
            <div className="mt-3 text-xs text-gray-500">
              <span className="font-semibold">관련 문서:</span>{" "}
              <Link
                href="/seller/terms"
                className="underline underline-offset-2"
                target="_blank"
                rel="noreferrer"
              >
                판매자 이용약관
              </Link>{" "}
              /{" "}
              <Link
                href="/seller/privacy"
                className="underline underline-offset-2"
                target="_blank"
                rel="noreferrer"
              >
                개인정보 수집·이용 안내
              </Link>
            </div>
          </div>
          <button
            className="absolute top-0 right-0"
            onClick={onClose}
            type="button"
          >
            <Image
              src="/icon/deleteBlack.svg"
              alt="닫기"
              width={24}
              height={24}
            />
          </button>
          <BoxInput
            label="스토어명"
            placeholder="스토어 이름 입력"
            {...register("storeName")}
          />
          {errors.storeName && <p className="mt-[1px] text-red-500">{errors.storeName.message}</p>}

          <div className="bg-gray04 mt-[1.875rem] mb-[1.875rem] h-px w-full" />
          <div className="flex flex-col">
            <label className="mb-5 text-xl font-bold">주소</label>
            <input
              placeholder="기본 주소"
              className="border-gray03 placeholder:text-gray02 mb-[10px] flex h-15 rounded-md border bg-white p-5 text-base leading-none font-normal"
              {...register("address.basic")}
            />
            <input
              placeholder="상세 주소 입력"
              className="border-gray03 placeholder:text-gray02 flex h-15 rounded-md border bg-white p-5 text-base leading-none font-normal"
              {...register("address.detail")}
            />
            {errors.address?.basic && <p className="mt-[1px] text-red-500">{errors.address.basic.message}</p>}
            {errors.address?.detail && <p className="mt-[1px] text-red-500">{errors.address.detail.message}</p>}
          </div>

          <div className="bg-gray04 mt-[1.875rem] mb-[1.875rem] h-px w-full" />
          <BoxInput
            label="전화번호"
            placeholder="스토어 전화번호 입력"
            {...register("phoneNumber")}
          />
          {errors.phoneNumber && <p className="mt-[1px] text-red-500">{errors.phoneNumber.message}</p>}

          <div className="bg-gray04 mt-[1.875rem] mb-[1.875rem] h-px w-full" />
          <BoxInput
            label="대표자명"
            placeholder="대표자명을 입력하세요"
            {...register("representativeName")}
          />
          <div className="mt-5">
            <BoxInput
              label="사업자등록번호"
              placeholder="예: 123-45-67890"
              {...register("businessRegistrationNumber")}
            />
          </div>
          <div className="mt-5">
            <BoxInput
              label="통신판매업 신고번호"
              placeholder="예: 2026-서울강남-0001"
              {...register("mailOrderSalesNumber")}
            />
          </div>
          <div className="mt-5">
            <BoxInput
              label="사업자 연락처"
              placeholder="사업자 연락처 입력"
              {...register("businessPhoneNumber")}
            />
          </div>
          <div className="mt-5">
            <BoxInput
              label="사업장 소재지"
              placeholder="사업장 소재지 입력"
              {...register("businessAddress")}
            />
          </div>

          <div className="bg-gray04 mt-[1.875rem] mb-[1.875rem] h-px w-full" />
          <label className="flex flex-col gap-5 text-xl font-bold">
            스토어 이미지
            <input
              type="file"
              accept="image/*"
              id="store-image-input"
              onChange={handleImageChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => document.getElementById("store-image-input")?.click()}
              className="bg-gray05 relative h-[240px] w-[240px] overflow-hidden rounded-md p-[100px]"
            >
              {preview && isValidImage(preview) ? (
                <Image
                  src={preview}
                  alt="선택된 이미지"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Image
                    src="/icon/gallery.svg"
                    alt="스토어 이미지 첨부"
                    width={40}
                    height={40}
                  />
                </div>
              )}
            </button>
            {imageError && <p className="text-base font-normal text-red-500">{imageError.message}</p>}
          </label>

          <div className="bg-gray04 mt-[1.875rem] mb-[1.875rem] h-px w-full" />
          <TextArea
            label="스토어 설명"
            placeholder="최소 10자 이상 입력"
            {...register("description")}
          />
          {errors.description && <p className="mt-[1px] text-red-500">{errors.description.message}</p>}
        </div>

        <label className="mt-8 flex items-start gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            className="mt-1"
            {...register("disclosureAgreement")}
          />
          <span>
            <Link
              href="/seller/terms"
              className="underline underline-offset-2"
              target="_blank"
              rel="noreferrer"
            >
              판매자 이용약관
            </Link>
            {" / "}
            <Link
              href="/seller/privacy"
              className="underline underline-offset-2"
              target="_blank"
              rel="noreferrer"
            >
              개인정보 수집·이용 안내
            </Link>
            {" 및 공개 항목(노출 위치 포함)을 확인했으며, 저장 시 구매자에게 공개됨에 동의합니다."}
          </span>
        </label>
        {errors.disclosureAgreement && (
          <p className="mt-1 text-sm text-red-500">{errors.disclosureAgreement.message}</p>
        )}

        <div className="mt-10 flex gap-5">
          <Button
            type="button"
            label="취소"
            size="large"
            variant="secondary"
            color="white"
            onClick={onClose}
            className="h-[65px] w-full text-[18px]"
          />
          <Button
            type="submit"
            label={mode === "create" ? "스토어 등록" : "스토어 수정"}
            size="large"
            variant="primary"
            color="black"
            className="h-[65px] w-full text-[18px]"
          />
        </div>
      </form>
    </Modal>
  );
}
