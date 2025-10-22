import React from 'react';

interface ProgressStepsProps {
  currentStep: number;
  skipBarberSelection?: boolean;
}

export const ProgressSteps: React.FC<ProgressStepsProps> = ({ currentStep, skipBarberSelection = false }) => {
  const defaultSteps = [
    { number: 1, label: 'Barbeiro' },
    { number: 2, label: 'Serviço' },
    { number: 3, label: 'Data/Hora' },
    { number: 4, label: 'Dados' },
    { number: 5, label: 'Confirmação' }
  ];

  const steps = skipBarberSelection
    ? defaultSteps.slice(1).map((step, index) => ({ ...step, number: index + 1 }))
    : defaultSteps;

  return (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-2">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= step.number
                  ? 'bg-[#00657C] text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {step.number}
              </div>
              <span className={`text-xs mt-1 ${
                currentStep >= step.number ? 'text-[#00657C]' : 'text-gray-500'
              }`}>
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`w-8 h-0.5 ml-2 ${
                currentStep > step.number ? 'bg-[#00657C]' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};