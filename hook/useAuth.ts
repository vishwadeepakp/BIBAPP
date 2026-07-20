import { useMutation } from "@tanstack/react-query";

// Send OTP
export const useSendOtp = () => {
  return useMutation({
    mutationFn: async (payload: { phone: string }) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_GATWAY}/users/send-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || data?.message || "Failed to send OTP");
      }

      return data;
    },
  });
};

// Verify OTP
export const useVerifyOtp = () => {
  return useMutation({
    mutationFn: async (payload: { phone: string; otp: string }) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_GATWAY}/users/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to verify OTP");
      }

      return response.json();
    },
  });
};