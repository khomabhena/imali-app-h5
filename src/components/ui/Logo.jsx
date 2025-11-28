/**
 * Logo Component
 * Displays the Imali logo
 */
export default function Logo({ size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
    xl: 'w-24 h-24',
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <img
        src="/app-icon.png"
        alt="Imali Logo"
        className="w-full h-full object-contain rounded-xl"
        onError={(e) => {
          // Fallback if app-icon.png doesn't exist
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'flex';
        }}
      />
      {/* Fallback placeholder */}
      <div
        className="hidden items-center justify-center w-full h-full rounded-xl bg-gradient-to-br from-teal-500 to-teal-600"
        style={{ display: 'none' }}
      >
        <span className="text-white font-bold" style={{ fontSize: '60%' }}>
          M
        </span>
      </div>
    </div>
  );
}

