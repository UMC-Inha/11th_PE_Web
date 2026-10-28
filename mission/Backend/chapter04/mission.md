```bash
//Entity
@Entity
@Table(name = "book")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "book_id")
    private Long bookId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_available", nullable = false)
    private Boolean isAvailable = true;

    public Book(Category category, String title, String description) {
        this.category = category;
        this.title = title;
        this.description = description;
    }
}

@Entity
@Table(name = "category")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "category_id")
    private Long categoryId;

    @Column(nullable = false, length = 50)
    private String name;

    public Category(String name) {
        this.name = name;
    }
}

//Service
@Service
@RequiredArgsConstructor
public class BookService {

    private final BookRepository bookRepository;
    private final CategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public List<BookResponse> getBooks() {
        return bookRepository.findAllByOrderByBookIdDesc().stream()
                .map(BookResponse::from)
                .toList();
    }

    @Transactional
    public BookResponse createBook(CreateBookRequest request) {
        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new NoSuchElementException("카테고리를 찾을 수 없습니다. id=" + request.categoryId()));

        Book book = new Book(category, request.title(), request.description());
        return BookResponse.from(bookRepository.save(book));
    }
}

//Controller

@RestController
@RequiredArgsConstructor
@RequestMapping("/books")
public class BookController {

    private final BookService bookService;

    @GetMapping
    public List<BookResponse> getBooks() {
        return bookService.getBooks();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BookResponse createBook(@RequestBody @Valid CreateBookRequest request) {
        return bookService.createBook(request);
    }
}
```

Book과 Category를 JPA Entity로 정의하여 DB의 book, category 테이블과 매핑한다.
Book은 Category와 ManyToOne 관계를 설정하여 하나의 카테고리에 여러 책이 속할 수 있도록 한다. BookService에서는 책 조회와 생성 같은 비즈니스 로직을 처리한다. 책을 생성할 때 categoryId를 이용해 해당 카테고리가 존재하는지 확인한 후 Book 객체를 생성하고 DB에 저장한다.
책 목록을 조회할 때는 bookId를 기준으로 내림차순 정렬하여 반환한다. BookController에서는 /books API를 통해 책 조회와 생성을 처리하고, 실제 비즈니스 로직은 BookService에 위임한다. @Transactional을 사용하여 DB 작업의 트랜잭션을 관리하고, 조회 기능에는 readOnly=true를 적용한다.
