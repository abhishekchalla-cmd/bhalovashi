import { config } from "@/config";

export const getMediaUrl = (endpoint: string) => config.backendHost + endpoint;
