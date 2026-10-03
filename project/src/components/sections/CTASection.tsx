import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, MessageCircle } from 'lucide-react';

interface CTASectionProps {
  title?: string;
  subtitle?: string;
  primaryLabel?: string;
  primaryTo?: string;
  secondaryLabel?: string;
  secondaryTo?: string;
}

export default function CTASection({
  title = 'Ready to Discuss Your Research?',
  subtitle = 'Whether you are developing a manuscript, preparing a review, or navigating journal submission, we provide evidence-based scientific writing and publication support tailored to your research.',
  primaryLabel = 'Discuss Your Research',
  primaryTo = '/contact',
  secondaryLabel = 'View Portfolio',
  secondaryTo = '/portfolio',
}: CTASectionProps) {
  return (
    <section className="py-20 lg:py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-navy-900"></div>
      <div className="absolute inset-0 grid-bg opacity-20"></div>
      <div className="absolute top-0 left-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pulse-glow"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl pulse-glow"></div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-500/20 text-teal-400 mb-6">
            <MessageCircle className="w-7 h-7" />
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-5">
            {title}
          </h2>
          <p className="text-lg text-navy-200 leading-relaxed mb-8 max-w-2xl mx-auto">
            {subtitle}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={primaryTo}
              className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold bg-teal-500 text-white rounded-lg hover:bg-teal-400 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              {primaryLabel}
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to={secondaryTo}
              className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold border-2 border-navy-400 text-white rounded-lg hover:bg-white hover:text-navy-900 transition-all"
            >
              {secondaryLabel}
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
