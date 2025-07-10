interface BookingProgressProps {
  currentStep: 'selection' | 'payment' | 'finish';
}

const steps = [
  { id: 'selection', title: 'SEATING OF CHOICE' },
  { id: 'payment', title: 'PAYMENT' },
  { id: 'finish', title: 'FINISH' },
];

export default function BookingProgress({ currentStep }: BookingProgressProps) {
  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  return (
    <div className="flex items-center justify-center space-x-4 sm:space-x-8">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center space-x-2">
          <span
            className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
              index <= currentStepIndex
                ? 'bg-primary-500 text-white'
                : 'bg-dark-700 text-slate-400'
            }`}
          >
            {index + 1}
          </span>
          <span
            className={`font-semibold hidden sm:block ${
              index <= currentStepIndex ? 'text-white' : 'text-slate-500'
            }`}
          >
            {step.title}
          </span>
        </div>
      ))}
    </div>
  );
}