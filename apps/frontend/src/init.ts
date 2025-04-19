import { getMedia, getProjects } from "@bhalovashi/api-contracts";
import { Media } from "@bhalovashi/types/media";
import { Project } from "@bhalovashi/types/project";
import { axiosInstance } from "./utils/axios";

class AppInitContext {
  public projects: Project[] | undefined;
  public media: Media[] | undefined;

  public initialisationPromise: Promise<any>;

  constructor() {
    this.initialisationPromise = this.loadProjects().then(() =>
      this.loadMedia()
    );
  }

  async loadProjects() {
    this.projects = await getProjects
      .makeRequest(axiosInstance, {})
      .then((res) => res.data);
  }

  async loadMedia() {
    this.media = await getMedia
      .makeRequest(axiosInstance, {})
      .then((res) => res.data);
  }

  async getProjects(): Promise<Project[]> {
    await this.initialisationPromise;
    return this.projects!;
  }

  async getMedia(): Promise<Media[]> {
    await this.initialisationPromise;
    return this.media!;
  }
}

export const appInitContext = new AppInitContext();
