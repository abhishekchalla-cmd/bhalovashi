import { getMedia, getProjects } from "@bhalovashi/api-contracts";
import axios from "axios";
import { writeFileSync } from "fs";
import { resolve } from "path";

require("dotenv").config({ path: resolve(__dirname, ".env.local") });

const main = async () => {
  const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  });

  const projects = await getProjects
    .makeRequest(axiosInstance, {})
    .then((res) => res.data);
  const media = await getMedia
    .makeRequest(axiosInstance, {})
    .then((res) => res.data);

  const sortedMedia = [];
  for (const project of projects) {
    const projectMedia = media.filter((m) => m.project.id === project.id);
    const thumbnailMedia = projectMedia.find(
      (m) => m.id === project.thumbnail_media.id
    )!;
    projectMedia.splice(projectMedia.indexOf(thumbnailMedia), 1);
    sortedMedia.push(thumbnailMedia, ...projectMedia);
  }

  writeFileSync(
    resolve(__dirname, require("./package.json").appDataFilePath),
    JSON.stringify({ data: { projects, media: sortedMedia } }, null, 2)
  );
};

if (require.main?.filename === __filename) main();
