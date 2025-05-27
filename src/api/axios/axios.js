import { meta } from "@eslint/js";
import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL;

export const axioInstance = axios.create({
  baseURL,
});

axioInstance.interceptors.request.use({
  function(config) {
    const token = localStorage.getItem("x-access-token");

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
  },
});
