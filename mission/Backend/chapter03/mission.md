## **특정 카테고리 도서 목록 조회 API**

### controller

```java
    @GetMapping("/category/{categoryId}")
    public List<Map<String, Object>> getBooksByCategory(@PathVariable("categoryId") int categoryId){
        return  bookService.getBooksByCategoryId(categoryId);
    }
```

### repository

```java
    public List<Map<String, Object>> findAllByCategoryId(int categoryId){
        String sql = "SELECT * FROM book WHERE category_id = ?";
        return jdbcTemplate.queryForList(sql, categoryId);
    }
```

### service

```java
    public List<Map<String, Object>> getBooksByCategoryId(int categoryId){
        return  bookRepository.findAllByCategoryId(categoryId);
    }
```

![스크린샷 2026-10-01 224515.png](images/%EC%8A%A4%ED%81%AC%EB%A6%B0%EC%83%B7%202026-10-01%20224515.png)

![스크린샷 2026-10-01 224557.png](images/%EC%8A%A4%ED%81%AC%EB%A6%B0%EC%83%B7%202026-10-01%20224557.png)

## **신규 도서 대여 기록 생성 API**

### controller

```java
    @PostMapping("/rentals")
    public String createRental(@RequestBody BookReqDTO.GetRentalDTO getRentalDTO){
        bookService.insertRental(getRentalDTO.userId(), getRentalDTO.bookId());
        return "대여가 완료 되었습니다!";
    }
```

### repository

```java
    public void insertRental(int userId, int bookId){
        String sql ="INSERT INTO rental (user_id, book_id, rented_at, due_at) VALUES (?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY))";

        jdbcTemplate.update(sql, userId, bookId);
    }
```

### service

```java
    public void insertRental(int userId, int bookId){
        bookRepository.insertRental(userId, bookId);
    }
```

### dto

```java
    public record GetRentalDTO(
            int bookId,
            int userId
    ){}
```

![스크린샷 2026-10-01 231619.png](images/%EC%8A%A4%ED%81%AC%EB%A6%B0%EC%83%B7%202026-10-01%20231619.png)

![스크린샷 2026-10-01 231638.png](images/%EC%8A%A4%ED%81%AC%EB%A6%B0%EC%83%B7%202026-10-01%20231638.png)

![스크린샷 2026-10-01 231700.png](images/%EC%8A%A4%ED%81%AC%EB%A6%B0%EC%83%B7%202026-10-01%20231700.png)