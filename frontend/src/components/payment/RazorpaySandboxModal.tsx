import React, { useState, useEffect } from 'react';
import {
  CreditCardIcon,
  QrCodeIcon,
  BuildingLibraryIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  XCircleIcon,
  XMarkIcon,
  ArrowPathIcon,
  DevicePhoneMobileIcon,
} from '@heroicons/react/24/outline';
import { formatINR } from '../../utils/currency';

export interface RazorpaySandboxPaymentResult {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  amount: number;
  method: 'upi' | 'card' | 'netbanking';
}

interface RazorpaySandboxModalProps {
  isOpen: boolean;
  orderId: string;
  amount: number;
  currency?: string;
  title?: string;
  description?: string;
  onSuccess: (result: RazorpaySandboxPaymentResult) => void;
  onError?: (error: string) => void;
  onClose: () => void;
}

const UPI_APPS = [
  { name: 'Google Pay', icon: '🟢', id: 'gpay' },
  { name: 'PhonePe', icon: '🟣', id: 'phonepe' },
  { name: 'Paytm UPI', icon: '🔵', id: 'paytm' },
  { name: 'BHIM', icon: '🟠', id: 'bhim' },
  { name: 'Cred UPI', icon: '⚫', id: 'cred' },
];

const TEST_CARDS = [
  { brand: 'Visa (Success)', number: '4111 •••• •••• 1111', raw: '4111111111111111', exp: '12/28', cvv: '123' },
  { brand: 'MasterCard (Success)', number: '5123 •••• •••• 2346', raw: '5123456789012346', exp: '10/29', cvv: '456' },
  { brand: 'RuPay (Success)', number: '6071 •••• •••• 0123', raw: '6071234567890123', exp: '06/27', cvv: '789' },
];

const NETBANKING_BANKS = [
  { name: 'HDFC Bank', code: 'HDFC', icon: '🏦' },
  { name: 'ICICI Bank', code: 'ICIC', icon: '🏦' },
  { name: 'State Bank of India', code: 'SBIN', icon: '🏦' },
  { name: 'Axis Bank', code: 'UTIB', icon: '🏦' },
  { name: 'Kotak Mahindra Bank', code: 'KKBK', icon: '🏦' },
];

