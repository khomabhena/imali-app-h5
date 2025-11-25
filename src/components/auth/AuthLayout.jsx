/**
 * AuthLayout Component
 * Mobile-first layout wrapper for authentication pages
 */
export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="h-screen bg-white flex flex-col overflow-y-auto">
      <div className="w-full max-w-md mx-auto flex flex-col flex-1 px-4">
        {/* Mobile App Header */}
        <div className="pt-12 pb-8 flex-shrink-0">
          {/* Logo/Brand - Centered */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 mb-4">
              <span className="text-xl font-bold text-white">I</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Imali</h1>
            {title && (
              <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            )}
            {subtitle && (
              <p className="text-sm text-gray-600 mt-1.5">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 pb-8 min-h-0">
          {children}
        </div>
      </div>
    </div>
  );
}

