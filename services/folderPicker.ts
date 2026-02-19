/* Simple wrapper for the native FolderPicker plugin */
declare const window: any;

export async function pickFolder(): Promise<any> {
  const plugin = window?.Capacitor?.Plugins?.FolderPicker || window?.FolderPicker;
  if (!plugin || typeof plugin.pickFolder !== 'function') {
    throw new Error('FolderPicker plugin not available');
  }

  try {
    const res = await plugin.pickFolder();
    const hasChildren = res && Array.isArray(res.children) && res.children.length > 0;
    // If provider returned a folder with children or at least a URI, return it
    if (hasChildren || (res && res.uri)) {
      return res;
    }
    // No folder contents available (e.g., cloud provider doesn't expose folders) -> fallback to file picker
    if (typeof plugin.pickFiles === 'function') {
      const files = await plugin.pickFiles();
      return { fallback: true, files: files?.children || files };
    }
    return res;
  } catch (e) {
    // On error, try file picker as fallback
    if (plugin && typeof plugin.pickFiles === 'function') {
      const files = await plugin.pickFiles();
      return { fallback: true, files: files?.children || files };
    }
    throw e;
  }
}

export async function pickFiles(): Promise<any> {
  const plugin = window?.Capacitor?.Plugins?.FolderPicker || window?.FolderPicker;
  if (!plugin || typeof plugin.pickFiles !== 'function') {
    throw new Error('FolderPicker plugin not available');
  }
  return await plugin.pickFiles();
}
