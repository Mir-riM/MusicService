import { z } from "zod";

export const playlistCreateSchema = z.object({
  name: z.string().min(1, "Название обязательно"),
  isPublic: z.boolean(),
  picture: z.instanceof(File).optional(),
});

export type PlaylistCreateForm = z.infer<typeof playlistCreateSchema>;
