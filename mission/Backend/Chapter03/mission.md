- **미션 기록**
    1. **특정 카테고리 도서 목록 조회 API 구현 (GET /books/category/{categoryId})**
    
    ```jsx
    // BookRepository.java
    public List<Map<String, Object>> findByCategoryId(Long categoryId) {
    String sql = "SELECT * FROM book WHERE category_id = ?";
    return jdbcTemplate.queryForList(sql, categoryId);
    }
    ```
    
    ```jsx
    // BookService.java
    public List<Map<String, Object>> getBooksByCategory(Long categoryId) {
        return bookRepository.findByCategoryId(categoryId);
    }
    ```
    
    ```jsx
    // BookController.java
    @GetMapping("/category/{categoryId}")
    public List<Map<String, Object>> getBooksByCategory(
            @PathVariable("categoryId") Long categoryId) {
        return bookService.getBooksByCategory(categoryId);
    }
    ```
    [GET 실행 결과 ](./images/get.png)
    
     ****
    
    **2. 신규 도서 대여 기록 생성 API 구현 (POST /rentals)**
    
    ```jsx
    //RentalRepository.java
    public void save(Map<String, Object> body) {
    
        String sql =
                "INSERT INTO rental " +
                "(user_id, book_id, rented_at, due_at, returned_at) " +
                "VALUES (?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), NULL)";
    
        jdbcTemplate.update(
                sql,
                body.get("userId"),
                body.get("bookId")
        );
    }
    ```
    
    ```jsx
    //RentalService.java
    public void createRental(Map<String, Object> body) {
        rentalRepository.save(body);
    }
    ```
    
    ```jsx
    //RentalController.java
    @PostMapping
    public Map<String, String> createRental(
            @RequestBody Map<String, Object> body) {
    
        rentalService.createRental(body);
    
        return Map.of(
                "message", "도서 대여 기록이 생성되었습니다!"
        );
    }
    ```
    
    [POST 실행 결과 ](./images/post.png)