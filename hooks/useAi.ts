import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "@/api/axiosInstance"; // <--- आपका Axios instance import हो गया

// Send Text
export const useSendText = () => {
    return useMutation({
        mutationFn: async (payload: { query: string; language: string }) => {
            toast.success(payload.query || "", {
                position: "bottom-right",
                duration: 10000,
                style: {
                    background: "#fff",
                    color: "#0e0d0d",
                },
            });

            toast.loading("🎤 Thinking...", {
                id: "AI-API",
                position: "bottom-right",
            });

            try {
                // Axios Call: URL का Prefix, Content-Type, और credentials ऑटोमैटिक 'api' संभालेगा
                const response = await api.post("/ai/send-text", payload);
                const data = response.data;

                toast.dismiss("AI-API");

                console.log("Voice Response:", data);
                speakText(data?.data?.voice_response || "Failed to send Text");

                toast.success(data?.data?.voice_response || "Issue In Akash AI", {
                    position: "bottom-right",
                    duration: 10000,
                    style: {
                        background: "#6ff7a3",
                        color: "#0e0d0d",
                    },
                });

                return data;
            } catch (error: any) {
                toast.dismiss("AI-API");

                // Axios error handling
                const errorMessage =
                    error?.response?.data?.error ||
                    error?.response?.data?.message ||
                    error?.message ||
                    "Failed to send Text";

                throw new Error(errorMessage);
            }
        },
    });
};

export const useSaveInventoryData = () => {
    return useMutation({
        mutationFn: async (payload: any) => {
            toast.loading("Saving...", {
                id: "useSaveInventoryData-Saving",
            });

            try {
                // Axios Call: URL का Prefix, Content-Type, और credentials ऑटोमैटिक 'api' संभालेगा
                const response = await api.post("/ai/save-inventory-data", payload);
                const data = response.data;
                toast.dismiss("useSaveInventoryData-Saving");
                toast.success('Saved');
                return data;
            } catch (error: any) {
                toast.dismiss("useSaveInventoryData-Saving");
                // Axios error handling
                const errorMessage =
                    error?.response?.data?.error ||
                    error?.response?.data?.message ||
                    error?.message ||
                    "Failed to Save Data";
                throw new Error(errorMessage);
            }
        },
    });
};

function speakText(text: string) {
    // Check अगर ब्राउज़र Speech Synthesis सपोर्ट करता है
    if ('speechSynthesis' in window) {
        // अगर पहले से कुछ बोल रहा है, तो उसे रोको
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);

        // भाषा हिंदी (hi-IN) सेट करें
        utterance.lang = 'hi-IN';
        utterance.rate = 1;  // बोलने की स्पीड (0.5 से 2 के बीच)
        utterance.pitch = 1; // आवाज़ का पिच

        // बोलना शुरू करो!
        window.speechSynthesis.speak(utterance);
    } else {
        console.warn("आपका ब्राउज़र Text-to-Speech सपोर्ट नहीं करता।");
    }
}