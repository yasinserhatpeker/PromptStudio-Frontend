import { TrendingUp, GraduationCap, PenTool, Activity, Plane, LayoutGrid, FolderOpen } from 'lucide-react';

// Category Definitions with INTEGER IDs (Source of Truth)
export const CATEGORY_DEFINITIONS = [
  { id: 1, label: 'Investing', icon: TrendingUp, color: '#34D399', bgColor: 'rgba(52, 211, 153, 0.1)' },
  { id: 2, label: 'Homework', icon: GraduationCap, color: '#60A5FA', bgColor: 'rgba(96, 165, 250, 0.1)' },
  { id: 3, label: 'Writing', icon: PenTool, color: '#A78BFA', bgColor: 'rgba(167, 139, 250, 0.1)' },
  { id: 4, label: 'Health', icon: Activity, color: '#F87171', bgColor: 'rgba(248, 113, 113, 0.1)' },
  { id: 5, label: 'Travel', icon: Plane, color: '#FBBF24', bgColor: 'rgba(251, 191, 36, 0.1)' },
] as const;

// System Categories (All Chats, Uncategorized)
export const SYSTEM_CATEGORIES = [
  { id: null, label: 'All Chats', icon: LayoutGrid, color: '#9CA3AF', bgColor: 'rgba(156, 163, 175, 0.1)' },
  { id: 'uncategorized', label: 'Uncategorized', icon: FolderOpen, color: '#9CA3AF', bgColor: 'rgba(156, 163, 175, 0.1)' },
] as const;
