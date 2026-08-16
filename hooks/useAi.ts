import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "@/api/axiosInstance"; // <--- आपका Axios instance import हो गया
import React from 'react';

// 1. Types Define करें ताकि TypeScript ऑटो-कंप्लीशन दे
export interface ToastOptions {
    message: string;
    title?: string;               // e.g. "AI Response" ya "Your Query"
    duration?: number;            // Time in milliseconds (Default: 10000ms)
    position?: any;     // 'bottom-right' | 'top-right' | 'bottom-left' etc.
    bgColor?: string;             // Card Background Color
    headerBgColor?: string;       // Header Background Color
    accentColor?: string;         // Title/Icon Color
    textColor?: string;           // Message Text Color
    icon?: string;                // Emoji or Icon text (✨, 💬, etc.)
}

/**
 * Highly Customizable AI Chat Toast for Pure .ts files
 */
export const showCustomToast = ({
    message,
    title = 'AI Response',
    duration = 10000,
    position = 'bottom-right',
    bgColor = '#0f172a',
    headerBgColor = '#1e293b',
    accentColor = '#818cf8',
    textColor = '#e2e8f0',
    icon = '✨',
}: ToastOptions): string => {
    return toast.custom(
        (t) => {
            // 1. Cross / Close Button
            const closeBtn = React.createElement(
                'button',
                {
                    onClick: () => toast.dismiss(t.id),
                    style: {
                        background: 'transparent',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        fontSize: '16px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        lineHeight: 1,
                        outline: 'none',
                    },
                },
                '✕'
            );

            // 2. Header (Icon + Title + Close Button)
            const header = React.createElement(
                'div',
                {
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        backgroundColor: headerBgColor,
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    },
                },
                React.createElement(
                    'div',
                    { style: { display: 'flex', alignItems: 'center', gap: '6px' } },
                    React.createElement('span', { style: { fontSize: '14px' } }, icon),
                    React.createElement(
                        'span',
                        {
                            style: {
                                fontSize: '11px',
                                fontWeight: '700',
                                color: accentColor,
                                letterSpacing: '0.5px',
                                textTransform: 'uppercase',
                            },
                        },
                        title
                    )
                ),
                closeBtn
            );

            // 3. Message Body
            const body = React.createElement(
                'div',
                {
                    style: {
                        padding: '12px 14px',
                        fontSize: '13px',
                        lineHeight: '1.5',
                        color: textColor,
                    },
                },
                message
            );

            // 4. Main Toast Card Container
            return React.createElement(
                'div',
                {
                    style: {
                        opacity: t.visible ? 1 : 0,
                        transform: t.visible ? 'translateY(0)' : 'translateY(10px)',
                        transition: 'all 0.2s ease-in-out',
                        maxWidth: '360px',
                        width: '100%',
                        backgroundColor: bgColor,
                        borderRadius: '10px',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)',
                        overflow: 'hidden',
                        fontFamily: 'sans-serif',
                    },
                },
                header,
                body
            );
        },
        {
            duration,
            position,
        }
    );
};


const INVENTORY_TABLE_QUERY_KEY = ['inventory', 'table'] as const;
const SALE_TABLE_QUERY_KEY = ['sales', 'table'] as const;

export const useInventoryTable = ({ page, limit, search }: { page: number; limit: number; search: string }) => {
    return useQuery({
        queryKey: [...INVENTORY_TABLE_QUERY_KEY, page, limit, search],
        queryFn: async () => {
            const response = await api.get("/ai/inventory/table", {
                params: {
                    page,
                    limit,
                    search,
                    q: search,
                },
            });

            return response.data;
        },
        staleTime: 0,
        refetchOnWindowFocus: false,
    });
};

