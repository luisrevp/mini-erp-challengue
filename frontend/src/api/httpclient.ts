import axios, { AxiosError } from "axios";

type ApiErrorBody = { error?: string };

export const http = axios.create({
  baseURL: "http://localhost:5080",
  headers: { "Content-Type": "application/json" },
});

http.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody>) => {
    const mensaje =
      error.response?.data?.error ??
      error.message ??
      "Error de red";
    return Promise.reject(new Error(mensaje));
  },
);
