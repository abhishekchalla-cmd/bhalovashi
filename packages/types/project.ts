import z from "zod";
import { richTextContentSchema, thumbnailMediaSchema } from "./shared";

// Main document schema
export const projectSchema = z.object({
  id: z.number(),
  documentId: z.string(),
  name: z.string(),
  description: z.array(richTextContentSchema),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  publishedAt: z.string().datetime(),
  thumbnail_media: thumbnailMediaSchema,
});

// Type inference
export type Project = z.infer<typeof projectSchema>;
