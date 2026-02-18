export type PageInfo = {
  limit: number;
  offset: number;
  total: number;
  hasMore: boolean;
};

export type PaginatedResponse<T> = {
  items: T[];
  pageInfo: PageInfo;
};
