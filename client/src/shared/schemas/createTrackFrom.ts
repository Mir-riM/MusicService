export type CreateTrackForm = {
  name: string;
  author: string;
  text?: string;
  picture: File | undefined;
  track: File | undefined;
};

import { z } from "zod";

export const stepSchemas = [
  z.object({
    name: z.string().min(1, "Название обязательно"),
    author: z.string().min(1, "Автор обязателен"),
    text: z.string().optional(),
  }),

  z.object({
    picture: z.instanceof(File, { message: "Загрузите обложку" }),
  }),

  z.object({
    track: z.instanceof(File, { message: "Загрузите аудиофайл" }),
  }),
];
