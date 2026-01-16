import { LucideIcon } from 'lucide-react';

export interface GridItem {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  colSpan: number; // Tailwind grid-col-span
  rowSpan: number; // Tailwind grid-row-span
  bgClass: string; // Background color class
  textClass: string; // Text color class
  type: 'logo' | 'content' | 'stat';
  icon?: LucideIcon;
  imageUrl?: string;
  hasContent?: boolean; // New: does this tile have a detail page?
}

export interface VisionItem {
  id: string;
  label: string;
  icon: LucideIcon;
  description: string;
}