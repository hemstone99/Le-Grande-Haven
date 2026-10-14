// Layered wave that blends a hero banner into the section below it.
// `fill` must match the background colour of the next section.
export default function HeroWave({ fill = '#fbf8f2', className = '' }: { fill?: string; className?: string }) {
  // Each path is drawn twice as wide as the viewBox so the back layers can drift seamlessly
  const back = 'M0,64 C240,104 480,16 720,56 C960,96 1200,24 1440,64 C1680,104 1920,16 2160,56 C2400,96 2640,24 2880,64 L2880,160 L0,160 Z'
  const mid = 'M0,92 C200,60 440,128 720,96 C1000,64 1240,124 1440,92 C1640,60 1880,128 2160,96 C2440,64 2680,124 2880,92 L2880,160 L0,160 Z'
  return (
    <div className={`pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-16 sm:h-20 md:h-28 overflow-hidden ${className}`} aria-hidden="true">
      <svg className="absolute bottom-0 left-0 h-full w-[200%] hero-wave-drift-slow" viewBox="0 0 2880 160" preserveAspectRatio="none">
        <path d={back} fill={fill} fillOpacity="0.14" />
      </svg>
      <svg className="absolute bottom-0 left-0 h-full w-[200%] hero-wave-drift" viewBox="0 0 2880 160" preserveAspectRatio="none">
        <path d={mid} fill={fill} fillOpacity="0.3" />
      </svg>
      <svg className="absolute bottom-0 left-0 h-full w-full" viewBox="0 0 1440 160" preserveAspectRatio="none">
        <path d="M0,112 C180,92 360,136 560,128 C760,120 900,88 1080,96 C1260,104 1360,124 1440,120 L1440,160 L0,160 Z" fill={fill} />
      </svg>
    </div>
  )
}
