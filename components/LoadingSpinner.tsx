'use client';

export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-32">
      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .loader-ring {
          animation: spin 2s linear infinite;
        }

        .loader-ring:nth-child(2) {
          animation: spin 1.5s linear reverse infinite;
          border-color: #f1aa1c;
          opacity: 0.7;
        }

        .loader-ring:nth-child(3) {
          animation: spin 1s linear infinite;
          border-color: #f1aa1c;
          opacity: 0.4;
        }
      `}</style>

      <div className="relative w-32 h-32">
        {/* Outer ring 1 */}
        <div
          className="loader-ring absolute inset-0 rounded-full border-8 border-transparent border-t-arc-yellow border-r-arc-yellow"
        />

        {/* Outer ring 2 */}
        <div
          className="loader-ring absolute inset-3 rounded-full border-6 border-transparent border-b-arc-yellow border-l-arc-yellow"
        />

        {/* Outer ring 3 */}
        <div
          className="loader-ring absolute inset-6 rounded-full border-4 border-transparent border-t-arc-yellow border-r-arc-yellow"
        />

        {/* Center glow */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-arc-yellow/10 border-2 border-arc-yellow/50" />
        </div>
      </div>
    </div>
  );
}
