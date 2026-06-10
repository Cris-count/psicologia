import Phaser from 'phaser';
import { ISO_CONFIG, ISO_ATLAS_KEYS } from './iso.config';
import type { IsoAtlasDef } from './iso.types';
import { ISO_ATLASES, ISO_BOOT_PREVIEW } from './iso.atlas';

export type IsoLoadPhase = 'critical' | 'deferred';

export interface IsoLoadItem {
  key: string;
  url: string;
  type: 'image' | 'spritesheet' | 'tilemap' | 'atlas';
  jsonUrl?: string;
  fw?: number;
  fh?: number;
  phase: IsoLoadPhase;
}

export function isoBootPreviewUrl(): string {
  return ISO_BOOT_PREVIEW;
}

export function isoLoadManifest(): IsoLoadItem[] {
  const fw = ISO_CONFIG.characterFrameW;
  const fh = ISO_CONFIG.characterFrameH;
  const list: IsoLoadItem[] = [
    { key: ISO_CONFIG.mapKey, url: ISO_CONFIG.mapUrl, type: 'tilemap', phase: 'critical' },
    { key: ISO_CONFIG.tilesetKey, url: ISO_CONFIG.tilesetImage, type: 'image', phase: 'critical' },
    { key: 'iso-boot-preview', url: ISO_BOOT_PREVIEW, type: 'image', phase: 'critical' },
    { key: 'iso-student-sheet', url: '/assets/iso/characters/student-sheet.png', type: 'spritesheet', fw, fh, phase: 'critical' },
    { key: 'iso-gary-sheet', url: '/assets/iso/characters/gary-sheet.png', type: 'spritesheet', fw, fh, phase: 'critical' },
    { key: 'iso-npc-sheet', url: '/assets/iso/characters/npc-sheet.png', type: 'spritesheet', fw, fh, phase: 'critical' },
  ];

  for (const atlas of ISO_ATLASES) {
    list.push({
      key: atlas.key,
      url: atlas.url,
      jsonUrl: atlas.jsonUrl,
      type: 'atlas',
      phase: atlas.lazy ? 'deferred' : 'critical',
    });
  }
  return list;
}

export function resolveSpriteTexture(
  scene: Phaser.Scene,
  spriteKey: string,
): { texture: string; frame?: string | number } {
  if (scene.textures.exists(ISO_ATLAS_KEYS.buildings) && scene.textures.get(ISO_ATLAS_KEYS.buildings).has(spriteKey)) {
    return { texture: ISO_ATLAS_KEYS.buildings, frame: spriteKey };
  }
  if (scene.textures.exists(ISO_ATLAS_KEYS.props) && scene.textures.get(ISO_ATLAS_KEYS.props).has(spriteKey)) {
    return { texture: ISO_ATLAS_KEYS.props, frame: spriteKey };
  }
  if (scene.textures.exists(spriteKey)) {
    return { texture: spriteKey };
  }
  return { texture: spriteKey };
}

export function queueDeferredLoad(scene: Phaser.Scene, onProgress?: (pct: number, label: string) => void): Promise<void> {
  const deferred = isoLoadManifest().filter((a) => a.phase === 'deferred' && a.type === 'atlas');
  const pending = deferred.filter((a) => !scene.textures.exists(a.key));
  if (!pending.length) return Promise.resolve();

  return new Promise((resolve) => {
    scene.load.on('progress', (v: number) => onProgress?.(85 + Math.round(v * 12), 'Vegetación y props'));
    scene.load.on('complete', () => {
      scene.load.off('progress');
      scene.load.off('complete');
      resolve();
    });
    for (const a of pending) {
      scene.load.atlas(a.key, a.url, a.jsonUrl!);
    }
    scene.load.start();
  });
}
