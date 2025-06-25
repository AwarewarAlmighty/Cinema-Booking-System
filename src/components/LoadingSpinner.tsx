import { clsx } from 'clsx';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  loading?: boolean; // New prop to control the animation
}

export default function LoadingSpinner({ 
  size = 'md', 
  className,
  loading = true // Default to true for existing usage
}: LoadingSpinnerProps) {
  
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };

  return (
    <div className={clsx('relative', sizeClasses[size], className)}>
      <style>
        {`
          .ladder {
            stroke-dasharray: 200;
            stroke-dashoffset: 0;
            transition: stroke-dashoffset 0.5s ease-out;
          }
          .ladder.stopped {
            stroke-dashoffset: 200;
          }
          
          .box {
            transform-origin: center;
            animation: climb 1.5s infinite steps(4);
          }
          .box.stopped {
            animation: none;
            transform: translateY(75%) rotate(0deg);
          }

          @keyframes climb {
            0% { transform: translateY(0); }
            100% { transform: translateY(-100%); }
          }
        `}
      </style>
      <svg
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        className="text-primary-500"
      >
        {/* The Ladder */}
        <path
          className={clsx('ladder', !loading && 'stopped')}
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          d="M 12,2 V 22"
        />
        <path
          className={clsx('ladder', !loading && 'stopped')}
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          d="M 8,2 V 22"
        />
        <path
          className={clsx('ladder', !loading && 'stopped')}
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          d="M 16,2 V 22"
        />

        {/* The Box */}
        <g className={clsx('box', !loading && 'stopped')}>
          <rect x="9" y="18" width="6" height="6" fill="currentColor" rx="1"/>
        </g>
        
        {/* The flat line when stopped */}
        {!loading && (
           <line x1="4" y1="22" x2="20" y2="22" stroke="currentColor" strokeWidth="1" />
        )}
      </svg>
    </div>
  );
}
