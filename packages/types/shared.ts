import { z } from "zod";

// Schema for rich text content (description)
export const richTextContentSchema = z.object({
  type: z.literal("paragraph"),
  children: z.array(
    z.object({
      type: z.literal("text"),
      text: z.string(),
    })
  ),
});

// Schema for thumbnail media
export const thumbnailMediaSchema = z.object({
  id: z.number(),
  documentId: z.string(),
  title: z.string(),
  description: z.array(richTextContentSchema),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  publishedAt: z.string().datetime(),
});

// Schema for image formats
export const imageFormatSchema = z.object({
  name: z.string(),
  hash: z.string(),
  ext: z.string(),
  mime: z.string(),
  path: z.null(),
  width: z.number(),
  height: z.number(),
  size: z.number(),
  sizeInBytes: z.number(),
  url: z.string(),
});

// Schema for media
export const mediaSchema = z.object({
  id: z.number(),
  documentId: z.string(),
  name: z.string(),
  alternativeText: z.string().nullable(),
  caption: z.string().nullable(),
  width: z.number(),
  height: z.number(),
  formats: z.object({
    thumbnail: imageFormatSchema,
    small: imageFormatSchema,
    medium: imageFormatSchema.optional(),
    large: imageFormatSchema.optional(),
  }),
  hash: z.string(),
  ext: z.string(),
  mime: z.string(),
  size: z.number(),
  url: z.string(),
  previewUrl: z.string().nullable(),
  provider: z.string(),
  provider_metadata: z.null(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  publishedAt: z.string().datetime(),
});

// Schema for pagination
export const paginationSchema = z.object({
  page: z.number(),
  pageSize: z.number(),
  pageCount: z.number(),
  total: z.number(),
});

// Result schema
export const resultSchema = <R extends z.AnyZodObject>(itemSchema: R) =>
  z.object({
    data: z.array(itemSchema),
    meta: z.object({
      pagination: paginationSchema,
    }),
  });
