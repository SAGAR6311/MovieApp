import { MOVIE_ACCESS_TOKEN } from "@/constants/api";
import axios, { AxiosInstance, AxiosResponse } from "axios";

const BASE_URL = "https://api.themoviedb.org/3";
const API_TOKEN = `Bearer ${MOVIE_ACCESS_TOKEN}`;

const tmdbApi: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    Accept: "application/json",
    Authorization: API_TOKEN,
  },
});

export const fetchTMDBData = async <T>(
  endpoint: string,
  params: Record<string, any> = {}
): Promise<T> => {
  try {
    const response: AxiosResponse<T> = await tmdbApi.get(endpoint, { params });
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching ${endpoint}:`, error.message);
    throw error;
  }
};

export const endpoints = {
  nowPlaying: "/movie/now_playing",
  popular: "/movie/popular",
  topRated: "/movie/top_rated",
  upcoming: "/movie/upcoming",
  search: "/search/movie",
};
