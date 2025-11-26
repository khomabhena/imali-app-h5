/**
 * PageLayout Component
 * Reusable layout for pages with teal gradient header and content section
 */
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

export default function PageLayout({
  title,
  subtitle,
  showBackButton = false,
  showSettingsButton = true,
  onBack,
  children,
  headerContent,
}) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <>
      {/* Header Section */}
      <div className="bg-gradient-to-br from-teal-500 to-teal-600 text-white px-4 pt-12 pb-8">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-3">
            {showBackButton && (
              <button
                onClick={handleBack}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                aria-label="Go back"
              >
                <ArrowLeftIcon className="w-6 h-6 text-white" />
              </button>
            )}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white">{title}</h1>
              {subtitle && (
                <p className="text-sm text-teal-100">{subtitle}</p>
              )}
            </div>
            {showSettingsButton && (
              <button
                onClick={() => navigate('/settings')}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                aria-label="Settings"
              >
                <Cog6ToothIcon className="w-6 h-6 text-white" />
              </button>
            )}
            {headerContent && (
              <div>{headerContent}</div>
            )}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-md mx-auto px-4 -mt-4 pb-6">
        {children}
      </div>
    </>
  );
}

