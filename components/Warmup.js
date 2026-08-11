'use client'; // यह बहुत ज़रूरी है!

import { useEffect } from 'react';

export default function Warmup() {
  useEffect(() => {
    // यहाँ console.log लगाओ ताकि पता चले कि यह ब्राउज़र में चल रहा है
    console.log("🔥 Warmup component mounted! Firing API call...");

    const gatewayUrl = process.env.NEXT_PUBLIC_API_GATWAY;
    if (gatewayUrl) {
      fetch(`${gatewayUrl}/api/warmup`, { 
        cache: 'no-store',
      })
      .then(() => console.log("✅ Warmup call successful"))
      .catch((err) => console.error("❌ Warmup call failed", err));
    }
  }, []); // [] का मतलब है कि यह सिर्फ तब चलेगा जब कंपोनेंट माउंट होगा

  return null;
}