/** Deepest layers: near-black base, soft light falloff, a faint grid and a vignette. Plus film grain on top of everything. */
export function Background() {
  return (
    <>
      <div className="backdrop pointer-events-none fixed inset-0 -z-20" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />
    </>
  );
}
