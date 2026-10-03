import { motion } from 'framer-motion';

export function MolecularPattern({ className = '' }: { className?: string }) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      <svg width="100%" height="100%" viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-[0.07]">
        <g stroke="#0a0a0a" strokeWidth="1">
          <line x1="100" y1="100" x2="200" y2="150" />
          <line x1="200" y1="150" x2="300" y2="100" />
          <line x1="300" y1="100" x2="400" y2="150" />
          <line x1="400" y1="150" x2="500" y2="100" />
          <line x1="500" y1="100" x2="600" y2="150" />
          <line x1="200" y1="150" x2="200" y2="250" />
          <line x1="400" y1="150" x2="400" y2="250" />
          <line x1="600" y1="150" x2="600" y2="250" />
          <line x1="200" y1="250" x2="300" y2="300" />
          <line x1="300" y1="300" x2="400" y2="250" />
          <line x1="300" y1="300" x2="300" y2="400" />
          <line x1="300" y1="400" x2="200" y2="450" />
          <line x1="300" y1="400" x2="400" y2="450" />
          <line x1="200" y1="450" x2="200" y2="520" />
          <line x1="400" y1="450" x2="400" y2="520" />
          <line x1="600" y1="250" x2="500" y2="300" />
          <line x1="500" y1="300" x2="500" y2="400" />
          <line x1="500" y1="400" x2="600" y2="450" />
          <line x1="600" y1="450" x2="700" y2="400" />
        </g>
        <g fill="#0f766e">
          <circle cx="100" cy="100" r="6" />
          <circle cx="200" cy="150" r="5" />
          <circle cx="300" cy="100" r="6" />
          <circle cx="400" cy="150" r="5" />
          <circle cx="500" cy="100" r="6" />
          <circle cx="600" cy="150" r="5" />
          <circle cx="200" cy="250" r="5" />
          <circle cx="400" cy="250" r="5" />
          <circle cx="600" cy="250" r="6" />
          <circle cx="300" cy="300" r="5" />
          <circle cx="500" cy="300" r="5" />
          <circle cx="300" cy="400" r="6" />
          <circle cx="500" cy="400" r="5" />
          <circle cx="200" cy="450" r="5" />
          <circle cx="400" cy="450" r="5" />
          <circle cx="600" cy="450" r="6" />
          <circle cx="200" cy="520" r="4" />
          <circle cx="400" cy="520" r="4" />
          <circle cx="700" cy="400" r="5" />
        </g>
      </svg>
    </div>
  );
}

export function DnaHelix({ className = '' }: { className?: string }) {
  const points = Array.from({ length: 12 }, (_, i) => i * 40);
  return (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 100 500" fill="none" className="w-full h-full">
        {points.map((y, i) => {
          const offset = Math.sin((i / 12) * Math.PI * 2) * 30;
          const x1 = 50 + offset;
          const x2 = 50 - offset;
          return (
            <g key={i}>
              <line x1={x1} y1={y + 20} x2={x2} y2={y + 20} stroke="#0f766e" strokeWidth="1.5" opacity="0.4" />
              <circle cx={x1} cy={y + 20} r="4" fill="#0a0a0a" opacity="0.5" />
              <circle cx={x2} cy={y + 20} r="4" fill="#0f766e" opacity="0.5" />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function ParticleField({ className = '' }: { className?: string }) {
  const particles = [
    { x: 10, y: 20, delay: 0, size: 8 },
    { x: 25, y: 60, delay: 0.5, size: 6 },
    { x: 40, y: 30, delay: 1, size: 10 },
    { x: 55, y: 70, delay: 1.5, size: 7 },
    { x: 70, y: 25, delay: 0.3, size: 9 },
    { x: 85, y: 55, delay: 0.8, size: 6 },
    { x: 15, y: 80, delay: 1.2, size: 8 },
    { x: 60, y: 15, delay: 0.6, size: 7 },
    { x: 80, y: 85, delay: 1.8, size: 9 },
    { x: 35, y: 50, delay: 0.4, size: 5 },
  ];

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-teal-400/20"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
          animate={{ y: [0, -30, 0], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 4 + p.delay, repeat: Infinity, ease: 'easeInOut', delay: p.delay }}
        />
      ))}
    </div>
  );
}
