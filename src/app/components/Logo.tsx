export function Logo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background rounded square with gradient */}
      <rect
        x="0"
        y="0"
        width="100"
        height="100"
        rx="22"
        fill="url(#gradient)"
      />
      
      {/* ST Text */}
      <text
        x="50"
        y="70"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="52"
        fontWeight="700"
        fill="white"
        textAnchor="middle"
        letterSpacing="-2"
      >
        ST
      </text>
      
      {/* Gradient Definition */}
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
    </svg>
  );
}
