import { RPM_CREATOR, RPM_SUBDOMAIN } from './rpm.config';

/** Extrae el ID del avatar desde una URL de Ready Player Me. */
export function extractRpmAvatarId(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  const glbMatch = trimmed.match(/\/([a-f0-9]{24})\.glb/i);
  if (glbMatch) return glbMatch[1];

  const pathMatch = trimmed.match(/\/avatars\/([a-f0-9]{24})/i);
  if (pathMatch) return pathMatch[1];

  return null;
}

/** URL optimizada para render en Three.js (calidad media, morfos faciales). */
export function toDisplayGlbUrl(url: string): string {
  const id = extractRpmAvatarId(url);
  if (!id) return url;

  const params = new URLSearchParams({
    quality: 'medium',
    meshLod: '1',
    morphTargets: 'ARKit,Eyes Extra,Oculus Visemes',
    textureAtlas: 'none',
  });

  return `https://models.readyplayer.me/${id}.glb?${params.toString()}`;
}

/** URL del iframe del Avatar Creator. */
export function buildRpmCreatorUrl(existingAvatarUrl?: string | null): string {
  const params = new URLSearchParams({
    bodyType: RPM_CREATOR.bodyType,
    language: RPM_CREATOR.language,
  });

  if (RPM_CREATOR.quickStart) params.set('quickStart', 'true');
  if (RPM_CREATOR.clearCache) params.set('clearCache', 'true');

  const id = existingAvatarUrl ? extractRpmAvatarId(existingAvatarUrl) : null;
  if (id) params.set('id', id);

  return `https://${RPM_SUBDOMAIN}.readyplayer.me/avatar?frameApi&${params.toString()}`;
}

export function parseRpmMessage(data: unknown): import('./rpm.types').RpmFrameMessage | null {
  if (!data) return null;
  if (typeof data === 'string') {
    try {
      return JSON.parse(data) as import('./rpm.types').RpmFrameMessage;
    } catch {
      return null;
    }
  }
  if (typeof data === 'object') {
    return data as import('./rpm.types').RpmFrameMessage;
  }
  return null;
}

export function isRpmMessage(msg: import('./rpm.types').RpmFrameMessage | null): boolean {
  return msg?.source === 'readyplayerme';
}
