import { 
  Building2, 
  TrendingUp, 
  Users, 
  Lightbulb, 
  Globe, 
  ShieldCheck, 
  Zap, 
  BarChart3, 
  Monitor, 
  Cpu, 
  Briefcase, 
  GraduationCap, 
  Menu, 
  CheckCircle2, 
  Rocket, 
  Clock,
  Wrench,
  CircleDollarSign,
  Handshake,
  Target
} from 'lucide-react';
import { GridItem, VisionItem } from './types';

/**
 * Grid Data Configuration
 * 
 * PALETTE:
 * - Beige: #EBE1D1 (Light / Default Left)
 * - Sage Green: #41644A (Medium / Darker Right)
 * - Forest Green: #0D4715 (Dark / Darkest Right)
 * - Orange: #E9762B (Reserved for Contact)
 * 
 * LOGIC:
 * - Left Column: Default Colors (Beige or Sage)
 * - Right Column: Darker Versions (Sage or Forest)
 * 
 * MAPPING:
 * - Row 1: Left (Beige) | Right (Sage)
 * - Row 2: Left (Sage)  | Right (Forest)
 * - Row 3: Left (Beige) | Right (Sage)
 * - Row 4: Left (Beige) | Right (Sage) -- NEW
 * - Anchors (Hero/WhyUs): Forest Green
 * - Contact: Orange
 */
