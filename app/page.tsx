import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { Background } from "@/components/layout/Background";
import { SceneLoader } from "@/components/three/SceneLoader";
import { Nav } from "@/components/navigation/Nav";
import { Cursor } from "@/components/ui/Cursor";
import { Intro } from "@/components/intro/Intro";
import { Hero } from "@/components/hero/Hero";
import { About } from "@/components/about/About";
import { Skills } from "@/components/skills/Skills";
import { Projects } from "@/components/projects/Projects";
import { Experience } from "@/components/experience/Experience";
import { Contact } from "@/components/contact/Contact";

/**
 * One continuous scene. Section order defines the 3D timeline (see lib/timeline.ts):
 * each `data-scene` index is a camera keyframe.
 */
export default function Home() {
  return (
    <SmoothScroll>
      <Background />
      <SceneLoader />
      <Nav />
      <main>
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Experience />
        <Contact />
      </main>
      <Intro />
      <Cursor />
    </SmoothScroll>
  );
}
