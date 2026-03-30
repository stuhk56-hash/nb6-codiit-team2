"use client";

import { useSearchOptionStore } from "@/stores/searchOptionStore";
import Image from "next/image";
import Link from "next/link";

export default function Logo() {
  const { resetOption } = useSearchOptionStore();

  return (
    <Link
      href="/products"
      onClick={resetOption}
      className="relative h-[23px] w-[131px]"
    >
      <Image
        src="/icon/logo.svg"
        alt="CODI-IT"
        fill
        style={{ objectFit: "contain" }}
      />
    </Link>
  );
}
