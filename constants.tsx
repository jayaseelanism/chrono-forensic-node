
import { 
  Home,
  LayoutDashboard, 
  Search, 
  BrainCircuit, 
  History, 
  Copy, 
  Layers, 
  Trash2, 
  Settings,
  ShieldCheck,
  Activity
} from 'lucide-react';
import { AppView } from './types';

export const COLORS = {
  primary: '#6366F1',
  secondary: '#A855F7',
  background: '#F8FAFC',
  surface: 'rgba(255, 255, 255, 0.7)',
};

export const NAVIGATION_ITEMS = [
  { id: 'SCANNER', label: 'Home', icon: <Home size={20} /> },
  { id: 'DASHBOARD', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { id: 'BROWSER', label: 'Vault', icon: <Search size={20} /> },
  { id: 'AI_LAB', label: 'Oracle', icon: <BrainCircuit size={20} /> },
  { id: 'RECOVERY', label: 'Repair', icon: <History size={20} /> },
  { id: 'DUPLICATES', label: 'Duplicates', icon: <Copy size={20} /> },
  { id: 'ORGANIZE', label: 'Organize', icon: <Layers size={20} /> },
  { id: 'TRASH', label: 'Bin', icon: <Trash2 size={20} /> },
  { id: 'SETTINGS', label: 'Settings', icon: <Settings size={20} /> },
];
