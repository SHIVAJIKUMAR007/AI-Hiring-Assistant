import React from 'react';

interface Step {
  id: number;
  name: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
}

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);

export const Stepper: React.FC<StepperProps> = ({ steps, currentStep }) => {
  const progressPercentage = steps.length > 1 ? ((currentStep - 1) / (steps.length - 1)) * 100 : 0;

  return (
    <nav aria-label="Progress" className="w-full">
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute left-0 top-4 h-0.5 w-full" aria-hidden="true">
          <div className="h-full w-full bg-gray-200" />
          <div
            className="absolute left-0 top-0 h-full bg-primary-600 transition-all duration-300 ease-in-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Steps */}
        <ol role="list" className="relative flex justify-between">
          {steps.map((step) => (
            <li key={step.name} className="relative flex flex-col items-center justify-start text-center w-28">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full bg-white ${
                  step.id < currentStep
                    ? 'bg-primary-600'
                    : step.id === currentStep
                    ? 'border-2 border-primary-600'
                    : 'border-2 border-gray-300'
                }`}
              >
                {step.id < currentStep ? (
                  <CheckIcon className="h-5 w-5 text-white" />
                ) : step.id === currentStep ? (
                  <span className="h-2.5 w-2.5 rounded-full bg-primary-600" />
                ) : null}
              </div>
              <p className={`mt-3 text-sm font-medium ${step.id <= currentStep ? 'text-primary-700' : 'text-gray-500'}`}>
                {step.name}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
};
