import { LibraryStats } from "../types";

/**
 * NOTE: For security, the frontend must not call the provider SDK directly.
 * This module proxies AI requests through a trusted backend API endpoint.
 */

async function postJSON(path: string, body: any) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  try {
    const consent = typeof window !== 'undefined' ? localStorage.getItem('ai_consent') : null;
    if (consent === 'true') headers['x-user-consent'] = 'true';
  } catch (e) {
    // ignore
  }

  const res = await fetch(path, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`AI proxy error: ${res.status} ${text}`);
  }
  return res.json();
}

export const generateDiagnostic = async (stats: LibraryStats): Promise<string> => {
  const payload = { stats };
  const result = await postJSON('/api/ai/diagnostic', payload);
  return result?.text || "";
};

export const analyzeMedia = async (files: { id: string, data?: string, mimeType?: string, metadata?: any }[], userPrompt: string): Promise<string> => {
  const payload = { images: files, prompt: userPrompt };
  const result = await postJSON('/api/ai/analyze', payload);
  return result?.text || '';
};

export const quickChat = async (message: string, history: any[] = []): Promise<string> => {
  const payload = { message, history };
  const result = await postJSON('/api/ai/chat', payload);
  return result?.text || '';
};

export const detectVisualDuplicatesAI = async (images: { id: string, data: string, mimeType: string, metadata: any }[]) => {
  const payload = { images };
  const result = await postJSON('/api/ai/analyze', { prompt: 'Find visual duplicates and return JSON clusters', images });
  try {
    return JSON.parse(result?.text || '{"clusters":[]}').clusters || [];
  } catch (e) {
    return [];
  }
};

export async function blobUrlToBase64(url: string): Promise<string> {
  const response = await fetch(url);
  const blob = await response.blob();
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
