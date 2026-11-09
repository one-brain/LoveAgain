import React, { useState } from 'react';
import {
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Input,
  Field,
  TabList,
  Tab,
  ToggleButton,
  Badge,
  Spinner,
} from '@fluentui/react-components';
import {
  Payment16Regular,
  QrCode20Regular,
  BuildingBank16Regular,
  ShieldCheckmark16Regular,
  CheckmarkCircle20Regular,
  DismissCircle16Regular,
  Dismiss20Regular,
  Phone16Regular,
} from '@fluentui/react-icons';
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
  { name: 'Google Pay', id: 'gpay' },
  { name: 'PhonePe', id: 'phonepe' },
  { name: 'Paytm UPI', id: 'paytm' },
  { name: 'BHIM', id: 'bhim' },
  { name: 'Cred UPI', id: 'cred' },
];

const TEST_CARDS = [
  { brand: 'Visa (Success)', number: '4111 •••• •••• 1111', raw: '4111111111111111', exp: '12/28', cvv: '123' },
  { brand: 'MasterCard (Success)', number: '5123 •••• •••• 2346', raw: '5123456789012346', exp: '10/29', cvv: '456' },
  { brand: 'RuPay (Success)', number: '6071 •••• •••• 0123', raw: '6071234567890123', exp: '06/27', cvv: '789' },
];

const NETBANKING_BANKS = [
  { name: 'HDFC Bank', code: 'HDFC' },
  { name: 'ICICI Bank', code: 'ICIC' },
  { name: 'State Bank of India', code: 'SBIN' },
  { name: 'Axis Bank', code: 'UTIB' },
  { name: 'Kotak Mahindra Bank', code: 'KKBK' },
];

