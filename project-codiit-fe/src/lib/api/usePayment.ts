import { PaymentRequest, PaymentResponse } from "@/types/payment";
import { useMutation } from "@tanstack/react-query";
import { getAxiosInstance } from "./axiosInstance";

export const usePayment = () => {
  const axiosInstance = getAxiosInstance();

  return useMutation({
    mutationFn: async (paymentData: PaymentRequest): Promise<PaymentResponse> => {
      const { data } = await axiosInstance.post<{ data: PaymentResponse }>("/payments", paymentData);
      return data.data;
    },
  });
};
