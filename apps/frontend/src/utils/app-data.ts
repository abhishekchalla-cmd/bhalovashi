import { Media } from "@bhalovashi/types/media";
import { Project } from "@bhalovashi/types/project";

export const appData: {
  data: {
    projects: Project[];
    media: Media[];
    thumbnailDataURLs: { [mediaId: string]: string };
  };
} = require("../../app-data.json");

export const useAppData = (): {
  projects: Project[];
  media: Media[];
  thumbnailDataURLs: { [mediaId: string]: string };
} => {
  return {
    projects: appData.data.projects,
    media: appData.data.media,
    thumbnailDataURLs: appData.data.thumbnailDataURLs,
  };
};