export const useStockTable = ({ page, limit, search }: { page: number; limit: number; search: string }) => {
    return useQuery({
        queryKey: ["useStockTable", page, limit, search],
        queryFn: async () => {
            const response = await api.get("/stock/table", {
                params: {
                    page,
                    limit,
                    search,
                    q: search,
                },
            });

            return response.data;
        },
        staleTime: 0,
        refetchOnWindowFocus: false,
    });
};

export const useSaleTable = ({ page, limit, search }: { page: number; limit: number; search: string }) => {
    return useQuery({
        queryKey: [...SALE_TABLE_QUERY_KEY, page, limit, search],
        queryFn: async () => {
            const response = await api.get("ai/sales/table", {
                params: {
                    page,
                    limit,
                    search,
                    q: search,
                },
            });

            return response.data;
        },
        staleTime: 0,
        refetchOnWindowFocus: false,
    });
};

export const useSendText = () => {
    return useMutation({
        mutationFn: async (payload: { query: string; language: string }) => {
            showCustomToast({
                message: payload.query,
                title: "Your Query",
                icon: "💬",
                duration: 7000,                  // 5 सेकंड काफी हैं यूजर के अपने मैसेज के लिए
                position: "bottom-right",
                bgColor: "#1e293b",             // Slate Dark Blue (शांत और क्लीन फील)
                headerBgColor: "#0f172a",       // Deep Slate Header
                accentColor: "#38bdf8",         // Sky Blue Accent (यूजर टेक्स्ट)
                textColor: "#f8fafc",           // सफ़ेद लिखावट (High Contrast)
            });
            // toast.success(payload.query || "", {
            //     position: "bottom-right",
            //     duration: 10000,
            //     style: {
            //         background: "#fff",
            //         color: "#0e0d0d",
            //     },
            // });

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

                showCustomToast({
                    message: data?.data?.voice_response || "Issue In Akash AI",
                    title: "AI Response",
                    icon: "🤖",                       // या "✨"
                    duration: 10000,                 // 10 सेकंड ताकि यूजर आराम से पढ़ सके
                    position: "bottom-right",
                    bgColor: "#064e3b",             // Dark Emerald Green (AI Green look)
                    headerBgColor: "#022c22",       // Deep Forest Green Header
                    accentColor: "#34d399",         // Bright Mint Green (AI Badge text)
                    textColor: "#ecfdf5",           // Soft Mint White text (आँखों को चुभेगा नहीं)
                });

                // toast.success(data?.data?.voice_response || "Issue In Akash AI", {
                //     position: "bottom-right",
                //     duration: 10000,
                //     style: {
                //         background: "#6ff7a3",
                //         color: "#0e0d0d",
                //     },
                // });

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

    const queryClient = useQueryClient();

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
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: INVENTORY_TABLE_QUERY_KEY,
                refetchType: 'active',
            });
        },
    });
};

export const useSaveSalesData = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: any) => {
            toast.loading("Saving...", {
                id: "useSaveSalesData-Saving",
            });

            try {
                // Axios Call: URL का Prefix, Content-Type, और credentials ऑटोमैटिक 'api' संभालेगा
                const response = await api.post("/ai/sales/save-sales-data", payload);
                const data = response.data;
                toast.dismiss("useSaveSalesData-Saving");
                toast.success('Saved');
                return data;
            } catch (error: any) {
                toast.dismiss("useSaveSalesData-Saving");
                // Axios error handling
                const errorMessage =
                    error?.response?.data?.error ||
                    error?.response?.data?.message ||
                    error?.message ||
                    "Failed to Save Data";
                throw new Error(errorMessage);
            }
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: SALE_TABLE_QUERY_KEY,
                refetchType: 'active',
            });
        },
    });
};


export const useSaleItem = (saleId: string) => {
    return useQuery({
        queryKey: ["saleItem", saleId],
        queryFn: async () => {
            const response = await api.get("ai/sales/items", {
                params: {
                    saleId,
                },
            });
            return response.data.data;
        },
        staleTime: 0,
        refetchOnWindowFocus: false,
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