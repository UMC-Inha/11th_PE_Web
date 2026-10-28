- **미션 기록**
    
   ![미션 1](<./images/mission(1).png>)

   ![미션 2](<./images/mission(2).png>)

   ![미션 3](<./images/mission(3).png>)

   ![미션 4](<./images/mission(4).png>)
    
    https://github.com/psylo5608-Seoyeon/11th_BE_Spring_Practice_Mission.git!
    
    3주차에는 JdbcTemplate으로 SQL 문자열과 파라미터를 직접 관리했지만, 4주차에는 Entity와 JpaRepository를 사용해 ORM 기반으로 조회와 저장을 처리하도록 변경하였다. 요청과 응답도 Map 대신 DTO로 분리하여 API 형식을 명확히 하고, @Valid와 Validation 어노테이션을 통해 잘못된 요청을 Controller 단계에서 검증하도록 개선하였다. 또한 Book과 Category의 FK 관계를 @ManyToOne 객체 관계로 표현하고, 도서 등록 시 실제 Category 존재 여부를 확인한 뒤 저장하도록 예외 처리를 추가하였다.
    
    GET/books에서 도서 목록이 최신순으로 정상 조회되고, POST/books의 정상 요청은 201 Created, 공백 제목 요청은 400 Bad Request, 존재하지 않는 카테고리 요청은 404 Not Found로 처리되어 모든 필수 요구사항이 정상적으로 동작하는 것을 확인하였다.