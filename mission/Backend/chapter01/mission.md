
CREATE TABLE `region` (
	`id`	BIGINT	NOT NULL,
	`name`	VARCHAR(50)	NOT NULL,
	`created_at`	DATETIME	NOT NULL
);

CREATE TABLE `food_category` (
	`id`	BIGINT	NOT NULL,
	`name`	VARCHAR(30)	NOT NULL,
	`created_at`	DATETIME	NOT NULL
);

CREATE TABLE `member` (
	`id`	BIGINT	NOT NULL,
	`region_id`	BIGINT	NOT NULL,
	`social_type`	VARCHAR(20)	NOT NULL,
	`social_id`	VARCHAR(100)	NOT NULL,
	`email`	VARCHAR(100)	NULL,
	`name`	VARCHAR(50)	NOT NULL,
	`gender`	VARCHAR(10)	NULL,
	`birth_date`	DATE	NOT NULL,
	`point`	INT	NOT NULL,
	`status`	VARCHAR(20)	NOT NULL,
	`inactive_date`	DATETIME	NULL,
	`created_at`	DATETIME	NOT NULL,
	`updated_at`	DATETIME	NOT NULL
);

CREATE TABLE `member_prefer` (
	`id`	BIGINT	NOT NULL,
	`member_id`	BIGINT	NOT NULL,
	`food_category_id`	BIGINT	NOT NULL,
	`created_at`	DATETIME	NOT NULL
);

CREATE TABLE `store` (
	`id`	BIGINT	NOT NULL,
	`region_id`	BIGINT	NOT NULL,
	`food_category_id`	BIGINT	NOT NULL,
	`name`	VARCHAR(100)	NOT NULL,
	`address`	VARCHAR(255)	NOT NULL,
	`phone`	VARCHAR(20)	NULL,
	`score`	DECIMAL(2,1)	NOT NULL,
	`status`	VARCHAR(20)	NOT NULL,
	`created_at`	DATETIME	NOT NULL,
	`updated_at`	DATETIME	NOT NULL
);

CREATE TABLE `mission` (
	`id`	BIGINT	NOT NULL,
	`store_id`	BIGINT	NOT NULL,
	`title`	VARCHAR(100)	NOT NULL,
	`min_order_amount`	INT	NOT NULL,
	`reward_point`	INT	NOT NULL,
	`period_days`	INT	NOT NULL,
	`status`	VARCHAR(20)	NOT NULL,
	`created_at`	DATETIME	NOT NULL
);

CREATE TABLE `member_mission` (
	`id`	BIGINT	NOT NULL,
	`member_id`	BIGINT	NOT NULL,
	`mission_id`	BIGINT	NOT NULL,
	`mission_status`	VARCHAR(20)	NOT NULL,
	`auth_code`	VARCHAR(20)	NULL,
	`challenged_at`	DATETIME	NOT NULL,
	`completed_at`	DATETIME	NULL,
	`earned_point`	INT	NULL
);

CREATE TABLE `review` (
	`id`	BIGINT	NOT NULL,
	`member_id`	BIGINT	NOT NULL,
	`store_id`	BIGINT	NOT NULL,
	`member_mission_id`	BIGINT	NOT NULL,
	`score`	INT	NOT NULL,
	`content`	TEXT	NOT NULL,
	`status`	VARCHAR(20)	NOT NULL,
	`created_at`	DATETIME	NOT NULL,
	`updated_at`	DATETIME	NOT NULL
);

ALTER TABLE `region` ADD CONSTRAINT `PK_REGION` PRIMARY KEY (
	`id`
);

ALTER TABLE `food_category` ADD CONSTRAINT `PK_FOOD_CATEGORY` PRIMARY KEY (
	`id`
);

ALTER TABLE `member` ADD CONSTRAINT `PK_MEMBER` PRIMARY KEY (
	`id`
);

ALTER TABLE `member_prefer` ADD CONSTRAINT `PK_MEMBER_PREFER` PRIMARY KEY (
	`id`
);

ALTER TABLE `store` ADD CONSTRAINT `PK_STORE` PRIMARY KEY (
	`id`
);

ALTER TABLE `mission` ADD CONSTRAINT `PK_MISSION` PRIMARY KEY (
	`id`
);

ALTER TABLE `member_mission` ADD CONSTRAINT `PK_MEMBER_MISSION` PRIMARY KEY (
	`id`
);

ALTER TABLE `review` ADD CONSTRAINT `PK_REVIEW` PRIMARY KEY (
	`id`
);

