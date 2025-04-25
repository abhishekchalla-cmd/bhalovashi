import { getMedia, getProjects } from "@bhalovashi/api-contracts";
import axios from "axios";
import { writeFileSync } from "fs";
import { resolve } from "path";

require("dotenv").config({ path: resolve(__dirname, ".env.local") });

const main = async () => {
  const { getMediaUrl } = await import("@/utils/media");

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

  const thumbnailDataURLs: { [mediaId: number]: string } = {};

  for (const medium of media) {
    thumbnailDataURLs[medium.id] = await getMediaDataURL(
      getMediaUrl(medium.media.formats.thumbnail.url)
    );
  }

  writeFileSync(
    resolve(__dirname, require("./package.json").appDataFilePath),
    JSON.stringify(
      { data: { projects, media: sortedMedia, thumbnailDataURLs } },
      null,
      2
    )
  );
};

if (require.main?.filename === __filename) main();

const getMediaDataURL = async (mediaUrl: string) => {
  try {
    const mimeType = getMimeTypeFromURL(mediaUrl);
    const response = await axios.get(mediaUrl, { responseType: "arraybuffer" });
    const buffer = Buffer.from(response.data);
    const dataURL = bufferToDataURL(buffer, mimeType);

    return dataURL;
  } catch (error) {
    console.error("Error fetching media:", error);
    throw error;
  }
};

function getMimeTypeFromURL(url: string) {
  const extension = url.split(".").pop()!.toLowerCase();

  const mimeTypes: { [ext: string]: string } = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",
    bmp: "image/bmp",
  };

  return mimeTypes[extension] || "application/octet-stream";
}

function bufferToDataURL(buffer: Buffer, mimeType: string) {
  // Convert buffer to base64 string
  const base64String = buffer.toString("base64");

  // Create the data URL by combining the MIME type and base64 string
  const dataURL = `data:${mimeType};base64,${base64String}`;

  return dataURL;
}
