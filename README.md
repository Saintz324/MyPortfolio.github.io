# Eduardo Silva, Portfolio

A scroll-controlled 3D editorial portfolio. Next.js 16, React 19, React Three Fiber, GSAP ScrollTrigger, Lenis, Tailwind v4.

Live: https://saintz324.github.io/MyPortfolio.github.io/

```bash
npm run dev     # http://localhost:3000
npm run build   # static export to out/
```

## Deploy

Every push to `main` builds the static export and publishes it to GitHub Pages
(`.github/workflows/deploy.yml`). The workflow sets `PAGES_BASE_PATH=/MyPortfolio.github.io`;
local assets go through `lib/asset.ts` so they resolve under that path.

## Make it yours

All content lives in `data/`. Nothing personal is hardcoded in components.

| File | What to edit |
| --- | --- |
| `data/profile.ts` | name, role, email, location, availability, manifesto, socials, portrait |
| `data/skills.ts` | the nodes of the 3D skill system and their descriptions |
| `data/projects.ts` | case studies with images from `public/images/`. `url: null` shows "Case study in progress" instead of a link |
| `data/experience.ts` | timeline entries |

## How it works

- **One timeline.** `components/layout/SmoothScroll.tsx` runs Lenis, ScrollTrigger and the world store on a single GSAP ticker. Page scroll is turned into a continuous value `t` (0 hero, 1 about, 2 skills, 3 work, 4 experience, 5 contact, 6 end) from each `[data-scene]` section.
- **Scroll is the camera.** `lib/timeline.ts` holds keyframes that describe the whole 3D world at points on `t`: camera orbit, framing, sculpture scale and distortion, particle shape, skill nodes. `CameraController` samples them every frame and eases toward the result. To change the choreography, edit the keys.
- **No React renders per frame.** High-frequency values (scroll, velocity, pointer) live in the mutable `world` object (`lib/world.ts`). Low-frequency UI state (active skill, cursor label) uses small signals.
- **Particles morph on the GPU.** `ParticleField` stores four target shapes per particle (the braces, knot, ring, shell). The shader blends between them and scatters between shapes, so the chrome braces `{ }` fragment and re-form as you scroll. The brace curve lives in `lib/brace.ts` and is shared by the mesh and the particles.
- **Typography and 3D share one space.** The hero name, the About statement and the Experience title use `mix-blend-mode: difference` over the fixed WebGL layer. Keep those elements out of stacking contexts (no z-index, transform or sticky on their ancestors), or the blend stops seeing the canvas. The `body` background is intentionally transparent for the same reason.
- **Layers:** background -20, WebGL -10, content, poster 1, intro 2, hero name 3, nav 50, menu 60, grain 90, cursor 100.

## Accessibility and fallbacks

- `prefers-reduced-motion`: no intro, no Lenis smoothing, no camera travel, parallax or pointer physics. All content stays in place and readable.
- Touch devices: no custom cursor, lower DPR, fewer particles, simpler geometry, and the 3D subject is reframed below the text.
- The intro has a CSS failsafe, so the page appears even if scripts fail. Return visits within a session play it at 2.4x speed.
- Every 3D interaction has a DOM equivalent (the skills list drives the skill nodes by hover, focus, click or scroll).
