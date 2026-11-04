- 필수 미션

![image1.png](images/image1.png)

  2페이지로 이동 후 1페이지로 갔을 때 page1이 다시 생기지 않는다.
  
![image2.png](images/image2.png)

  “짱구” 검색 후 메인으로 나갔다가 다keyword: 6주차 키워드 정리 완료시 검색시 요청이 생기지 않는다.

- 선택 미션

    ```jsx
    import { queryOptions } from '@tanstack/react-query'
    import { getMovieDetail } from './get-movie-details'
    import { getMovies } from './get-movies'
    import { searchMovies } from './search-movies'
    
    export const movieListQueryOptions = (page: number) =>
      queryOptions({
        queryKey: ['movies', 'list', { page }],
        queryFn: () => getMovies({ page }),
      })
    
    export const movieSearchQueryOptions = (query: string) =>
      queryOptions({
        queryKey: ['movies', 'search', { query }],
        queryFn: () => searchMovies({ query }),
        enabled: query.length > 0,
      })
    
    export const movieDetailQueryOptions = (
      movieId: number,
      enabled: boolean,
    ) =>
      queryOptions({
        queryKey: ['movies', 'detail', movieId],
        queryFn: () => getMovieDetail(movieId),
        enabled,
        staleTime: 30 * 1000,
      })
    ```

  queryOptions으로 목록, 검색, 상세의 queryKey, queryFn을 한 파일에 모은 파일