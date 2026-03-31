import Image from "next/image";

interface OrderProductCardProps {
  name: string;
  sizeLabel: string;
  price: string;
  count: number;
  imageUrl: string;
}

export default function OrderProductCard({ name, sizeLabel, price, count, imageUrl }: OrderProductCardProps) {
  return (
    <div className="border-gray03 flex gap-4 rounded-lg border p-7">
      <div className="relative h-25 w-25">
        <Image
          src={imageUrl}
          alt="상품 이미지"
          fill
          className="rounded-xl object-cover"
        />
      </div>
      <div className="flex flex-col justify-between">
        <div className="flex flex-col gap-2.5">
          <div className="text-lg font-bold">{name}</div>
          <div className="text-black01 text-base font-normal">사이즈: {sizeLabel}</div>
        </div>
        <div className="text-black01 text-lg font-extrabold">
          {price} <span className="text-gray01 ml-2.5 text-base font-normal">| {count}개</span>
        </div>
      </div>
    </div>
  );
}
