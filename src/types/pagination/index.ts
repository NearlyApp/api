export type PaginationMeta = {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  nextRequest?: string;
  previousRequest?: string;
};

export type PaginatedResult<T, K extends string = 'data'> = {
  [key in K]: T[];
} & { pagination: PaginationMeta };
