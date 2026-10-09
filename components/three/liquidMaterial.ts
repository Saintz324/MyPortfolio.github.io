import { MeshPhysicalMaterial, type IUniform } from "three";

/**
 * Dark liquid chrome: a physical material whose surface ripples along its normals.
 * Unlike a radial distortion, this works on any shape (here: tube-built braces),
 * so the stroke undulates without the silhouette scaling.
 */
export type LiquidMaterial = MeshPhysicalMaterial & {
  uniforms: { uTime: IUniform<number>; uAmp: IUniform<number> };
};

const noise = /* glsl */ `
  vec4 lq_perm(vec4 x){ return mod(((x * 34.0) + 1.0) * x, 289.0); }
  float lq_noise(vec3 p){
    vec3 a = floor(p);
    vec3 d = p - a;
    d = d * d * (3.0 - 2.0 * d);
    vec4 b = a.xxyy + vec4(0.0, 1.0, 0.0, 1.0);
    vec4 k1 = lq_perm(b.xyxy);
    vec4 k2 = lq_perm(k1.xyxy + b.zzww);
    vec4 c = k2 + a.zzzz;
    vec4 k3 = lq_perm(c);
    vec4 k4 = lq_perm(c + 1.0);
    vec4 o1 = fract(k3 * (1.0 / 41.0));
    vec4 o2 = fract(k4 * (1.0 / 41.0));
    vec4 o3 = o2 * d.z + o1 * (1.0 - d.z);
    vec2 o4 = o3.yw * d.x + o3.xz * (1.0 - d.x);
    return o4.y * d.y + o4.x * (1.0 - d.y);
  }
`;

export function createLiquidMaterial(): LiquidMaterial {
  const material = new MeshPhysicalMaterial({
    color: "#0c0c0c",
    metalness: 1,
    roughness: 0.14,
    envMapIntensity: 1.4,
    clearcoat: 1,
    clearcoatRoughness: 0.2,
    transparent: true,
  }) as LiquidMaterial;

  material.uniforms = { uTime: { value: 0 }, uAmp: { value: 0 } };

  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = material.uniforms.uTime;
    shader.uniforms.uAmp = material.uniforms.uAmp;
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", `#include <common>\nuniform float uTime;\nuniform float uAmp;\n${noise}`)
      .replace(
        "#include <begin_vertex>",
        /* glsl */ `
        vec3 transformed = vec3(position);
        float lq = lq_noise(position * 3.2 + vec3(0.0, uTime * 0.9, uTime * 0.4)) - 0.5;
        transformed += normal * lq * uAmp;
        `,
      );
  };
  return material;
}
