### 1. Book과 Category 엔티티 작성

`book.entity.ts`에서 `book` 테이블의 컬럼을 엔티티 필드로 옮겼다. DB의 snake_case 컬럼명은 코드에서 camelCase로 사용할 수 있도록 명시적으로 매핑했다.

```tsx
@Entity('book')
export class Book {
  @PrimaryGeneratedColumn({ name: 'book_id', type: 'bigint' })
  bookId: number;

  @ManyToOne(() => Category, (category) => category.books, {
    nullable: false,
  })
  @JoinColumn({ name: 'category_id' })
  category: Relation<Category>;

  @Column({ type: 'varchar', length: 100 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'is_available', type: 'boolean', default: true })
  isAvailable: boolean;
}
```

도서 여러 권이 하나의 카테고리에 속하므로 `@ManyToOne`을 사용했다. `@JoinColumn`에는 실제 외래 키 컬럼인 `category_id`를 지정했다.

`category.entity.ts`에는 카테고리 ID와 이름을 정의하고, `@OneToMany`로 해당 카테고리의 도서들과 연결했다.

```tsx
@Entity('category')
export class Category {
  @PrimaryGeneratedColumn({ name: 'category_id', type: 'bigint' })
  categoryId: number;

  @Column({ type: 'varchar', length: 50 })
  name: string;

  @OneToMany(() => Book, (book) => book.category)
  books: Relation<Book[]>;
}
```

### 2. TypeORM 연결과 Repository 등록

`app.module.ts`에서 환경 변수에 저장한 DB 정보를 사용해 TypeORM을 연결했다.

```tsx
TypeOrmModule.forRootAsync({
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    type: 'mysql',
    host: configService.getOrThrow<string>('DB_HOST'),
    port: Number(configService.get('DB_PORT', 3306)),
    username: configService.getOrThrow<string>('DB_USER'),
    password: configService.getOrThrow<string>('DB_PASSWORD'),
    database: configService.getOrThrow<string>('DB_NAME'),
    autoLoadEntities: true,
    synchronize: false,
  }),
}),
```

`autoLoadEntities`로 모듈에 등록한 엔티티를 불러오도록 했다. 기존 DB 테이블 구조가 자동으로 변경되지 않도록 `synchronize`는 `false`로 설정했다.

`books.module.ts`에서는 `Book`과 `Category`의 Repository를 등록했다.

```tsx
@Module({
  imports: [
    TypeOrmModule.forFeature([Book, Category]),
    DatabaseModule,
  ],
  controllers: [BookController],
  providers: [BookService, BookRepository],
})
export class BooksModule {}
```

기존 카테고리별 조회 기능은 Raw SQL Repository를 사용하므로 `DatabaseModule`과 `BookRepository`도 유지했다.

### 3. 도서 등록 요청 DTO와 검증 설정

`create-book.dto.ts`에서 도서 등록 요청의 필드와 검증 조건을 정의했다.

```tsx
export class CreateBookDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  categoryId: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;
}
```

`categoryId`는 숫자로 변환한 뒤 양의 정수인지 확인하도록 했다. `title`은 빈 문자열을 허용하지 않고 최대 100자로 제한했다. `description`은 생략할 수 있도록 했다.

`main.ts`에는 전역 `ValidationPipe`를 추가해 DTO 검증이 실제 요청에 적용되도록 했다.

```tsx
app.useGlobalPipes(
  new ValidationPipe({
    transform: true,
    whitelist: true,
  }),
);
```

`transform`으로 요청 데이터를 DTO 인스턴스로 변환하고, `whitelist`로 검증 데코레이터가 없는 추가 필드를 제거하도록 했다. 검증에 실패한 요청은 400 오류를 반환한다.

### 4. 도서 응답 DTO 작성

`book-response.dto.ts`에서 클라이언트에 반환할 필드를 정의했다.

```tsx
export class BookResponseDto {
  bookId: number;
  title: string;
  description: string | null;
  categoryName: string;
  isAvailable: boolean;

  static from(book: Book): BookResponseDto {
    return {
      bookId: Number(book.bookId),
      title: book.title,
      description: book.description,
      categoryName: book.category.name,
      isAvailable: book.isAvailable,
    };
  }
}
```

`from()`은 조회하거나 저장한 엔티티를 응답 형태로 바꾸도록 작성했다. 카테고리 객체 전체 대신 `categoryName`만 포함하고, DB 컬럼명 대신 camelCase 필드명을 사용하도록 했다.

### 5. 전체 도서 조회를 ORM 방식으로 변경

`book.service.ts`에서 `@InjectRepository`를 사용해 도서와 카테고리 Repository를 주입받도록 했다.

