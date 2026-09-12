import api from "../api/axios";

export async function sendAiMessage(messages) {
  try {
    const response = await api.post("/ai/chat", { messages });
    return {
      message: response.data?.message || "AI tidak memberikan jawaban.",
      products: Array.isArray(response.data?.products) ? response.data.products : [],
    };
  } catch (error) {
    if (!error.response || error.code === "ERR_NETWORK" || error.message === "Network Error") {
      throw new Error("WastraChat sedang tidak tersedia. Nyalakan backend untuk menggunakan AI.");
    }
    const message = error.response?.data?.message || error.message;
    throw new Error(message || "Gagal menghubungi WastraChat.");
  }
}