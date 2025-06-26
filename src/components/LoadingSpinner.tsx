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

          .climber-group {
            animation: climb-group 2s linear infinite;
          }
          
          .climber.stopped .climber-group,
          .climber.stopped .left-arm,
          .climber.stopped .right-arm,
          .climber.stopped .left-leg,
          .climber.stopped .right-leg {
            animation: none;
          }
          .climber.stopped {
             transform: translateY(-2px); /* Final standing position */
          }

          .left-arm {
             animation: climb-left-arm 1s ease-in-out infinite alternate;
          }
          .right-leg {
            animation: climb-left-arm 1s ease-in-out infinite alternate;
          }
          .right-arm {
            animation: climb-right-arm 1s ease-in-out infinite alternate;
          }
           .left-leg {
             animation: climb-right-arm 1s ease-in-out infinite alternate;
          }

          @keyframes climb-group {
            0% { transform: translateY(0); }
            100% { transform: translateY(-24px); }
          }

          @keyframes climb-left-arm {
            from { transform: translateY(-2px); }
            to { transform: translateY(0); }
          }
           @keyframes climb-right-arm {
            from { transform: translateY(0); }
            to { transform: translateY(-2px); }
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

        {/* The Human Figure, broken into parts for animation */}
        <g className={clsx('climber', !loading && 'stopped')}>
            <g className="climber-group">
                {/* Body and Head */}
                <circle cx="12" cy="17.5" r="1.5" fill="currentColor"/>
                <path d="M12 19V21" />
                {/* Arms */}
                <path className="left-arm" d="M12 19.5L10 20.5" />
                <path className="right-arm" d="M12 19.5L14 20.5" />
                {/* Legs */}
                <path className="left-leg" d="M12 21L10 22.5" />
                <path className="right-leg" d="M12 21L14 22.5" />
            </g>
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
