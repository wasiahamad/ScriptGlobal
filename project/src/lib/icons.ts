import {
  FileText, BookOpen, PenLine, ShieldCheck, Sparkles, LibraryBig,
  GraduationCap, FlaskConical, Send, Pill, Activity, Syringe, Atom,
  Dna, Bug, HeartPulse, Leaf, Flame, Ribbon, Brain, Gauge,
  type LucideIcon,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  FileText, BookOpen, PenLine, ShieldCheck, Sparkles, LibraryBig,
  GraduationCap, FlaskConical, Send, Pill, Activity, Syringe, Atom,
  Dna, Bug, HeartPulse, Leaf, Flame, Ribbon, Brain, Gauge,
};

export function getIcon(name: string | null | undefined): LucideIcon {
  if (!name) return FileText;
  return iconMap[name] || FileText;
}
