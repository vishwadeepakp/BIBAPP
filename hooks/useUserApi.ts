import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "@/api/axiosInstance";

export const useSaveProfile = () => {

    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: any) => {
            toast.loading("Saving Profile...", {
                id: "useSaveProfile-Saving",
            });

            try {
                // Axios Call: URL का Prefix, Content-Type, और credentials ऑटोमैटिक 'api' संभालेगा
                const response = await api.post("/profile/save-profile", payload);
                const data = response.data;
                toast.dismiss("useSaveProfile-Saving");
                toast.success('Profile Saved');
                return data;
            } catch (error: any) {
                toast.dismiss("useSaveProfile-Saving");
                // Axios error handling
                const errorMessage =
                    error?.response?.data?.error ||
                    error?.response?.data?.message ||
                    error?.message ||
                    "Failed to Save Profile";
                throw new Error(errorMessage);
            }
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['getPrfile'],
                refetchType: 'active',
            });
        },
    });
}

export const useGetProfile = () => {
    return useQuery({
        queryKey: ['getPrfile'],
        queryFn: async () => {
            const response = await api.get("/profile/get-profile", {});
            return response.data.data;
        },
        staleTime: 0,
        refetchOnWindowFocus: false,
    });
};
