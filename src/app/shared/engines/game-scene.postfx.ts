import { IUniform, Vector2 } from 'three';

/** Post suave — solo vignette y calidez, sin efectos invasivos */
export const SoftVignetteShader = {
  uniforms: {
    tDiffuse: { value: null },
    uVignette: { value: 0.38 },
    uWarmth: { value: 0.04 },
  } as Record<string, IUniform>,

  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uVignette;
    uniform float uWarmth;
    varying vec2 vUv;

    void main() {
      vec2 dir = vUv - 0.5;
      float dist = length(dir);
      vec3 color = texture2D(tDiffuse, vUv).rgb;
      color += vec3(uWarmth * 0.6, uWarmth * 0.35, uWarmth * 0.1);
      color *= smoothstep(1.1, 0.35, dist * (1.0 + uVignette));
      gl_FragColor = vec4(color, 1.0);
    }
  `,
};

export interface PostFxPreset {
  bloomStrength: number;
  bloomRadius: number;
  bloomThreshold: number;
  bloomResolutionScale: number;
  vignette: number;
  warmth: number;
  exposure: number;
  enabled: boolean;
}

export const POSTFX_PRESETS: Record<'login' | 'ambient', PostFxPreset> = {
  login: {
    bloomStrength: 0.32,
    bloomRadius: 0.38,
    bloomThreshold: 0.72,
    bloomResolutionScale: 0.5,
    vignette: 0.34,
    warmth: 0.035,
    exposure: 1.0,
    enabled: true,
  },
  ambient: {
    bloomStrength: 0,
    bloomRadius: 0,
    bloomThreshold: 1,
    bloomResolutionScale: 0.4,
    vignette: 0.42,
    warmth: 0.02,
    exposure: 0.98,
    enabled: false,
  },
};
