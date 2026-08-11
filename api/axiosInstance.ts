import axios from 'axios';

// 1. Dedicated Axios Instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_GATWAY,
  withCredentials: true, // <-- कुकीज़ ऑटो-सेंड करने के लिए सबसे ज़रूरी!
});

// 2. Response Interceptor (401 हैंडल करने के लिए)
api.interceptors.response.use(
  (response: any) => {
    // अगर API 2xx response देती है, तो सीधे डेटा रिटर्न कर दो
    return response;
  },
  async (error: any) => {
    const originalRequest = error.config;

    // अगर 401 Unauthorized आया और हमने इस रिक्वेस्ट को अभी तक Retry नहीं किया है
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Infinite loop रोकने के लिए flag

      try {
        // Refresh Token वाली API हिट करें
        // (नोट: axios.post सीधे यूज़ करें, 'api' instance नहीं, वरना 401 आने पर लूप बन जाएगा)
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_GATWAY}/users/refresh-token`,
          {},
          { withCredentials: true }
        );

        // जैसे ही Refresh API सफल होगी, ब्राउज़र में नया accessToken Cookie सेट हो जाएगा।
        // अब original request को दोबारा रन कर दें:
        return api(originalRequest);
      } catch (refreshError: any) {
        // अगर Refresh Token भी Expire या Invalid हो चुका है:
        // यहाँ यूजर को Login पेज पर भेज दें
        if (typeof window !== 'undefined') {
        //   window.location.href = '/';
        }
        if (refreshError.response?.status === 500) {
          localStorage.removeItem('user');
          window.location.href = '/';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;