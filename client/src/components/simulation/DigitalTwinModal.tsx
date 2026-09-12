import React, { useState } from 'react';
import { polarisApi } from '../../api/services';
import { 
  PlayCircle, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  Box, 
  ShieldAlert, 
  RotateCcw, 
  X,
  Radio
} from 'lucide-react';

interface DigitalTwinModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DigitalTwinModal: React.FC<DigitalTwinModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [currentStep, setCurrentStep] = useState(0);
  const [stepLogs, setStepLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const scenarioSteps = [
    {
      step: 1,
      title: "1. Staging & Cargo Dispatch",
      desc: "Logistics Hub (Goa Port) stages 2,850 kg ice core drill equipment and dispatches onto icebreaker MV Vasiliy Golovnin.",
      icon: Box
    },
    {
      step: 2,
      title: "2. Antarctic Airlift & Station Delivery",
      desc: "Kamov Ka-32 helicopter airlifts container from vessel fast ice to Bharati Station cryo-vault; station inventory auto-replenishes.",
      icon: CheckCircle2
    },
    {
      step: 3,
      title: "3. Extreme Whiteout Incident & SAR Dispatch",
      desc: "Severe Katabatic wind storm spikes (92 km/h) at Dalk Glacier; PistenBully heavy snowcat deployed for field sortie escort.",
      icon: ShieldAlert
    },
    {
      step: 4,
      title: "4. Incident Resolution & 100% Muster",
      desc: "Field research team safely returned to base module; automated biometric muster verified 100% accounted for.",
      icon: CheckCircle2
    }
  ];

  const handleExecuteNextStep = async () => {
    const nextStep = currentStep + 1;
    if (nextStep > 4) return;
    setLoading(true);
    try {
      const result = await polarisApi.triggerSimulationStep(nextStep);
      setCurrentStep(nextStep);
      setStepLogs(prev => [...prev, result]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setStepLogs([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xl text-slate-800">
        {/* Header */}
        <div className="bg-slate-50 px-6 py-4 flex items-center justify-between border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800">
              <PlayCircle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-black text-slate-900 uppercase font-mono tracking-wide">
                  POLARIS Digital Twin Simulation Engine
                </h2>
                <span className="px-2 py-0.5 rounded bg-amber-100 border border-amber-300 text-amber-900 text-[10px] font-bold uppercase font-mono">
                  DEMO SIMULATION
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Deterministic operational walkthrough for SIH evaluation & presentation
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Step Progress Bar */}
          <div className="grid grid-cols-4 gap-2">
            {scenarioSteps.map((s) => {
              const isCompleted = currentStep >= s.step;
              const isCurrent = currentStep === s.step - 1;
              return (
                <div 
                  key={s.step} 
                  className={`p-2.5 rounded-xl border text-left text-xs transition ${
                    isCompleted ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold' :
                    isCurrent ? 'bg-indigo-50 border-indigo-300 text-indigo-900 ring-2 ring-indigo-400/30' :
                    'bg-slate-50 border-slate-200 text-slate-400'
                  }`}
                >
                  <div className="font-mono font-bold text-[10px]">STEP {s.step}</div>
                  <div className="font-semibold text-xs mt-0.5 truncate">{s.title.split('. ')[1]}</div>
                </div>
              );
            })}
          </div>

          {/* Current Step Description Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <h4 className="font-bold text-sm text-emerald-800 flex items-center space-x-2 font-mono">
              <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
              <span>{currentStep === 4 ? "Simulation Completed Successfully" : scenarioSteps[currentStep]?.title || "Ready to Start"}</span>
            </h4>
            <p className="text-xs text-slate-700 font-medium leading-relaxed">
              {currentStep === 4 
                ? "All 4 stages executed deterministically. Check the Dashboard, Cargo, Inventory, and Emergency pages to see real updated state!"
                : scenarioSteps[currentStep]?.desc || "Click below to execute the end-to-end expedition logistics workflow."}
            </p>
          </div>

          {/* Execution Log */}
          {stepLogs.length > 0 && (
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              <div className="text-[10px] font-mono text-slate-500 uppercase font-medium">Live Execution Output:</div>
              {stepLogs.map((log, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-200 text-xs flex items-center space-x-2 animate-fadeIn">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="text-slate-800 font-mono text-[11px] font-medium">{log.message}</span>
                </div>
              ))}
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            <button
              onClick={handleReset}
              className="flex items-center space-x-1 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Simulation</span>
            </button>

            <button
              onClick={handleExecuteNextStep}
              disabled={loading || currentStep >= 4}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs flex items-center space-x-2 shadow-md shadow-emerald-600/20 transition"
            >
              <span>{currentStep === 0 ? "Begin Step 1" : currentStep >= 4 ? "Completed" : `Advance to Step ${currentStep + 1}`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