export const RazorpaySandboxModal: React.FC<RazorpaySandboxModalProps> = ({
  isOpen,
  orderId,
  amount,
  currency: _currency = 'INR',
  title = 'Safe payment',
  description = 'Protected companion session checkout',
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

  if (!isOpen) return null;

  const handleSimulateSuccess = () => {
    setIsProcessing(true);
    setProcessingStatus('Connecting to Sandbox Bank Gateway...');

    setTimeout(() => {
      setProcessingStatus('Authorizing test credentials...');
    }, 400);

    setTimeout(() => {
      setProcessingStatus('Payment authorized! Returning to Cue...');
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
    <Dialog open={isOpen} onOpenChange={(_, data) => !data.open && !isProcessing && onClose()}>
      <DialogSurface className="max-w-md w-full bg-card text-card-foreground rounded-2xl border border-border p-6">
        <DialogBody>
          <DialogTitle
            action={
              !isProcessing ? (
                <Button
                  appearance="subtle"
                  aria-label="Close Razorpay Sandbox modal"
                  icon={<Dismiss20Regular />}
                  onClick={onClose}
                />
              ) : undefined
            }
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge appearance="filled" color="brand">
                  Sandbox
                </Badge>
                <span className="text-caption1 font-normal text-muted-foreground">
                  Razorpay simulator (test mode)
                </span>
              </div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span id="razorpay-sandbox-title" className="text-subtitle1 font-semibold text-foreground block">
                    {title}
                  </span>
                  <span className="text-caption1 font-normal text-muted-foreground block">
                    {description}
                  </span>
                  <span className="text-caption2 font-mono tabular text-muted-foreground block mt-0.5 truncate max-w-[200px]">
                    Order: {orderId}
                  </span>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-caption2 text-muted-foreground block">Amount</span>
                  <span className="text-subtitle1 font-semibold font-mono text-brand-fg tabular">
                    {formatINR(amount)}
                  </span>
                </div>
              </div>
            </div>
          </DialogTitle>

          <DialogContent className="space-y-4 pt-4">
            {isProcessing ? (
              <div className="py-12 px-4 flex flex-col items-center justify-center text-center space-y-4">
                <Spinner size="large" />
                <div>
                  <h4 className="text-body1 font-semibold text-foreground">{processingStatus}</h4>
                  <p className="text-caption1 text-muted-foreground mt-1">
                    Please do not close this window or hit refresh.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <TabList
                  selectedValue={activeTab}
                  onTabSelect={(_, data) => setActiveTab(data.value as 'upi' | 'card' | 'netbanking')}
                  className="border-b border-border"
                >
                  <Tab value="upi" icon={<Phone16Regular />}>
                    UPI / QR
                  </Tab>
                  <Tab value="card" icon={<Payment16Regular />}>
                    Cards
                  </Tab>
                  <Tab value="netbanking" icon={<BuildingBank16Regular />}>
                    NetBanking
                  </Tab>
                </TabList>

                {activeTab === 'upi' && (
                  <div className="space-y-3">
                    <div className="text-caption1 font-semibold text-muted-foreground">Select test UPI app:</div>
                    <div className="grid grid-cols-3 gap-2">
                      {UPI_APPS.map((app) => (
                        <ToggleButton
                          key={app.id}
                          size="small"
                          checked={selectedUpiApp === app.id}
                          appearance={selectedUpiApp === app.id ? 'primary' : 'outline'}
                          onClick={() => setSelectedUpiApp(app.id)}
                          className="min-h-10"
                        >
                          {app.name}
                        </ToggleButton>
                      ))}
                    </div>

                    <Field label="Or enter test UPI ID (VPA)">
                      <Input
                        id="test-vpa"
                        value={customVpa}
                        onChange={(_, data) => setCustomVpa(data.value)}
                        placeholder="e.g. success@razorpay"
                        contentAfter={
                          <Badge appearance="tint" color="success">
                            Verified
                          </Badge>
                        }
                        className="font-mono"
                      />
                    </Field>

                    <div className="p-2.5 rounded-lg bg-muted border border-border flex items-center gap-2 text-caption1 text-muted-foreground">
                      <QrCode20Regular className="text-brand-fg shrink-0" />
                      <span>Simulating QR scan & instant UPI auto-approval.</span>
                    </div>
                  </div>
                )}

                {activeTab === 'card' && (
                  <div className="space-y-3">
                    <div className="text-caption1 font-semibold text-muted-foreground">Select pre-configured test card:</div>
                    <div className="space-y-2">
                      {TEST_CARDS.map((card, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedCardIdx(idx)}
                          className={`w-full p-3 rounded-lg border text-left flex items-center justify-between transition-colors cursor-pointer ${
                            selectedCardIdx === idx
                              ? 'bg-accent-light border-accent text-foreground'
                              : 'bg-card border-border text-muted-foreground hover:bg-muted'
                          }`}
                        >
                          <div>
                            <p className="text-caption1 font-semibold text-foreground">{card.brand}</p>
                            <p className="text-caption1 font-mono tabular text-muted-foreground mt-0.5">{card.number}</p>
                          </div>
                          <div className="text-right text-caption2 font-mono tabular text-muted-foreground">
                            <div>EXP: {card.exp}</div>
                            <div>CVV: {card.cvv}</div>
                          </div>
                        </button>
                      ))}
                    </div>

                    <div className="p-2.5 rounded-lg bg-muted border border-border flex items-center justify-between text-caption1 text-muted-foreground">
                      <span>3D Secure test OTP:</span>
                      <span className="font-mono tabular font-semibold text-brand-fg">123456 (Auto-submitted)</span>
                    </div>
                  </div>
                )}

                {activeTab === 'netbanking' && (
                  <div className="space-y-3">
                    <div className="text-caption1 font-semibold text-muted-foreground">Select test bank:</div>
                    <div className="space-y-1.5">
                      {NETBANKING_BANKS.map((bank) => (
                        <button
                          key={bank.code}
                          type="button"
                          onClick={() => setSelectedBank(bank.code)}
                          className={`w-full p-2.5 rounded-lg border text-left flex items-center justify-between transition-colors cursor-pointer ${
                            selectedBank === bank.code
                              ? 'bg-accent-light border-accent text-foreground'
                              : 'bg-card border-border text-muted-foreground hover:bg-muted'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <BuildingBank16Regular className="text-brand-fg" />
                            <span className="text-caption1 font-semibold text-foreground">{bank.name}</span>
                          </div>
                          <span className="text-caption2 font-mono text-muted-foreground">{bank.code}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-success-light border border-border text-caption1 text-success">
                  <ShieldCheckmark16Regular className="shrink-0" />
                  <span>Sandbox mode: No real funds are debited from your bank account.</span>
                </div>
              </>
            )}
          </DialogContent>

          {!isProcessing && (
            <DialogActions className="pt-4 flex flex-col gap-2">
              <Button
                appearance="primary"
                size="large"
                onClick={handleSimulateSuccess}
                icon={<CheckmarkCircle20Regular />}
                className="w-full min-h-11 tabular"
              >
                Approve • {formatINR(amount)}
              </Button>
              <div className="grid grid-cols-2 gap-2 w-full">
                <Button
                  appearance="outline"
                  onClick={handleSimulateFailure}
                  icon={<DismissCircle16Regular />}
                  className="min-h-11 text-destructive border-destructive"
                >
                  Decline
                </Button>
                <Button
                  appearance="secondary"
                  onClick={onClose}
                  className="min-h-11"
                >
                  Cancel
                </Button>
              </div>
            </DialogActions>
          )}
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};
