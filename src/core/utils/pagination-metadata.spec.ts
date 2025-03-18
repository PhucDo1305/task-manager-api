import { calculatePaginationMetadata } from './pagination-metadata'

describe('calculatePaginationMetadata', () => {
  it('should be able to calculate pagination metadata correctly for the first page', () => {
    const metadata = calculatePaginationMetadata({
      page: 1,
      limit: 10,
      total: 50,
    })

    expect(metadata).toEqual({
      page: 1,
      limit: 10,
      total: 50,
      nextPage: 2,
      previousPage: null,
    })
  })

  it('should be able to calculate pagination metadata correctly for a middle page', () => {
    const metadata = calculatePaginationMetadata({
      page: 3,
      limit: 10,
      total: 50,
    })

    expect(metadata).toEqual({
      page: 3,
      limit: 10,
      total: 50,
      nextPage: 4,
      previousPage: 2,
    })
  })

  it('should be able to calculate pagination metadata correctly for the last page', () => {
    const metadata = calculatePaginationMetadata({
      page: 5,
      limit: 10,
      total: 50,
    })

    expect(metadata).toEqual({
      page: 5,
      limit: 10,
      total: 50,
      nextPage: null,
      previousPage: 4,
    })
  })

  it('should be able to handle cases where there are no items', () => {
    const metadata = calculatePaginationMetadata({
      page: 1,
      limit: 10,
      total: 0,
    })

    expect(metadata).toEqual({
      page: 1,
      limit: 10,
      total: 0,
      nextPage: null,
      previousPage: null,
    })
  })

  it('should be able to handle cases where the total number of items is less than the limit', () => {
    const metadata = calculatePaginationMetadata({
      page: 1,
      limit: 10,
      total: 5,
    })

    expect(metadata).toEqual({
      page: 1,
      limit: 10,
      total: 5,
      nextPage: null,
      previousPage: null,
    })
  })
})
