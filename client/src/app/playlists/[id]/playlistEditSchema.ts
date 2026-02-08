import { z } from "zod";

export const playlistEditSchema = z.object({
  name: z.string().min(1, "Название обязательно"),
  isPublic: z.boolean(),
  picture: z.instanceof(File).optional(),
});

export type PlaylistEditForm = z.infer<typeof playlistEditSchema>;
