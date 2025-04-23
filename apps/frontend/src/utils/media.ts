import { config } from "@/config";
import { Media } from "@bhalovashi/types/media";
import { ImageFormatSchema } from "@bhalovashi/types/shared";

export const getMediaUrl = (endpoint: string) => config.backendHost + endpoint;

export const getLargestMediaFormat = (
  media: Media["media"]
): ImageFormatSchema => {
  return media.formats.large || media.formats.medium || media.formats.small;
};
