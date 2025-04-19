import { z } from "zod";
import ApiContract, { METHOD } from "./api-contract";

export const getProjects = new ApiContract(
  METHOD.GET,
  "/projects",
  z.object({})
);
