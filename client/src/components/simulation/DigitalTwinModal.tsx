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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-polar-950 border border-blue-500/50 rounded-2xl overflow-hidden shadow-2xl polar-glow">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-950 via-indigo-900 to-polar-950 px-6 py-4 flex items-center justify-between border-b border-blue-600/40">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-blue-600/30 border border-blue-400 text-cyan-300">
              <PlayCircle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-black text-slate-100 uppercase font-mono tracking-wide">
                  POLARIS Digital Twin Simulation Engine
                </h2>
                <span className="px-2 py-0.5 rounded bg-amber-500 text-polar-950 text-[10px] font-bold uppercase font-mono">
                  DEMO SIMULATION
                </span>
              </div>
              <p className="text-xs text-blue-200">
                Deterministic operational walkthrough for SIH evaluation & presentation
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg bg-polar-900">
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
                    isCompleted ? 'bg-blue-950/80 border-cyan-400 text-cyan-200' :
                    isCurrent ? 'bg-polar-900 border-slate-700 text-slate-200 ring-1 ring-blue-400' :
                    'bg-polar-900/40 border-slate-800 text-slate-500'
                  }`}
                >
                  <div className="font-mono font-bold text-[10px]">STEP {s.step}</div>
                  <div className="font-semibold text-xs mt-0.5 truncate">{s.title.split('. ')[1]}</div>
                </div>
              );
            })}
          </div>

          {/* Current Step Description Card */}
          <div className="p-4 rounded-xl bg-polar-900/80 border border-slate-800 space-y-2">
            <h4 className="font-bold text-sm text-cyan-300 flex items-center space-x-2 font-mono">
              <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>{currentStep === 4 ? "Simulation Completed Successfully" : scenarioSteps[currentStep]?.title || "Ready to Start"}</span>
            </h4>
            <p className="text-xs text-slate-300">
              {currentStep === 4 
                ? "All 4 stages executed deterministically. Check the Dashboard, Cargo, Inventory, and Emergency pages to see real updated state!"
                : scenarioSteps[currentStep]?.desc || "Click below to execute the end-to-end expedition logistics workflow."}
            </p>
          </div>

          {/* Execution Log */}
          {stepLogs.length > 0 && (
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Live Execution Output:</div>
              {stepLogs.map((log, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-polar-950 border border-cyan-900/40 text-xs flex items-center space-x-2 animate-fadeIn">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="text-slate-200 font-mono text-[11px]">{log.message}</span>
                </div>
              ))}
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <button
              onClick={handleReset}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-polar-900 hover:bg-polar-850 text-slate-400 text-xs font-mono transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Simulation</span>
            </button>

            <button
              onClick={handleExecuteNextStep}
              disabled={loading || currentStep >= 4}
              className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold text-xs flex items-center space-x-2 shadow-lg shadow-cyan-600/30 transition"
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
