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
    sm: 'h-10 w-10',
    md: 'h-14 w-14',
    lg: 'h-20 w-20',
  };

  return (
    <div className={clsx('relative', sizeClasses[size], className)}>
      <style>
        {`
          .ladder-part {
            transition: opacity 0.4s ease-in-out;
            opacity: 1;
          }
          .ladder-part.stopped {
            opacity: 0;
          }
          
          .climber {
            transform-origin: 50% 100%; /* bottom center */
            animation: climb 2.5s linear infinite;
          }
          .climber.stopped {
            animation: none;
            transform: translateY(-2px); /* Position the figure to stand on the flat line */
          }

          @keyframes climb {
            0% {
              transform: translateY(0px);
            }
            100% {
              /* Move the climber up the height of the SVG viewbox */
              transform: translateY(-24px);
            }
          }

          .ground-line {
            opacity: 0;
            transition: opacity 0.4s 0.2s ease-in-out; /* Add a slight delay */
          }
          .ground-line.stopped {
            opacity: 1;
          }
        `}
      </style>
      <svg
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        className="text-primary-500"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* The Ladder with rungs */}
        <g className={clsx('ladder-part', !loading && 'stopped')}>
            <path d="M 8 2 V 22" />
            <path d="M 16 2 V 22" />
            <path d="M 8 18 H 16" />
            <path d="M 8 14 H 16" />
            <path d="M 8 10 H 16" />
            <path d="M 8 6 H 16" />
        </g>

        {/* The Human Figure */}
        <g className={clsx('climber', !loading && 'stopped')}>
            {/* The a simplified human figure for better scaling */}
            <circle cx="12" cy="17.5" r="1.5" fill="currentColor"/>
            <path d="M12 19V22" />
            <path d="M9 19.5L15 19.5" />
            <path d="M12 22L10 24" />
            <path d="M12 22L14 24" />
        </g>
        
        {/* The flat line when stopped */}
        <line
           x1="4" y1="22" x2="20" y2="22"
           className={clsx('ground-line', !loading && 'stopped')}
        />
      </svg>
    </div>
  );
}
