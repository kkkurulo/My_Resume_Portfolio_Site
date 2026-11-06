import { asc, eq } from "drizzle-orm";
import { db } from "./index";
import { education, experience, links, profile, projects, skills } from "./schema";

export type Profile = typeof profile.$inferSelect;

/** Shown until the owner fills in the profile form. */
const emptyProfile: Profile = {
  id: 1,
  name: "Your Name",
  headline: "Your role",
  tagline: null,
  about: null,
  location: null,
  email: null,
  photoUrl: null,
  resumeUrl: null,
  availableForWork: false,
};

export async function getProfile(): Promise<Profile> {
  const [row] = await db.select().from(profile).where(eq(profile.id, 1));
  return row ?? emptyProfile;
}

export async function getSiteContent() {
  const [me, experienceRows, projectRows, skillRows, educationRows, linkRows] = await Promise.all([
    getProfile(),
    db.select().from(experience).where(eq(experience.published, true)).orderBy(asc(experience.sortOrder), asc(experience.id)),
    db.select().from(projects).where(eq(projects.published, true)).orderBy(asc(projects.sortOrder), asc(projects.id)),
    db.select().from(skills).where(eq(skills.published, true)).orderBy(asc(skills.sortOrder), asc(skills.id)),
    db.select().from(education).where(eq(education.published, true)).orderBy(asc(education.sortOrder), asc(education.id)),
    db.select().from(links).where(eq(links.published, true)).orderBy(asc(links.sortOrder), asc(links.id)),
  ]);

  return {
    profile: me,
    experience: experienceRows,
    projects: projectRows,
    skills: skillRows,
    education: educationRows,
    links: linkRows,
  };
}
