
export type MediaStatus = 'healthy' | 'needs_fix' | 'duplicate' | 'optimized' | 'pending_move' | 'moved' | 'deleted' | 'corrupted';
export type UserTier = 'free' | 'pro';

export interface MediaFile {
  id: string;
  name: string;
  size: number;
  type: string;
  lastModified: number;
  capturedDate?: string;
  suggestedDate?: string;
  recoveryMethod?: 'JSON' | 'EXIF' | 'Filename' | 'Filesystem' | 'None';
  status: MediaStatus;
  thumbnailUrl: string;
  hash: string;
  visualHash?: string;
  duplicateOf?: string;
  relativePath?: string;
  proposedPath?: string; 
  originalPath?: string;
  hasSidecar?: boolean;
  sidecarPath?: string;
  deletedAt?: number; // Forensic timestamp for trash retention
}

export interface LibraryStats {
  totalFiles: number;
  totalSize: number;
  duplicatesFound: number;
  timeIssuesFound: number;
  optimizedSize: number;
  rootFolderName?: string;
  jsonFilesFound: number;
  heicCount: number;
  actualRecoveredSpace: number;
  trashCount: number;
}

export interface ActionLog {
  id: string;
  timestamp: string;
  action: 'FIX_TIMESTAMP' | 'REMOVE_DUPLICATE' | 'ORGANIZE' | 'AI_ANALYSIS' | 'OPTIMIZE' | 'CLEANUP_JSON' | 'ERROR' | 'UNDO' | 'RESTORE';
  details: string;
  filesAffected: string[];
  snapshot?: MediaFile[]; // For undo
  undone: boolean;
}

export type ConflictRule = 'rename' | 'skip' | 'overwrite';
export type DuplicateRule = 'exact' | 'visual';

export interface UserSettings {
  cameraFormat: 'JPEG' | 'PNG' | 'HEIC';
  cameraResolution: '720p' | '1080p' | '4K';
  storageLocation: 'Internal Library' | 'External Drive' | 'Cloud Sync';
  autoOptimize: boolean;
  renamePattern: string;
  deleteJsonAfter: boolean;
  autoOrganize: boolean;
  conflictRule: ConflictRule;
  duplicateRule: DuplicateRule;
  dryRun: boolean;
  backupMode: boolean;
  theme: 'light' | 'dark' | 'system';
  tier: UserTier;
}

export enum AppView {
  SCANNER = 'SCANNER',
  DASHBOARD = 'DASHBOARD',
  BROWSER = 'BROWSER',
  RECOVERY = 'RECOVERY',
  DUPLICATES = 'DUPLICATES',
  ORGANIZE = 'ORGANIZE',
  REPORTS = 'REPORTS',
  SETTINGS = 'SETTINGS',
  AI_LAB = 'AI_LAB',
  VERIFICATION = 'VERIFICATION',
  TRASH = 'TRASH'
}

export interface TourStep {
  targetId: string;
  title: string;
  description: string;
  expectation: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}