```tsx
constructor(
  private readonly bookRepository: BookRepository,

  @InjectRepository(Book)
  private readonly ormBookRepository: Repository<Book>,

  @InjectRepository(Category)
  private readonly categoryRepository: Repository<Category>,
) {}
```

전체 도서 조회는 직접 작성한 SQL 대신 TypeORM의 `find()`를 사용하도록 변경했다.

```tsx
async getAllBooks(): Promise<BookResponseDto[]> {
  const books = await this.ormBookRepository.find({
    relations: { category: true },
    order: { bookId: 'DESC' },
  });

  return books.map((book) => BookResponseDto.from(book));
}
```

`relations`로 카테고리 정보도 함께 조회하고, `bookId`를 내림차순으로 정렬해 최근 등록한 도서가 먼저 나오도록 했다. 대여 가능 여부에 대한 조건은 넣지 않아 전체 도서가 조회되도록 했다.

조회 결과는 `BookResponseDto.from()`으로 변환해 반환했다.

### 6. 카테고리 확인 후 신규 도서 저장

`book.service.ts`의 `createBook()`에서는 전달받은 카테고리가 존재하는지 먼저 확인하도록 했다.

```tsx
const category = await this.categoryRepository.findOneBy({
  categoryId: body.categoryId,
});

if (!category) {
  throw new NotFoundException('존재하지 않는 카테고리입니다.');
}
```

카테고리가 없으면 도서를 저장하지 않고 404 오류를 반환하도록 했다.

카테고리가 존재하면 `create()`로 도서 엔티티를 만들고, `save()`로 DB에 저장하도록 했다.

```tsx
const book = this.ormBookRepository.create({
  category,
  title: body.title,
  description: body.description ?? null,
  isAvailable: true,
});

const savedBook = await this.ormBookRepository.save(book);

return BookResponseDto.from(savedBook);
```

설명이 생략된 경우에는 `null`을 저장하고, 새 도서는 대여 가능한 상태인 `true`로 설정했다. 저장된 엔티티도 응답 DTO로 변환해 등록된 도서 정보를 반환하도록 했다.

### 7. Controller에 조회·등록 연결

`book.controller.ts`에서 GET 요청은 전체 조회 Service로, POST 요청은 도서 등록 Service로 전달하도록 했다.

```tsx
@Get()
async getBooks(): Promise<BookResponseDto[]> {
  return await this.bookService.getAllBooks();
}

@Post()
async createBook(
  @Body() body: CreateBookDto,
): Promise<BookResponseDto> {
  return this.bookService.createBook(body);
}
```

POST의 Body 타입을 `CreateBookDto`로 지정해 요청 검증이 적용되도록 했다. 기존 등록 성공 문자열 대신 도서 정보가 담긴 JSON을 반환하도록 반환 타입도 변경했다. 정상 처리 시 NestJS 기본 상태 코드에 따라 GET은 200, POST는 201을 반환한다.

get
<img width="735" height="737" alt="Image" src="https://github.com/user-attachments/assets/58ce1cea-0a1a-4731-ba2d-1ad90f025760" />

post
<img width="731" height="567" alt="Image" src="https://github.com/user-attachments/assets/eb3ecac0-7f37-4282-ac92-c89bf5485b73" />

400
<img width="732" height="581" alt="Image" src="https://github.com/user-attachments/assets/46f50f19-0273-4b69-975c-59a2fc7d56f0" />

- 3주차 Raw SQL 방식과 비교해 바뀐 점을 3문장 이상으로 기록
    
    3주차에는 Repository에 SELECT와 INSERT SQL을 직접 작성하고, 물음표에 값을 바인딩하여 DB에 접근했습니다. 이번에는 Book과 Category 엔티티를 정의하고, TypeORM Repository의 find(), create(), save() 메서드로 도서를 조회하고 저장하도록 변경했습니다. 또한 category_id 외래 키를 다대일 객체 관계로 표현하여 도서 조회 시 카테고리 이름을 함께 가져오도록 했습니다. 요청 DTO와 ValidationPipe로 입력을 검증하고, 응답 DTO를 통해 DB 컬럼명 대신 API에서 사용할 필드만 반환하도록 했습니다. 도서 등록 전에는 카테고리 존재 여부를 확인하여, 존재하지 않으면 404 오류를 반환하도록 했습니다.
    
- 실행 결과가 요구사항과 일치하는지 한 문장으로 검증
    
    GET /books에서 요구된 5개 필드가 도서 ID 내림차순으로 반환되고, 정상 등록 시 201과 도서 정보가 반환되며, 빈 제목으로 등록 요청 시 400 오류가 발생하는 것을 확인하여 요구사항과 일치함을 검증했습니다.