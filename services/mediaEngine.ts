
import { MediaFile, MediaStatus } from '../types';

/**
 * MediaRegistry: High-Performance Singleton.
 * Manages raw File objects and object URLs with aggressive garbage collection.
 */
class MediaRegistry {
  private static instance: MediaRegistry;
  private files = new Map<string, File>();
  private urlCache = new Map<string, string>();

  private constructor() {}

  static getInstance() {
    if (!MediaRegistry.instance) MediaRegistry.instance = new MediaRegistry();
    return MediaRegistry.instance;
  }

  register(id: string, file: File) {
    this.files.set(id, file);
  }

  getFile(id: string) {
    return this.files.get(id);
  }

  getThumbnailUrl(id: string): string {
    if (this.urlCache.has(id)) return this.urlCache.get(id)!;
    const file = this.files.get(id);
    if (!file) return '';
    const url = URL.createObjectURL(file);
    this.urlCache.set(id, url);
    return url;
  }

  revokeUrl(id: string) {
    const url = this.urlCache.get(id);
    if (url) {
      URL.revokeObjectURL(url);
      this.urlCache.delete(id);
    }
  }

  clear() {
    this.urlCache.forEach(url => URL.revokeObjectURL(url));
    this.urlCache.clear();
    this.files.clear();
  }
}

export const registry = MediaRegistry.getInstance();

/**
 * Optimized Fingerprinting:
 * Samples 16KB of the head + file size to create a unique forensic signature in <1ms.
 */
export const generateFingerprint = async (file: File): Promise<string> => {
  const SAMPLE_SIZE = 16384;
  try {
    const slice = file.slice(0, SAMPLE_SIZE);
    const buffer = await slice.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-1', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const contentHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return `${file.size}-${contentHash}`;
  } catch (e) {
    return `${file.size}-${file.lastModified}-${file.name.length}`;
  }
};

/**
 * Deep Path Generation:
 * Enforces Year / Month structure based on the best available timestamp.
 */
export const getProposedPath = (file: { lastModified: number, name: string, suggestedDate?: string }) => {
  const date = new Date(file.suggestedDate ? Number(file.suggestedDate) : file.lastModified);
  const yyyy = date.getFullYear();
  const months = ["01_Jan", "02_Feb", "03_Mar", "04_Apr", "05_May", "06_Jun", "07_Jul", "08_Aug", "09_Sep", "10_Oct", "11_Nov", "12_Dec"];
  const mm = months[date.getMonth()];
  return `${yyyy}/${mm}/${file.name}`;
};

export const quickProcess = async (file: File): Promise<MediaFile> => {
  const id = Math.random().toString(36).substring(2, 12);
  const fingerprint = await generateFingerprint(file);
  registry.register(id, file);

  const initialPath = getProposedPath({ lastModified: file.lastModified, name: file.name });

  return {
    id,
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified,
    status: 'healthy',
    thumbnailUrl: '', // LAZY LOADED
    hash: fingerprint,
    proposedPath: initialPath,
    originalPath: file.name,
    relativePath: (file as any).webkitRelativePath || file.name,
  };
};

export const detectDuplicates = (files: MediaFile[]): MediaFile[] => {
  // Group files by fingerprint/hash
  const groups = new Map<string, MediaFile[]>();
  for (const f of files) {
    const key = f.hash || `${f.size}-${f.lastModified}-${f.name.length}`;
    const arr = groups.get(key) || [];
    arr.push(f);
    groups.set(key, arr);
  }

  const result: MediaFile[] = [];
  for (const [hash, group] of groups.entries()) {
    if (group.length === 1) {
      result.push({ ...group[0], status: group[0].status === 'duplicate' ? 'healthy' : group[0].status });
      continue;
    }

    // Determine primary: oldest captured date (lastModified) wins; tie-breaker: largest size
    let primary = group[0];
    for (const g of group) {
      if ((g.lastModified || 0) < (primary.lastModified || 0)) primary = g;
      else if ((g.lastModified || 0) === (primary.lastModified || 0) && g.size > primary.size) primary = g;
    }

    for (const f of group) {
      if (f.id === primary.id) {
        result.push({ ...f, status: 'healthy', duplicateOf: undefined });
      } else {
        result.push({ ...f, status: 'duplicate', duplicateOf: primary.id });
      }
    }
  }

  // preserve original ordering by mapping back to input order
  const byId = new Map(result.map(r => [r.id, r]));
  return files.map(f => byId.get(f.id) || f);
};
