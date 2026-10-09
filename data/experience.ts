/**
 * Experience timeline, newest first.
 * Source: your CV. Edit freely; entries without a stack simply hide that line.
 */

export type ExperienceItem = {
  company: string;
  role: string;
  /** Leave out when unknown; the date column then stays empty. */
  period?: string;
  description: string;
  stack: string[];
};

export const experience: ExperienceItem[] = [
  {
    company: "FRPC",
    role: "Full-stack developer",
    period: "Jul 2026 - Present",
    description: "Building and maintaining web applications across the front end and the back end.",
    stack: [],
  },
  {
    company: "FRPC",
    role: "Full-stack development intern",
    period: "Feb 2026 - Jul 2026",
    description: "Internship that led to a full-time role on the development team.",
    stack: [],
  },
  {
    company: "IGEC, Lisbon",
    role: "Web developer",
    period: "Sep 2024 - Oct 2024",
    description: "Built a web application about the External Evaluation of Schools, working in a team against fixed deadlines.",
    stack: ["PHP", "Bootstrap", "JavaScript", "CSS"],
  },
  {
    company: "SIHOT, Barreiro",
    role: "Software development intern",
    period: "Mar 2024 - Jul 2024",
    description: "Fixed production bugs such as duplicated data, misplaced labels and functions that were not initialised properly, and implemented new functions, tables, buttons, icons and events.",
    stack: [],
  },
  {
    company: "IGEC, Lisbon",
    role: "Intern",
    period: "Jun 2023 - Jul 2023",
    description: "Wrote a guide for keeping Microsoft Edge compatible with Internet Explorer 11 and built an internal mini site about External Evaluations of Schools.",
    stack: [],
  },
  {
    company: "Escola Secundária de Santo André",
    role: "IT Systems Management and Programming",
    period: "2021 - Present",
    description: "Professional technical course in systems management and programming.",
    stack: [],
  },
];
