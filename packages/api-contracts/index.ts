import { z } from "zod";
import ApiContract, { METHOD } from "./api-contract";
import { resultSchema } from "@bhalovashi/types/shared";
import { projectSchema } from "@bhalovashi/types/project";
import { mediaItemSchema } from "@bhalovashi/types/media";

export const getProjects = new ApiContract(
  METHOD.GET,
  "/api/projects?populate[0]=thumbnail_media",
  resultSchema(projectSchema)
);

export const getMedia = new ApiContract(
  METHOD.GET,
  "/api/media?populate[0]=project&populate[1]=media",
  resultSchema(mediaItemSchema)
);
