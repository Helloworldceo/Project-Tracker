import React, { useState } from 'react';
import {
  X,
  Sparkles,
  ShieldCheck,
  Wifi,
  Bell,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Kanban,
  Calendar,
  Layers,
} from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STEPS = [
  {
    title: 'Welcome to Nexus Project Tracker',
    subtitle: 'A high-performance, real-time collaboration workspace designed for engineering and product teams.',
    icon: Sparkles,
    iconColor: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400',
    content: (
      <div className="space-y-3 text-xs text-neutral-600 dark:text-neutral-300">
        <p>
          Nexus empowers your team to plan, build, and deliver high-impact software seamlessly across devices:
        </p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 pt-1">
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-800 dark:bg-neutral-800/50">
            <h5 className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5 mb-1">
              <Kanban className="h-4 w-4 text-indigo-600" />
              Kanban Board & List Views
            </h5>
            <p className="text-[11px] text-neutral-500">
              Drag-like quick status moves, multi-assignee tracking, and subtask checklists with auto-completion.
            </p>
          </div>
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-800 dark:bg-neutral-800/50">
            <h5 className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5 mb-1">
              <Calendar className="h-4 w-4 text-purple-600" />
              Interactive Calendar
            </h5>
            <p className="text-[11px] text-neutral-500">
              Visualize deadlines, prevent delivery bottlenecks, and schedule tasks directly on calendar days.
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Zero-Knowledge End-to-End Encryption',
    subtitle: 'Your architecture secrets, trade secrets, and customer credentials remain 100% private.',
    icon: ShieldCheck,
    iconColor: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400',
    content: (
      <div className="space-y-3 text-xs text-neutral-600 dark:text-neutral-300">
        <p>
          Nexus features client-side <strong>AES-GCM 256-bit encryption</strong> powered by the Web Crypto API:
        </p>
        <ul className="space-y-2 text-[11px]">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              <strong>Client-Side Vault:</strong> Data is encrypted directly in your browser using PBKDF2 with 100,000 iterations before leaving your machine.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              <strong>Encrypted Task Descriptions:</strong> Toggle the lock icon on any task to protect sensitive specs with your master passphrase.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              <strong>Cryptographic Fingerprint:</strong> Verify your project encryption key across team members without exposing raw credentials.
            </span>
          </li>
        </ul>
      </div>
    ),
  },
  {
    title: 'Offline-First & Low-Bandwidth Resilience',
    subtitle: 'Stay productive on the subway, flights, or low-connectivity mobile networks.',
    icon: Wifi,
    iconColor: 'bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-400',
    content: (
      <div className="space-y-3 text-xs text-neutral-600 dark:text-neutral-300">
        <p>
          Work seamlessly without fear of data loss or network interruptions:
        </p>
        <div className="rounded-xl border border-sky-100 bg-sky-50/50 p-3.5 dark:border-sky-950 dark:bg-sky-950/30 space-y-2">
          <div className="flex items-center gap-2 font-bold text-sky-900 dark:text-sky-200">
            <Wifi className="h-4 w-4" />
            <span>Automatic Delta Synchronization</span>
          </div>
          <p className="text-[11px] text-sky-800 dark:text-sky-300 leading-relaxed">
            Every change is immediately persisted to local storage and queued into an indexed mutation buffer. The moment connectivity is restored, all offline actions sync automatically to the cloud.
          </p>
          <div className="text-[11px] text-sky-700 dark:text-sky-400">
            Enable <strong>Low-Bandwidth Mode</strong> in Settings to compress payloads and reduce network battery consumption.
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Automated Status Updates & Alerts',
    subtitle: 'Smart notifications and deadline reminders so your team never misses a deliverable.',
    icon: Bell,
    iconColor: 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400',
    content: (
      <div className="space-y-3 text-xs text-neutral-600 dark:text-neutral-300">
        <p>
          Nexus includes built-in background automation:
        </p>
        <div className="space-y-2 text-[11px]">
          <div className="flex items-start gap-2 rounded-lg border border-neutral-200 bg-neutral-50 p-2.5 dark:border-neutral-800 dark:bg-neutral-800/40">
            <CheckCircle2 className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-neutral-900 dark:text-white">Subtask Auto-Progression:</strong> Checking off all subtask items automatically advances tasks to review.
            </div>
          </div>
          <div className="flex items-start gap-2 rounded-lg border border-neutral-200 bg-neutral-50 p-2.5 dark:border-neutral-800 dark:bg-neutral-800/40">
            <Bell className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-neutral-900 dark:text-white">Customizable Alerts:</strong> Receive notifications when tasks are completed, deadlines approach, or items become overdue.
            </div>
          </div>
        </div>
      </div>
    ),
  },
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const step = STEPS[currentStep];
  const IconComponent = step.icon;

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900 animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Step Indicator */}
        <div className="flex items-center gap-1.5 mb-5">
          {STEPS.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentStep
                  ? 'w-8 bg-indigo-600'
                  : index < currentStep
                  ? 'w-4 bg-indigo-200 dark:bg-indigo-900'
                  : 'w-2 bg-neutral-200 dark:bg-neutral-800'
              }`}
            />
          ))}
        </div>

        {/* Step Header */}
        <div className="flex items-start gap-3.5 mb-4">
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${step.iconColor}`}>
            <IconComponent className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white leading-snug">
              {step.title}
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              {step.subtitle}
            </p>
          </div>
        </div>

        {/* Step Content */}
        <div className="py-2 min-h-[190px]">
          {step.content}
        </div>

        {/* Step Actions */}
        <div className="mt-6 flex items-center justify-between pt-4 border-t border-neutral-100 dark:border-neutral-800">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 disabled:opacity-0 dark:text-neutral-400 dark:hover:bg-neutral-800 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition"
          >
            {currentStep === STEPS.length - 1 ? (
              <span>Get Started</span>
            ) : (
              <>
                <span>Next</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
