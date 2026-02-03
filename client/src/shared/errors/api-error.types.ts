export type ApiError = {
  statusCode: number;
  code: string;
  message: string;
  fields?: Record<string, string>;
};
