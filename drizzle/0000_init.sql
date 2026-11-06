CREATE TABLE `education` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`published` integer DEFAULT true NOT NULL,
	`institution` text NOT NULL,
	`credential` text NOT NULL,
	`start_date` text,
	`end_date` text,
	`summary` text
);
--> statement-breakpoint
CREATE TABLE `experience` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`published` integer DEFAULT true NOT NULL,
	`role` text NOT NULL,
	`company` text NOT NULL,
	`company_url` text,
	`location` text,
	`start_date` text NOT NULL,
	`end_date` text,
	`summary` text,
	`technologies` text
);
--> statement-breakpoint
CREATE TABLE `links` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`published` integer DEFAULT true NOT NULL,
	`label` text NOT NULL,
	`url` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `login_attempts` (
	`key` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL,
	`window_started_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `profile` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`headline` text NOT NULL,
	`tagline` text,
	`about` text,
	`location` text,
	`email` text,
	`photo_url` text,
	`resume_url` text,
	`available_for_work` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`published` integer DEFAULT true NOT NULL,
	`title` text NOT NULL,
	`summary` text NOT NULL,
	`image_url` text,
	`live_url` text,
	`repo_url` text,
	`technologies` text
);
--> statement-breakpoint
CREATE TABLE `skills` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`published` integer DEFAULT true NOT NULL,
	`name` text NOT NULL,
	`category` text NOT NULL
);