export const GRID_ITEMS: GridItem[] = [
  // --- HERO (Forest Green - Left Anchor) ---
  {
    id: 'hero',
    title: 'Groupe Nolet & Andrews',
    subtitle: 'Partenaires de votre croissance',
    description: 'Une vision 360° de vos affaires. Technologies, gestion, finances.',
    colSpan: 2, 
    rowSpan: 6, // Full Height (Rows 1-6)
    bgClass: 'white',
    textClass: 'text-white',
    type: 'logo',
    icon: Building2,
    imageUrl: 'https://plexview.ca/assets/mission-DVJl6opv.png'
  },

  // --- ROW 1 (Beige vs Sage) ---
  {
    id: 'dev-solutions',
    title: 'Développement sur mesure',
    subtitle: 'Web & mobile apps',
    description: 'Web & Mobile Apps.',
    colSpan: 4,
    rowSpan: 1,
    bgClass: 'bg-[#EEF2F6]', // SWAPPED: Was Pale Grey/Blue
    textClass: 'text-slate-900',
    type: 'content',
    icon: Monitor,
    imageUrl: 'https://images.unsplash.com/photo-1555099962-4199c345e5dd?q=80&w=2000&auto=format&fit=crop',
    hasContent: true
  },
  {
    id: 'conseil',
    title: 'Conseils d\'affaires',
    subtitle: 'Stratégie',
    description: 'Consultation senior.',
    colSpan: 6,
    rowSpan: 1,
    bgClass: 'bg-[#D3E4F4]', // SWAPPED: Was Blue
    textClass: 'text-slate-900',
    type: 'content',
    icon: Briefcase,
    imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2000&auto=format&fit=crop'
  },

  // --- ROW 2 (Sage vs Forest) ---
  {
    id: 'optimisation',
    title: 'Optimisation web et technique',
    subtitle: 'SEO & performance',
    description: 'SEO & Perf.',
    colSpan: 7,
    rowSpan: 1,
    bgClass: 'bg-[#E1E6EC]', // SWAPPED: Was Light Grey Blue
    textClass: 'text-slate-900', // Changed to dark text for contrast
    type: 'content',
    icon: Zap,
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2000&auto=format&fit=crop'
  },
  {
    id: 'data-analysis',
    title: 'Analyse de données',
    subtitle: 'BI & analytics',
    description: 'Clarté décisionnelle.',
    colSpan: 3,
    rowSpan: 1,
    bgClass: 'bg-[#C0D9EE]', // SWAPPED: Was Updated Blue
    textClass: 'text-slate-900',
    type: 'content',
    icon: BarChart3,
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2000&auto=format&fit=crop'
  },

  // --- ROW 3 (Beige vs Sage) ---
  {
    id: 'automatisation',
    title: 'Automatisation',
    subtitle: 'Workflows & IA',
    description: 'Workflows IA.',
    colSpan: 6,
    rowSpan: 1,
    bgClass: 'bg-[#CBD3DC]', // SWAPPED: Was Muted Blue Grey
    textClass: 'text-slate-900',
    type: 'content',
    icon: Cpu,
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2000&auto=format&fit=crop'
  },
  {
    id: 'formation',
    title: 'Formation & accompagnement',
    subtitle: 'Coaching',
    description: 'Coaching.',
    colSpan: 4,
    rowSpan: 1,
    bgClass: 'bg-[#A8C9E6]', // SWAPPED: Was Updated Blue
    textClass: 'text-slate-900',
    type: 'content',
    icon: GraduationCap,
    imageUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2000&auto=format&fit=crop'
  },

  // --- ROW 4 (NEW: Maintenance & Finance) ---
  {
    id: 'maintenance',
    title: 'Maintenance',
    subtitle: '& support',
    description: 'Veille & sécurité.',
    colSpan: 5,
    rowSpan: 1,
    bgClass: 'bg-[#AEB8C4]', // SWAPPED: Was Grey Blue
    textClass: 'text-slate-900',
    type: 'content',
    icon: Wrench,
    imageUrl: 'https://images.unsplash.com/photo-1581092921461-eab62e97a78e?q=80&w=2000&auto=format&fit=crop'
  },
  {
    id: 'finance',
    title: 'Support financier',
    subtitle: '& subventions',
    description: 'Crédits R&D, CDAE.',
    colSpan: 5,
    rowSpan: 1,
    bgClass: 'bg-[#8FB6DD]', // SWAPPED: Was Darker Blue
    textClass: 'text-slate-900',
    type: 'content',
    icon: CircleDollarSign,
    imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=2000&auto=format&fit=crop'
  },

  // --- ROW 5 (Full Width - Darkest Anchor) ---
  {
    id: 'why-us',
    title: 'Pourquoi nous choisir ?',
    description: 'Une approche intégrée unique sur le marché.',
    colSpan: 10,
    rowSpan: 1,
    bgClass: 'bg-[#6B7C8F]', // NEW: Slate Blue
    textClass: 'text-white',
    type: 'content',
    icon: CheckCircle2,
    imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2000&auto=format&fit=crop'
  },

  // --- ROW 6 (Contact + Team) ---
  {
    id: 'contact',
    title: 'Nous rejoindre',
    subtitle: 'Discussion & devis',
    description: 'Lancez votre projet.',
    colSpan: 6, // Reduced to fit with Team in 10 cols
    rowSpan: 1,
    bgClass: 'bg-[#E8772E] hover:bg-[#D96824]', // NEW: Orange with Hover
    textClass: 'text-white',
    type: 'content',
    icon: Rocket,
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2000&auto=format&fit=crop'
  },
  {
    id: 'team',
    title: 'Équipe & portfolio',
    subtitle: 'Talents & réalisations',
    description: 'Experts passionnés.',
    colSpan: 4, // Reduced to fit
    rowSpan: 1,
    bgClass: 'bg-[#8A98A8]', // NEW: Light Slate
    textClass: 'text-white',
    type: 'content',
    icon: Users,
    imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2000&auto=format&fit=crop'
  }
];

export const VISION_ITEMS: VisionItem[] = [
  { id: 'vis-1', label: 'Intégrité', icon: ShieldCheck, description: 'Transparence totale.' },
  { id: 'vis-2', label: 'Croissance', icon: TrendingUp, description: 'Objectifs dépassés.' },
  { id: 'vis-3', label: 'Innovation', icon: Lightbulb, description: 'Futur assuré.' },
  { id: 'vis-4', label: 'Partenariat', icon: Handshake, description: 'Succès partagé.' },
  { id: 'vis-5', label: 'Résultats', icon: Target, description: 'Gains mesurables.' },
  { id: 'vis-6', label: 'Expertise', icon: Building2, description: 'Savoir-faire unique.' },
];