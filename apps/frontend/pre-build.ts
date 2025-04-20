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

  writeFileSync(
    resolve(__dirname, require("./package.json").appDataFilePath),
    JSON.stringify({ data: { projects, media } }, null, 2)
  );
};

if (require.main?.filename === __filename) main();
