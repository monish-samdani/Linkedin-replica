export default function InProgressCard({ title = 'Coming soon', subtitle = 'This section is under active development' }) {
  return (
    <div className="card flex flex-col items-center px-8 py-12 text-center">
      <span className="text-5xl" role="img" aria-label="construction">
        🚧
      </span>
      <h2 className="mt-4 font-display text-2xl font-semibold text-gray-900">{title}</h2>
      <p className="mt-2 max-w-sm text-sm text-gray-600">{subtitle}</p>
      <span className="mt-4 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
        In Progress
      </span>
    </div>
  );
}
