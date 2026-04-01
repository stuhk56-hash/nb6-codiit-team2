"use client";

import { createProduct } from "@/lib/api/products";
import { ProductFormValues } from "@/lib/schemas/productForm.schema";
import { useToaster } from "@/proviers/toaster/toaster.hook";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import axios from "axios";
import ProductForm from "../components/ProductForm";

export default function ProductCreatePage() {
  const toaster = useToaster();
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      toaster("info", "상품을 등록했습니다");
      queryClient.invalidateQueries({ queryKey: ["productList"] });
      router.push("/seller/my-products");
    },
    onError: (error: unknown) => {
      const message = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message || error.message
        : error instanceof Error
          ? error.message
          : "상품 등록 중 오류가 발생했습니다.";
      toaster("warn", `상품 등록 실패: ${message}`);
    },
  });

  const handleCreate = (data: ProductFormValues) => {
    mutation.mutate(data);
  };

  return (
    <div className="mx-auto mt-[60px] mb-[120px] flex w-[1520px] flex-col">
      <div className="mb-10 text-[28px] font-extrabold">상품 등록</div>
      <ProductForm onSubmit={handleCreate} />
    </div>
  );
}
