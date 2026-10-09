/**
 * Personal information.
 * Everything visible on the site about you comes from the files in /data.
 * Values marked `EDIT` are placeholders: replace them with your real details.
 */

export type SocialLink = {
  label: string;
  href: string;
  handle: string;
  icon: "github" | "linkedin" | "instagram" | "x" | "dribbble";
};

export const profile = {
  firstName: "Eduardo",
  lastName: "Silva",
  role: ["Creative", "Developer"],
  /** EDIT: the short line under your role in the hero. */
  availability: "Available for new projects",
  /** EDIT: city / country shown in the footer. */
  location: "Portugal",
  email: "EduardosilvaDev@hotmail.com",
  /** Manifesto shown in the About section. Words wrapped in *asterisks* are highlighted. */
  manifesto: [
    "I don't just write code. I build experiences.",
    "I care about how something *feels*, *moves*, *responds* and *communicates*.",
    "Every interface is a material with weight, timing and texture. My job is to make that material behave.",
  ],
  bio: "Full-stack developer at FRPC, based in Portugal. I build web products end to end with Next.js, React and PostgreSQL, and interactive experiences with Three.js and motion.",
  /** Large scroll-driven line in the About section. */
  statement: "Form follows feeling",
  contactStatement: ["Let's build", "something", "unforgettable."],
  socials: [
    // EDIT: add LinkedIn / Instagram here once you have the URLs (icons: "linkedin", "instagram", "x", "dribbble").
    { label: "GitHub", href: "https://github.com/saintz324", handle: "@saintz324", icon: "github" },
  ] satisfies SocialLink[],
  portrait: {
    src: "/images/portrait.jpg",
    width: 1448,
    height: 1086,
    alt: "Black and white profile portrait of Eduardo Silva looking to the right",
  },
} as const;

export const fullName = `${profile.firstName} ${profile.lastName}`;

export const navItems = [
  { id: "about", label: "About" },
  { id: "work", label: "Work" },
  { id: "skills", label: "Skills" },
  { id: "experience", label: "Experience" },
  { id: "contact", label: "Contact" },
] as const;
