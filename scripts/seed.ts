import { client, db } from "../src/db";
import { education, experience, profile, projects, skills } from "../src/db/schema";

// First-time content, taken from the CV. After this, the admin panel is the source of truth,
// so seeding never touches a database that already has a profile.
if ((await db.select().from(profile)).length > 0) {
  console.log("The database already has a profile, so nothing was changed.");
  process.exit(0);
}

await db.insert(profile).values({
  id: 1,
  name: "Kyrylo Chornopyskyi",
  headline: "Backend Developer (.NET)",
  tagline: "Designing scalable RESTful services with Clean Architecture, SOLID principles and rigorous unit testing.",
  about: [
    "Backend Developer with over 1.5 years of hands-on experience building robust software solutions within the .NET ecosystem. Dedicated to designing scalable RESTful services, optimizing database architectures, and ensuring high code quality through Clean Architecture, SOLID principles, and rigorous unit testing.",
    "Beyond my primary tech stack, I possess a versatile technical foundation across multiple programming languages and academic experience in NLP and semantic analysis, backed by a co-authored scientific publication.",
    "This blend of practical engineering skills and an analytical, research-oriented mindset enables me to effectively tackle both everyday business requirements and complex algorithmic challenges.",
  ].join("\n\n"),
  location: "Ternopil, Ukraine",
  email: "chornopyskyikurulo@gmail.com",
  resumeUrl: "/Chornopyskyi_Kyrylo_CV.pdf",
  availableForWork: false,
});

await db.insert(experience).values([
  {
    sortOrder: 0,
    role: "C# Developer",
    company: "MagView",
    startDate: "2026-07",
    endDate: "2026-11",
    summary:
      "Contributed to two distinct software projects within the healthcare industry, balancing dual priorities to deliver tailored technical solutions that streamlined medical workflows and improved overall system efficiency.",
  },
  {
    sortOrder: 1,
    role: "C# Developer",
    company: "Memberworks",
    startDate: "2025-11",
    endDate: "2026-07",
    summary:
      "Developed and optimized software solutions for membership and subscription platforms, focusing on improving system performance and enhancing the user experience.",
  },
]);

await db.insert(projects).values([
  {
    sortOrder: 0,
    title: "Dimensional Hell",
    summary: "A platformer made for Brackeys Game Jam 2026 over two weeks in February 2026.",
  },
  {
    sortOrder: 1,
    title: "Issue-tracking management platform",
    summary: "A non-commercial project with Eleks, built over two months from July to August 2024.",
  },
]);

const skillGroups: Record<string, string[]> = {
  "Programming Languages": ["C#", "Java", "C++", "Basic Python", "JavaScript", "TypeScript"],
  "Frameworks & Platforms": ["ASP.NET", "Entity Framework", "Qt", "Node.js", "Unity", "FoxPro"],
  "Frontend Technologies": ["HTML5", "CSS3", "Basic React.js", "jQuery", "Responsive Web Design", "Basic Angular"],
  Databases: ["SQL", "Microsoft SQL Server", "MySQL", "PostgreSQL", "LINQ"],
  "Software Engineering & Architecture": [
    "RESTful Web Services",
    "Clean Architecture",
    "SOLID Principles",
    "Object-Oriented Programming (OOP)",
    "Dependency Injection (DI)",
    "Design Patterns",
    "AI-assisted Development (Claude, GitHub Copilot)",
  ],
  Testing: ["Unit Testing (xUnit/NUnit)", "Mocking Strategies"],
  "Spoken Languages": ["Ukrainian", "English (Intermediate/Upper-Intermediate)"],
};

await db.insert(skills).values(
  Object.entries(skillGroups)
    .flatMap(([category, names]) => names.map((name) => ({ name, category })))
    .map((skill, sortOrder) => ({ ...skill, sortOrder })),
);

await db.insert(education).values({
  institution: "Ternopil Ivan Puluj National Technical University",
  credential: "Software Engineering",
  startDate: "2023-09",
  endDate: "2027-07",
  summary: "Fourth-year student. Ternopil, Ukraine.",
});

// The CV lists no public profile links, so the links table starts empty.

client.close();
console.log("Added the content from the CV.");
