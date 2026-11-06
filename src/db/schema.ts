import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/** Columns shared by every list the admin panel can edit and reorder. */
const listColumns = () => ({
  id: integer().primaryKey({ autoIncrement: true }),
  sortOrder: integer("sort_order").notNull().default(0),
  published: integer({ mode: "boolean" }).notNull().default(true),
});

/** A single row (id = 1) holding the details shown at the top of the site. */
export const profile = sqliteTable("profile", {
  id: integer().primaryKey(),
  name: text().notNull(),
  headline: text().notNull(),
  tagline: text(),
  about: text(),
  location: text(),
  email: text(),
  photoUrl: text("photo_url"),
  resumeUrl: text("resume_url"),
  availableForWork: integer("available_for_work", { mode: "boolean" }).notNull().default(false),
});

export const experience = sqliteTable("experience", {
  ...listColumns(),
  role: text().notNull(),
  company: text().notNull(),
  companyUrl: text("company_url"),
  location: text(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date"),
  summary: text(),
  technologies: text(),
});

export const projects = sqliteTable("projects", {
  ...listColumns(),
  title: text().notNull(),
  summary: text().notNull(),
  imageUrl: text("image_url"),
  liveUrl: text("live_url"),
  repoUrl: text("repo_url"),
  technologies: text(),
});

export const skills = sqliteTable("skills", {
  ...listColumns(),
  name: text().notNull(),
  category: text().notNull(),
});

export const education = sqliteTable("education", {
  ...listColumns(),
  institution: text().notNull(),
  credential: text().notNull(),
  startDate: text("start_date"),
  endDate: text("end_date"),
  summary: text(),
});

export const links = sqliteTable("links", {
  ...listColumns(),
  label: text().notNull(),
  url: text().notNull(),
});

/** Failed-login counters. Kept in the database because serverless instances share no memory. */
export const loginAttempts = sqliteTable("login_attempts", {
  key: text().primaryKey(),
  count: integer().notNull(),
  windowStartedAt: integer("window_started_at").notNull(),
});
