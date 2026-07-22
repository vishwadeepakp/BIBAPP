import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

// Send Text
export const useSendText = () => {
    return useMutation({
        mutationFn: async (payload: { query: string; language: string }) => {
            toast.loading("🎤 Thinking...", {
                id: "AI-API",
                position: "bottom-right"
            });
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_GATWAY}/ai/send-text`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            toast.dismiss("AI-API");
            if (!response.ok) {
                throw new Error(data?.error || data?.message || "Failed to send Text");
            }
            console.log("Voice Response:", data);
            speakText(data?.data.voice_response || "Failed to send Text");
            toast.success(data?.data.voice_response || "Issue In Akash AI",{
                position: "bottom-right",
                duration: 6000,
            });
            return data;
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