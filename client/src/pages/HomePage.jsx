import { Link } from 'react-router-dom';

const nodes = [
  { cx: 80, cy: 60, initials: 'AK', color: '#0a66c2' },
  { cx: 200, cy: 40, initials: 'SR', color: '#378fe9' },
  { cx: 320, cy: 80, initials: 'MJ', color: '#0a66c2' },
  { cx: 140, cy: 160, initials: 'PL', color: '#004182' },
  { cx: 260, cy: 140, initials: 'RN', color: '#378fe9' },
  { cx: 180, cy: 220, initials: 'DK', color: '#0a66c2' },
  { cx: 300, cy: 200, initials: 'EV', color: '#004182' },
  { cx: 100, cy: 240, initials: 'TW', color: '#378fe9' },
];

const edges = [
  [0, 1], [1, 2], [0, 3], [1, 4], [3, 4], [3, 5], [4, 6], [5, 7], [3, 7], [2, 6],
];

function NetworkIllustration() {
  return (
    <svg viewBox="0 0 400 300" className="w-full max-w-lg" aria-hidden="true">
      <style>{`
        @keyframes drawLine {
          to { stroke-dashoffset: 0; }
        }
        @keyframes pulseNode {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .network-line {
          stroke: #0a66c2;
          stroke-width: 2;
          fill: none;
          stroke-dasharray: 200;
          stroke-dashoffset: 200;
          animation: drawLine 2s ease forwards;
        }
        .network-node {
          animation: pulseNode 3s ease-in-out infinite;
          transform-origin: center;
          transform-box: fill-box;
        }
      `}</style>
      {edges.map(([a, b], i) => (
        <line
          key={i}
          className="network-line"
          x1={nodes[a].cx}
          y1={nodes[a].cy}
          x2={nodes[b].cx}
          y2={nodes[b].cy}
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
      {nodes.map((node, i) => (
        <g key={i} className="network-node" style={{ animationDelay: `${i * 0.2}s` }}>
          <circle cx={node.cx} cy={node.cy} r="24" fill="white" stroke={node.color} strokeWidth="3" />
          <text
            x={node.cx}
            y={node.cy + 5}
            textAnchor="middle"
            fontSize="12"
            fontWeight="bold"
            fill={node.color}
          >
            {node.initials}
          </text>
        </g>
      ))}
    </svg>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded bg-brand-500 text-sm font-bold text-white">
            in
          </div>
          <span className="font-display text-lg text-gray-900">LinkedIn Replica</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="btn-secondary px-5 py-2 text-sm">
            Sign in
          </Link>
          <Link to="/register" className="btn-primary px-5 py-2 text-sm">
            Join now
          </Link>
        </div>
      </nav>

      <section className="mx-auto flex min-h-[calc(100vh-57px)] max-w-6xl flex-col items-center gap-12 px-6 py-16 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl">
          <h1 className="font-display text-4xl leading-tight text-gray-900 md:text-5xl">
            Your professional community, reimagined.
          </h1>
          <p className="mt-6 text-lg text-gray-600">
            Connect with professionals, share your work, discover opportunities.
          </p>
          <Link to="/register" className="btn-primary mt-8 px-8 py-3 text-base">
            Join now — it&apos;s free
          </Link>
          <p className="mt-4 text-sm text-gray-600">
            Already a member?{' '}
            <Link to="/login" className="font-semibold text-brand-500 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
        <div className="flex-1">
          <NetworkIllustration />
        </div>
      </section>

      <section className="bg-surface-1 px-6 py-16">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
          {[
            { icon: '🤝', title: 'Grow your network', desc: 'Connect with professionals in your industry' },
            { icon: '📝', title: 'Share your story', desc: 'Post updates, articles and achievements' },
            { icon: '💼', title: 'Find opportunities', desc: 'Discover jobs that match your skills' },
          ].map((feature) => (
            <div key={feature.title} className="card p-6">
              <span className="text-3xl">{feature.icon}</span>
              <h3 className="mt-3 font-display text-lg font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-gray-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-gray-200 px-6 py-8 text-center text-sm text-gray-500">
        © 2024 LinkedIn Replica • Built as a portfolio project
      </footer>
    </div>
  );
}
