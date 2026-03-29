import Image from "next/image";
import { useState } from "react";
import StoreEditModal from "./StoreEditModal";

export interface StoreInfoProps {
  store: {
    id: string;
    name: string;
    address: string;
    detailAddress?: string;
    phoneNumber: string;
    businessRegistrationNumber?: string | null;
    businessPhoneNumber?: string | null;
    mailOrderSalesNumber?: string | null;
    representativeName?: string | null;
    businessAddress?: string | null;
    favoriteCount: number;
    content: string;
    image: string;
  };
}

export function StoreInfo({ store }: StoreInfoProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  return (
    <section className="flex w-full flex-col gap-10">
      <div className="flex justify-between gap-10">
        <div>
          <div className="flex items-center gap-[0.8125rem]">
            <p className="text-black01 text-[24px] font-bold">{store.name}</p>
            <button
              type="button"
              className="text-gray01 cursor-pointer text-lg underline"
              aria-label="스토어 정보 수정"
              onClick={() => setIsEditModalOpen(true)}
            >
              수정
            </button>
          </div>
          <div className="mt-5">
            <p className="text-gray01 text-base font-bold">주소</p>
            <p className="text-black02 mt-2 text-base">
              {store.address} {store.detailAddress ?? ""}
            </p>
          </div>
          <div className="mt-4">
            <p className="text-gray01 text-base font-bold">연락처</p>
            <p className="text-black02 mt-2 text-base">{store.phoneNumber}</p>
          </div>
          <div className="mt-4">
            <p className="text-gray01 text-base font-bold">대표자명</p>
            <p className="text-black02 mt-2 text-base">{store.representativeName || "미제공"}</p>
          </div>
          <div className="mt-4">
            <p className="text-gray01 text-base font-bold">사업자등록번호</p>
            <p className="text-black02 mt-2 text-base">{store.businessRegistrationNumber || "미제공"}</p>
          </div>
          <div className="mt-4">
            <p className="text-gray01 text-base font-bold">통신판매업 신고번호</p>
            <p className="text-black02 mt-2 text-base">{store.mailOrderSalesNumber || "미제공"}</p>
          </div>
          <div className="mt-4">
            <p className="text-gray01 text-base font-bold">사업자 연락처</p>
            <p className="text-black02 mt-2 text-base">{store.businessPhoneNumber || "미제공"}</p>
          </div>
          <div className="mt-4">
            <p className="text-gray01 text-base font-bold">사업장 소재지</p>
            <p className="text-black02 mt-2 text-base">{store.businessAddress || "미제공"}</p>
          </div>
        </div>
        <div className="flex flex-col gap-[0.375rem] px-[1.625rem] py-[0.7188rem]">
          <Image
            src="/icon/heart.svg"
            alt=""
            width={50}
            height={50}
          />
          <span className="text-black02 text-center">{store.favoriteCount}</span>
        </div>
      </div>
      <div className="w-full bg-[#f8f8f8] p-10 text-left whitespace-pre-line">{store.content}</div>
      {isEditModalOpen && (
        <StoreEditModal
          onClose={() => setIsEditModalOpen(false)}
          store={{
            id: store.id,
            name: store.name,
            address: store.address,
            detailAddress: store.detailAddress,
            phone: store.phoneNumber,
            content: store.content,
            businessRegistrationNumber: store.businessRegistrationNumber,
            businessPhoneNumber: store.businessPhoneNumber,
            mailOrderSalesNumber: store.mailOrderSalesNumber,
            representativeName: store.representativeName,
            businessAddress: store.businessAddress,
            imageUrl: store.image,
          }}
        />
      )}
    </section>
  );
}
