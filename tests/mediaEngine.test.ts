import { describe, it, expect } from 'vitest';
import { detectDuplicates } from '../services/mediaEngine';

describe('detectDuplicates', () => {
  it('marks duplicates and selects primary by oldest date then largest size', () => {
    const files = [
      { id: 'a', name: 'one.jpg', size: 100, type: 'image/jpeg', lastModified: 1000, status: 'healthy', hash: 'h1' },
      { id: 'b', name: 'two.jpg', size: 200, type: 'image/jpeg', lastModified: 2000, status: 'healthy', hash: 'h1' },
      { id: 'c', name: 'three.jpg', size: 150, type: 'image/jpeg', lastModified: 500, status: 'healthy', hash: 'h2' },
    ] as any;

    const out = detectDuplicates(files);
    const a = out.find(f => f.id === 'a');
    const b = out.find(f => f.id === 'b');
    const c = out.find(f => f.id === 'c');

    expect(a).toBeDefined();
    expect(b).toBeDefined();
    expect(c).toBeDefined();

    // For hash h1, 'a' has older date (1000) vs 'b' (2000), so 'a' should be primary
    expect(a?.status).toBe('healthy');
    expect(b?.status).toBe('duplicate');
    expect(b?.duplicateOf).toBe('a');

    // c has unique hash -> healthy
    expect(c?.status).toBe('healthy');
  });
});
