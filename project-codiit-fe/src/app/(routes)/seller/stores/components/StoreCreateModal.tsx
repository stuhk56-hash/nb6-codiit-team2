import { createStore } from "@/lib/api/store";
import { StoreCreateForm } from "@/lib/schemas/storecreate.schema";
import { useToaster } from "@/proviers/toaster/toaster.hook";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import StoreForm from "./StoreForm";

interface StoreCreateModalProps {
  onClose: () => void;
}

export default function StoreCreateModal({ onClose }: StoreCreateModalProps) {
  const toaster = useToaster();

  const queryClient = useQueryClient();

  const handleCreate = async (data: StoreCreateForm) => {
    try {
      await createStore(data);

      await queryClient.invalidateQueries({ queryKey: ["myStore"] });
      toaster("info", "스토어를 생성했습니다");
      onClose();
    } catch (error) {
      const message = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message || error.message
        : "스토어 생성 중 오류가 발생했습니다.";
      toaster("warn", message);
    }
  };

  return (
    <StoreForm
      mode="create"
      onClose={onClose}
      onSubmit={handleCreate}
    />
  );
}
