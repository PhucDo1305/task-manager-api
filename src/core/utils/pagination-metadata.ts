export type PaginationMetadata = {
  page: number
  limit: number
  total: number
  nextPage: number | null
  previousPage: number | null
}

type CalculatePaginationMetadataParams = {
  page: number
  limit: number
  total: number
}

export function calculatePaginationMetadata({
  page,
  limit,
  total,
}: CalculatePaginationMetadataParams): PaginationMetadata {
  const totalPages = Math.ceil(total / limit)
  const nextPage = page < totalPages ? page + 1 : null
  const previousPage = page > 1 ? page - 1 : null

  return {
    page,
    limit,
    total,
    nextPage,
    previousPage,
  }
}
