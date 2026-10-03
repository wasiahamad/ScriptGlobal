import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface SectionTitleProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  center?: boolean;
}

export default function SectionTitle({
  eyebrow,
  title,
  subtitle,
  icon: Icon,
  center = true,
}: SectionTitleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5 }}
      className={center ? 'text-center max-w-3xl mx-auto mb-12' : 'max-w-3xl mb-12'}
    >
      {eyebrow && (
        <div className={`flex items-center gap-2 mb-3 ${center ? 'justify-center' : ''}`}>
          {Icon && (
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-teal-50 text-teal-600">
              <Icon className="w-4 h-4" />
            </span>
          )}
          <span className="text-sm font-semibold uppercase tracking-wider text-teal-600">
            {eyebrow}
          </span>
        </div>
      )}
      <h2 className="text-3xl md:text-4xl font-bold text-navy-900 leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-lg text-navy-500 leading-relaxed">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