export const RazorpaySandboxModal: React.FC<RazorpaySandboxModalProps> = ({
  isOpen,
  orderId,
  amount,
  currency: _currency = 'INR',
  title = 'Safe Payment',
  description = 'Protected Companion Session Checkout',
  onSuccess,
  onError,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [selectedUpiApp, setSelectedUpiApp] = useState('gpay');
  const [customVpa, setCustomVpa] = useState('success@razorpay');
  const [selectedCardIdx, setSelectedCardIdx] = useState(0);
  const [selectedBank, setSelectedBank] = useState('HDFC');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isProcessing) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isProcessing, onClose]);

  if (!isOpen) return null;

  const handleSimulateSuccess = () => {
    setIsProcessing(true);
    setProcessingStatus('Connecting to Sandbox Bank Gateway...');

    setTimeout(() => {
      setProcessingStatus('Authorizing test credentials...');
    }, 400);

    setTimeout(() => {
      setProcessingStatus('Payment Authorized! Returning to Cue...');
    }, 800);

    setTimeout(() => {
      setIsProcessing(false);
      setProcessingStatus(null);
      const paymentId = `pay_sandbox_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const signature = `sig_sandbox_${Date.now()}`;
      onSuccess({
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: signature,
        amount,
        method: activeTab,
      });
    }, 1200);
  };

  const handleSimulateFailure = () => {
    setIsProcessing(true);
    setProcessingStatus('Simulating bank decline...');

    setTimeout(() => {
      setIsProcessing(false);
      setProcessingStatus(null);
      if (onError) {
        onError('Sandbox payment simulation: Transaction declined by issuing bank (Test Failure).');
      }
    }, 800);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="razorpay-sandbox-title"
      className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="relative w-full max-w-md bg-card text-card-foreground rounded-3xl border border-border/90 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Top Razorpay Sandbox Bar */}
        <div className="bg-linear-to-r from-sky-600 to-indigo-700 text-white px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-tight text-sm font-sans flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 rounded bg-white/20 text-[10px] font-mono uppercase tracking-widest">
                Sandbox
              </span>
              <span>Razorpay Simulator</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] opacity-85 font-mono">Test Mode</span>
            {!isProcessing && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close Razorpay Sandbox modal"
                className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <XMarkIcon className="w-4 h-4 text-white" />
              </button>
            )}
          </div>
        </div>

        {/* Order Header */}
        <div className="p-5 border-b border-border/70 bg-muted/20">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 id="razorpay-sandbox-title" className="text-sm font-bold text-foreground">
                {title}
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">{description}</p>
              <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
                <span>Order:</span>
                <span className="px-1.5 py-0.2 rounded bg-muted border border-border/80 truncate max-w-[140px]">
                  {orderId}
                </span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Amount</span>
              <span className="text-xl font-bold font-mono text-accent tabular-nums">
                {formatINR(amount)}
              </span>
            </div>
          </div>
        </div>

        {/* Processing Overlay */}
        {isProcessing ? (
          <div className="py-14 px-6 flex flex-col items-center justify-center text-center space-y-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-accent/15 flex items-center justify-center text-accent">
                <ArrowPathIcon className="w-7 h-7 animate-spin" />
              </div>
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground">{processingStatus}</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Please do not close this window or hit refresh.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            {/* Method Tabs */}
            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-muted/60 border border-border/60">
              <button
                type="button"
                onClick={() => setActiveTab('upi')}
                className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'upi'
                    ? 'bg-card text-foreground shadow-xs border border-border/60'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <DevicePhoneMobileIcon className="w-3.5 h-3.5 text-accent" />
                <span>UPI / QR</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('card')}
                className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'card'
                    ? 'bg-card text-foreground shadow-xs border border-border/60'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <CreditCardIcon className="w-3.5 h-3.5 text-accent" />
                <span>Cards</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('netbanking')}
                className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'netbanking'
                    ? 'bg-card text-foreground shadow-xs border border-border/60'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <BuildingLibraryIcon className="w-3.5 h-3.5 text-accent" />
                <span>NetBanking</span>
              </button>
            </div>

            {/* UPI Tab Content */}
            {activeTab === 'upi' && (
              <div className="space-y-3">
                <div className="text-[11px] font-semibold text-muted-foreground">Select Test UPI App:</div>
                <div className="grid grid-cols-3 gap-2">
                  {UPI_APPS.map((app) => (
                    <button
                      key={app.id}
                      type="button"
                      onClick={() => setSelectedUpiApp(app.id)}
                      className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all ${
                        selectedUpiApp === app.id
                          ? 'bg-accent/10 border-accent text-foreground shadow-2xs'
                          : 'bg-card border-border/80 text-muted-foreground hover:bg-muted/50'
                      }`}
                    >
                      <span className="text-sm">{app.icon}</span>
                      <span className="text-xs font-medium truncate">{app.name}</span>
                    </button>
                  ))}
                </div>

                <div className="pt-1">
                  <label htmlFor="test-vpa" className="text-[11px] font-semibold text-muted-foreground block mb-1">
                    Or Enter Test UPI ID (VPA):
                  </label>
                  <div className="relative">
                    <input
                      id="test-vpa"
                      type="text"
                      value={customVpa}
                      onChange={(e) => setCustomVpa(e.target.value)}
                      placeholder="e.g. success@razorpay"
                      className="w-full px-3 py-2 rounded-xl border border-border/80 bg-background text-foreground text-xs font-mono focus:ring-2 focus:ring-accent focus:outline-hidden"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-emerald-600 font-bold">
                      ✓ Verified
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60 flex items-center gap-2 text-[11px] text-muted-foreground">
                  <QrCodeIcon className="w-4 h-4 text-accent shrink-0" />
                  <span>Simulating QR scan & instant UPI auto-approval.</span>
                </div>
              </div>
            )}

            {/* Cards Tab Content */}
            {activeTab === 'card' && (
              <div className="space-y-3">
                <div className="text-[11px] font-semibold text-muted-foreground">Select Pre-Configured Test Card:</div>
                <div className="space-y-2">
                  {TEST_CARDS.map((card, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedCardIdx(idx)}
                      className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                        selectedCardIdx === idx
                          ? 'bg-accent/10 border-accent text-foreground shadow-2xs'
                          : 'bg-card border-border/80 text-muted-foreground hover:bg-muted/50'
                      }`}
                    >
                      <div>
                        <p className="text-xs font-bold text-foreground">{card.brand}</p>
                        <p className="text-[11px] font-mono text-muted-foreground mt-0.5">{card.number}</p>
                      </div>
                      <div className="text-right text-[10px] font-mono text-muted-foreground">
                        <div>EXP: {card.exp}</div>
                        <div>CVV: {card.cvv}</div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>3D Secure Test OTP:</span>
                  <span className="font-mono font-bold text-accent">123456 (Auto-submitted)</span>
                </div>
              </div>
            )}

            {/* NetBanking Tab Content */}
            {activeTab === 'netbanking' && (
              <div className="space-y-3">
                <div className="text-[11px] font-semibold text-muted-foreground">Select Test Bank:</div>
                <div className="space-y-1.5">
                  {NETBANKING_BANKS.map((bank) => (
                    <button
                      key={bank.code}
                      type="button"
                      onClick={() => setSelectedBank(bank.code)}
                      className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                        selectedBank === bank.code
                          ? 'bg-accent/10 border-accent text-foreground shadow-2xs'
                          : 'bg-card border-border/80 text-muted-foreground hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{bank.icon}</span>
                        <span className="text-xs font-semibold text-foreground">{bank.name}</span>
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground">{bank.code}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Security Guarantee Strip */}
            <div className="flex items-center gap-2 p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-700 dark:text-emerald-400">
              <ShieldCheckIcon className="w-4 h-4 shrink-0" />
              <span>Sandbox Mode: No real funds are debited from your bank account.</span>
            </div>

            {/* Simulator Action Buttons */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={handleSimulateSuccess}
                className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CheckCircleIcon className="w-4 h-4" />
                <span>Simulate Successful Payment ({formatINR(amount)})</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleSimulateFailure}
                  className="py-2 px-3 rounded-xl font-semibold text-xs border border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-all flex items-center justify-center gap-1"
                >
                  <XCircleIcon className="w-3.5 h-3.5" />
                  <span>Simulate Failure</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="py-2 px-3 rounded-xl font-semibold text-xs border border-border text-muted-foreground hover:bg-muted transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
