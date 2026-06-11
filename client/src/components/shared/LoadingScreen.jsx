export default function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-1">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded bg-brand-500 text-xl font-bold text-white">
          in
        </div>
        <div className="skeleton mx-auto h-2 w-32" />
      </div>
    </div>
  );
}
