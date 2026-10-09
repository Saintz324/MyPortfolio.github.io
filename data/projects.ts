/**
 * Selected work.
 * Images live in /public/images. `url: null` shows a "case study in progress" note instead of a link.
 */

export type Project = {
  title: string;
  discipline: string;
  role: string;
  year: string;
  summary: string;
  url: string | null;
  /** Button text, defaults to "View project". */
  linkLabel?: string;
  image: { src: string; alt: string };
};

export const projects: Project[] = [
  {
    title: "Memorali",
    discipline: "Next.js, React, PostgreSQL",
    role: "Design and development",
    year: "2026",
    summary: "Travel albums from a camera roll. Upload a trip, Memorali orders it by date and place, you pick one of five styles and share it through a private link that opens on any phone.",
    url: "https://www.memorali.eu",
    image: {
      src: "/images/memorali-album.jpg",
      alt: "Memorali album spread titled Norway, with travel photos laid out across two pages",
    },
  },
  {
    title: "This Portfolio",
    discipline: "Three.js, GSAP, Next.js",
    role: "Design and development",
    year: "2026",
    summary: "A scroll-controlled 3D editorial world built with Next.js, React Three Fiber, GSAP and Lenis.",
    url: "https://github.com/Saintz324/MyPortfolio.github.io",
    linkLabel: "View source",
    image: {
      src: "/images/portfolio.jpg",
      alt: "The portfolio hero: a black and white portrait with the name Eduardo Silva across it",
    },
  },
];
