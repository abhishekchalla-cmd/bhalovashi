import { Media } from "@bhalovashi/types/media";
import { Project } from "@bhalovashi/types/project";

export const appData: {
  data: { projects: Project[]; media: Media[] };
} = require("../../app-data.json");

export const useAppData = (): {
  projects: Project[];
  media: Media[];
} => {
  return {
    projects: appData.data.projects,
    media: appData.data.media,
  };
};
