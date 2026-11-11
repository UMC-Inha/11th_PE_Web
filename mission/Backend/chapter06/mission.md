- **미션 기록**
    
    ### 1. 회원가입 검증과 비밀번호 저장
    
    회원가입 요청 DTO에서 이메일 형식, 닉네임 길이, 비밀번호 규칙을 검증하도록 했다. 이메일이나 닉네임이 이미 존재하면 409 오류를 반환했다.
    
    ```tsx
    const existingEmail = await this.memberRepository.findOneBy({
      email: dto.email,
    });
    
    if (existingEmail) {
      throw new ConflictException({
        code: 'MEMBER4091',
        message: '이미 사용 중인 이메일입니다.',
      });
    }
    ```
    
    비밀번호는 bcrypt로 해시한 뒤 저장하고, 응답에는 회원 ID·이메일·닉네임만 포함했다.
    
    ```tsx
    const savedMember = await this.memberRepository.save(
      this.memberRepository.create({
        email: dto.email,
        password: await bcrypt.hash(dto.password, 10),
        nickname: dto.nickname,
      }),
    );
    
    return {
      memberId: savedMember.memberId,
      email: savedMember.email,
      nickname: savedMember.nickname,
    };
    ```
    
    Controller에서는 회원가입 성공 시 201과 공통 응답 형식을 반환했다.
    
    ```tsx
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async signUp(@Body() dto: CreateMemberDto) {
      const result = await this.memberService.signUp(dto);
    
      return {
        isSuccess: true,
        code: 'COMMON201',
        message: '회원가입에 성공했습니다.',
        result,
      };
    }
    ```
    
    ### 2. 평점 등록과 중복 방지
    
    평점 등록 DTO에서 별점이 1~5 사이의 정수인지 검증했다.
    
    ```tsx
    @IsInt()
    @Min(1)
    @Max(5)
    score: number;
    ```
    
    같은 회원이 같은 영화에 작성한 평점이 있는지 확인하고, 이미 존재하면 409 오류를 반환했다.
    
    ```tsx
    const existing = await this.ratingRepository.findOne({
      where: { member: { memberId }, movieId: dto.movieId },
    });
    
    if (existing) {
      throw new ConflictException({
        code: 'RATING4091',
        message: '이미 이 영화에 평점을 남기셨습니다.',
      });
    }
    ```
    
    DB의 `(member_id, movie_id)` 복합 UNIQUE 제약도 유지해 중복 저장을 방지했다. 정상 요청은 도서가 아닌 `Rating` 엔티티로 생성·저장하고 201을 반환했다.
    
    ```tsx
    const saved = await this.ratingRepository.save(
      this.ratingRepository.create({
        member,
        movieId: dto.movieId,
        score: dto.score,
        comment: dto.comment ?? null,
      }),
    );
    
    return saved.ratingId;
    ```
    
    ### 3. 평점 존재 여부와 작성자 확인
    
    수정·삭제 전에 평점과 작성자 정보를 함께 조회했다. 평점이 없으면 404, URL의 회원 ID가 작성자와 다르면 403을 반환했다.
    
    ```tsx
    const rating = await this.ratingRepository.findOne({
      where: { ratingId },
      relations: { member: true },
    });
    
    if (!rating) {
      throw new NotFoundException({
        code: 'RATING4041',
        message: '존재하지 않는 평점입니다.',
      });
    }
    
    if (Number(rating.member.memberId) !== memberId) {
      throw new ForbiddenException({
        code: 'RATING4031',
        message: '본인이 작성한 평점만 수정하거나 삭제할 수 있습니다.',
      });
    }
    ```
    
    이번 실습에서는 로그인 인증 대신 URL의 `memberId`를 요청자 ID로 사용했다.
    
    ### 4. 평점 부분 수정과 삭제
    
    PATCH에서는 전달된 필드만 수정하도록 했다. 생략한 값은 유지하고, `comment: null`을 보내면 후기를 삭제하도록 구분했다.
    
    ```tsx
    if (dto.score === undefined && dto.comment === undefined) {
      throw new BadRequestException('수정할 별점 또는 후기를 입력해주세요.');
    }
    
    if (dto.score !== undefined) rating.score = dto.score;
    if (dto.comment !== undefined) rating.comment = dto.comment;
    
    await this.ratingRepository.save(rating);
    ```
    
    DELETE는 작성자 확인 후 평점을 삭제하고, 응답 본문 없이 204를 반환했다.
    
    ```tsx
    @Delete(':memberId/ratings/:ratingId')
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(
      @Param('memberId', ParseIntPipe) memberId: number,
      @Param('ratingId', ParseIntPipe) ratingId: number,
    ) {
      await this.ratingService.delete(ratingId, memberId);
    }
    ```
    
    ### 5. 오류 응답 형식 통일
    
    전역 예외 필터에서 검증 오류와 서비스 예외를 같은 형식으로 반환하도록 했다. 예외에 지정한 기능별 코드를 사용하고, 별도 코드가 없으면 HTTP 상태 기반의 공통 코드를 사용했다.
    
    ```tsx
    response.status(status).json({
      isSuccess: false,
      code: code ?? 'COMMON' + status,
      message,
      result: null,
    });
    ```
    
    중복 이메일은 `MEMBER4091`, 중복 닉네임은 `MEMBER4092`, 중복 평점은 `RATING4091`로 구분했다.
    

    <img width="732" height="735" alt="Image" src="https://github.com/user-attachments/assets/c5dbca33-87ca-4a2e-a7da-bac36dace86d" />

    <img width="735" height="690" alt="Image" src="https://github.com/user-attachments/assets/541c1c64-aae7-4221-a998-47179d32ab9c" />

    <img width="732" height="626" alt="Image" src="https://github.com/user-attachments/assets/a981b037-e77a-4d45-ae94-6b61266eb428" />

    <img width="732" height="637" alt="Image" src="https://github.com/user-attachments/assets/fcbc3f24-c04e-4e24-9ad9-15a191484477" />