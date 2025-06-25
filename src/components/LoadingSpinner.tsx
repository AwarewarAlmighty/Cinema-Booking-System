import { clsx } from 'clsx';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  // Define size classes for the spinner
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <div className={clsx('relative', sizeClasses[size], className)}>
      <style>
        {`
          @keyframes spinner-rotate {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .spinner-circle {
            animation: spinner-rotate 1s linear infinite;
            transform-origin: center;
          }
        `}
      </style>
      <svg
        className="spinner-circle text-primary-500"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* This creates a circle with a wedge cut out, like Pac-Man */}
        <path d="M12 2 a 10 10 0 0 1 0 20 a 10 10 0 0 1 0 -20" />
      </svg>
    </div>
  );
}
