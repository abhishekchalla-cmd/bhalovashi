import { z } from "zod";
import { mediaSchema, richTextContentSchema } from "./shared";
import { projectSchema } from "./project";

// Schema for media item
export const mediaItemSchema = z.object({
  id: z.number(),
  documentId: z.string(),
  title: z.string(),
  description: z.array(richTextContentSchema),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  publishedAt: z.string().datetime(),
  project: projectSchema,
  media: mediaSchema,
});

export type Media = z.infer<typeof mediaItemSchema>;
