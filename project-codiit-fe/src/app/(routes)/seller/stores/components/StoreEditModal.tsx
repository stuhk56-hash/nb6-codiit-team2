import { editStore } from "@/lib/api/store";
import { StoreCreateForm } from "@/lib/schemas/storecreate.schema";
import { useToaster } from "@/proviers/toaster/toaster.hook";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import StoreForm from "./StoreForm";

interface StoreEditModalProps {
  onClose: () => void;
  store: {
    id: string;
    name: string;
    address: string;
    detailAddress?: string;
    phone: string;
    content: string;
    businessRegistrationNumber?: string | null;
    businessPhoneNumber?: string | null;
    mailOrderSalesNumber?: string | null;
    representativeName?: string | null;
    businessAddress?: string | null;
    imageUrl?: string;
  };
}

export default function StoreEditModal({ onClose, store }: StoreEditModalProps) {
  const toaster = useToaster();

  const queryClient = useQueryClient();

  const handleEdit = async (data: StoreCreateForm) => {
    try {
      await editStore(store.id, data);

      await queryClient.invalidateQueries({ queryKey: ["myStore"] });
      toaster("info", "스토어 정보를 수정했습니다");
      onClose();
    } catch (error) {
      const message = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message || error.message
        : "스토어 수정 중 오류가 발생했습니다.";
      toaster("warn", message);
    }
  };

  return (
    <StoreForm
      mode="edit"
      onClose={onClose}
      onSubmit={handleEdit}
      defaultValues={{
        storeName: store.name,
        address: {
          basic: store.address,
          detail: store.detailAddress ?? "",
        },
        phoneNumber: store.phone,
        description: store.content,
        businessRegistrationNumber: store.businessRegistrationNumber ?? "",
        businessPhoneNumber: store.businessPhoneNumber ?? "",
        mailOrderSalesNumber: store.mailOrderSalesNumber ?? "",
        representativeName: store.representativeName ?? "",
        businessAddress: store.businessAddress ?? "",
      }}
      imagePreviewUrl={store.imageUrl}
    />
  );
}
