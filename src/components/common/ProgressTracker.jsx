import React from 'react';
import { CheckCircle2, Clock, Circle } from 'lucide-react';

export default function ProgressTracker({ status }) {
  const s = String(status || 'SUBMITTED').toUpperCase().replace(/_/g, ' ').trim();

  const isSentForVerification = s.includes('SENT FOR VERIFICATION') || s.includes('SUBMITTED FOR REVIEW') || s.includes('REVIEW');
  const isResolved = (s === 'RESOLVED' || s === 'CLOSED' || s.includes('CITIZEN APPROVED') || s.includes('APPROV')) && !isSentForVerification;

  const steps = [
    { key: 'Submitted', label: 'Complaint Submitted' },
    { key: 'Assigned', label: 'Assigned to Department' },
    { key: 'In Progress', label: 'Work In Progress' },
    { key: 'Verification', label: 'Sent for Verification' },
    { key: 'Resolved', label: 'Resolved' },
  ];

  let currentStep = 0;
  if (isResolved) {
    currentStep = 5;
  } else if (isSentForVerification) {
    currentStep = 3;
  } else if (s.includes('PROGRESS') || s.includes('REWORK')) {
    currentStep = 2;
  } else if (s.includes('ASSIGN') || s.includes('PENDING')) {
    currentStep = 1;
  } else {
    currentStep = 0;
  }

  return (
    <div className="flex items-center w-full px-2 py-1">
      {steps.map((step, i) => (
        <React.Fragment key={step.key}>
          <div className="flex flex-col items-center flex-shrink-0">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                i < currentStep
                  ? 'bg-green-500 text-white shadow-sm'
                  : i === currentStep
                  ? 'bg-purple-600 text-white ring-4 ring-purple-100 shadow-sm'
                  : 'bg-gray-100 text-gray-400 border border-gray-200'
              }`}
            >
              {i < currentStep ? (
                <CheckCircle2 size={18} />
              ) : i === currentStep ? (
                <Clock size={18} />
              ) : (
                <Circle size={18} />
              )}
            </div>
            <p
              className={`text-xs mt-2 text-center max-w-[85px] leading-tight font-medium ${
                i <= currentStep ? 'text-gray-900 font-bold' : 'text-gray-400'
              }`}
            >
              {step.label}
            </p>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`flex-1 h-1 mx-2 mb-6 transition-all rounded-full ${
                i < currentStep ? 'bg-green-500' : 'bg-gray-200'
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
