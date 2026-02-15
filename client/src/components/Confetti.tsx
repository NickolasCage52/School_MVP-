/** Lightweight CSS confetti burst. Optional: reduce particle count on low-end via prop. */
export function Confetti({ particleCount = 40 }: { particleCount?: number }) {
  const particles = Array.from({ length: Math.min(particleCount, 50) }, (_, i) => ({
    id: i,
    left: 40 + Math.random() * 20,
    delay: Math.random() * 0.4,
    duration: 1.2 + Math.random() * 0.6,
    color: ["#6366f1", "#06b6d4", "#f97316", "#8b5cf6", "#22c55e"][i % 5],
    size: 6 + Math.random() * 6,
    rotation: Math.random() * 360,
  }));

  return (
    <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden" aria-hidden>
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute animate-confetti-fall"
          style={{
            left: `${p.left}%`,
            top: "-10px",
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
            transform: `rotate(${p.rotation}deg)`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
