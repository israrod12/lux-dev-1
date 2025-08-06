const shimmer =
  'bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse';

export default function GallerySkeleton() {
  const heights = ['h-48', 'h-60', 'h-72', 'h-52', 'h-64', 'h-56'];

  return (
    <div className="columns-2 md:columns-3 gap-4 space-y-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className={`relative w-full break-inside-avoid rounded-xl overflow-hidden shadow ${shimmer} ${heights[i % heights.length]}`}
        />
      ))}
    </div>
  );
}
