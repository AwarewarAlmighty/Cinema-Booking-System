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
    lg: 'h-16 h-16',
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
          
          .climber {
            transform-origin: bottom center;
            animation: climb 1.5s infinite steps(4);
          }
          .climber.stopped {
            animation: none;
            /* Position the figure to stand on the flat line */
            transform: translateY(-2px);
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
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* The Ladder */}
        <path
          className={clsx('ladder', !loading && 'stopped')}
          d="M 12,2 V 22"
        />
        <path
          className={clsx('ladder', !loading && 'stopped')}
          d="M 8,2 V 22"
        />
        <path
          className={clsx('ladder', !loading && 'stopped')}
          d="M 16,2 V 22"
        />

        {/* The Human Figure */}
        <g className={clsx('climber', !loading && 'stopped')}>
          <circle cx="12" cy="18" r="1.5" fill="currentColor"/>
          <path d="M12 19.5V22.5" />
          <path d="M10 20.5L14 20.5" />
          <path d="M12 22.5L10 24" />
          <path d="M12 22.5L14 24" />
        </g>
        
        {/* The flat line when stopped */}
        {!loading && (
           <line x1="4" y1="22" x2="20" y2="22" />
        )}
      </svg>
    </div>
  );
}
