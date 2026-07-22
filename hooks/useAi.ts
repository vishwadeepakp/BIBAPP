import { useMutation } from "@tanstack/react-query";

// Send Text
export const useSendText = () => {
    return useMutation({
        mutationFn: async (payload: { query: string; language: string }) => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_GATWAY}/ai/send-text`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.error || data?.message || "Failed to send Text");
            }
            console.log("Voice Response:", data);
            speakText(data?.data.voice_response || "Failed to send Text");

            return data;
        },
    });
};

function speakText(text) {
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