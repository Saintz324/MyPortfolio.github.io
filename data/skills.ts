/**
 * Skills rendered as nodes in the 3D skill system.
 * EDIT: keep only what you actually use and describe it in your own words.
 * No percentages on purpose: describe what you do with each tool.
 */

export type Skill = {
  name: string;
  area: string;
  description: string;
};

export const skills: Skill[] = [
  {
    name: "React",
    area: "Interface architecture",
    description: "Component systems that stay readable as interactions grow, with state kept out of the render path when motion needs every frame.",
  },
  {
    name: "Next.js",
    area: "Framework",
    description: "Server-first rendering, code splitting and image pipelines, so heavy creative work still loads fast.",
  },
  {
    name: "TypeScript",
    area: "Language",
    description: "Typed data, typed scenes, typed animation configs. Fewer surprises when a design changes late.",
  },
  {
    name: "Three.js",
    area: "Real-time 3D",
    description: "Custom shaders, particle systems and camera choreography driven by scroll and pointer input, written in GLSL when CSS cannot do it.",
  },
  {
    name: "Node.js",
    area: "Backend",
    description: "APIs and server logic with Express and Next.js route handlers, from auth to file uploads.",
  },
  {
    name: "PostgreSQL",
    area: "Data",
    description: "Relational schemas, queries and migrations for products that need to keep data safe for years.",
  },
  {
    name: "GSAP",
    area: "Motion",
    description: "Timelines and ScrollTrigger choreography with intentional easing, scrubbed directly by the scroll position.",
  },
  {
    name: "Tailwind CSS",
    area: "Styling",
    description: "Token-driven styling that keeps an art-directed layout consistent across breakpoints.",
  },
];
