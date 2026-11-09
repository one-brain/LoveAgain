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
  ToggleButton,
  Badge,
  MessageBar,
  MessageBarBody,
  Spinner,
} from '@fluentui/react-components';
import {
  ArrowUpRight16Regular,
  Checkmark16Regular,
  Dismiss20Regular,
} from '@fluentui/react-icons';
import {
  useGetProviderEarningsQuery,
  useRequestPayoutMutation,
  useGetPayoutHistoryQuery,
} from '../../store/paymentApi';
import { formatINR } from '../../utils/currency';

export const ProviderEarningsCard: React.FC = () => {
  const { data: earnings, isLoading, refetch } = useGetProviderEarningsQuery();
  const { data: payoutHistory } = useGetPayoutHistoryQuery();
  const [requestPayout, { isLoading: isRequestingPayout }] = useRequestPayoutMutation();

  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState<string>('');
  const [payoutType, setPayoutType] = useState<'Upi' | 'BankTransfer'>('Upi');
  const [destination, setDestination] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const clearedBalance = earnings?.clearedBalance ?? 0;
  const pendingBalance = earnings?.pendingBalance ?? 0;
  const grossRevenue = earnings?.grossRevenue ?? 0;
  const platformCommission = earnings?.platformCommission ?? 0;

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    const amountNum = parseFloat(payoutAmount);
    if (isNaN(amountNum) || amountNum < 100) {
      setStatusMessage({ type: 'error', text: 'Minimum withdrawal amount is ₹100.' });
      return;
    }

    if (amountNum > clearedBalance) {
      setStatusMessage({ type: 'error', text: `Amount exceeds available cleared balance (${formatINR(clearedBalance)}).` });
      return;
    }

    if (!destination.trim()) {
      setStatusMessage({ type: 'error', text: payoutType === 'Upi' ? 'Please enter a valid UPI VPA.' : 'Please enter bank details.' });
      return;
    }

    try {
      await requestPayout({
        amount: amountNum,
        payoutType,
        destination: destination.trim(),
      }).unwrap();

      setStatusMessage({
        type: 'success',
        text: `Payout request for ${formatINR(amountNum)} submitted successfully!`,
      });
      setPayoutAmount('');
      setDestination('');
      await refetch();
      setTimeout(() => {
        setIsPayoutModalOpen(false);
        setStatusMessage(null);
      }, 2000);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.data?.error || 'Failed to submit payout request.' });
    }
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <span className="text-caption1 font-semibold text-brand-fg mb-0.5 block">
            Earnings & payouts
          </span>
          <h2 className="text-subtitle1 font-semibold text-foreground">
            Guest earnings & withdrawals
          </h2>
          <p className="text-caption1 text-muted-foreground mt-0.5">
            Your take-home earnings (85%) from completed outings with transparent 15% platform service fees.
          </p>
        </div>

        <Button
          appearance="primary"
          size="large"
          onClick={() => setIsPayoutModalOpen(true)}
          disabled={clearedBalance < 100}
          icon={<ArrowUpRight16Regular />}
          className="min-h-11 tabular self-start sm:self-auto"
        >
          Withdraw • {formatINR(clearedBalance)}
        </Button>
      </div>

      {/* Financial Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-success-light border border-border space-y-1">
          <span className="text-caption1 font-semibold text-success">
            Cleared & withdrawable
          </span>
          <p className="text-title3 font-semibold font-mono tabular text-success">
            {isLoading ? '...' : formatINR(clearedBalance)}
          </p>
          <p className="text-caption2 text-muted-foreground">Ready for instant UPI transfer</p>
        </div>

        <div className="p-4 rounded-lg bg-trust-light border border-trust-border space-y-1">
          <span className="text-caption1 font-semibold text-trust">
            Pending clearance
          </span>
          <p className="text-title3 font-semibold font-mono tabular text-trust">
            {isLoading ? '...' : formatINR(pendingBalance)}
          </p>
          <p className="text-caption2 text-muted-foreground">Held until session ends</p>
        </div>

        <div className="p-4 rounded-lg bg-muted border border-border space-y-1">
          <span className="text-caption1 font-semibold text-muted-foreground">
            Total gross bookings
          </span>
          <p className="text-title3 font-semibold font-mono tabular text-foreground">
            {isLoading ? '...' : formatINR(grossRevenue)}
          </p>
          <p className="text-caption2 text-muted-foreground">Lifetime volume generated</p>
        </div>

        <div className="p-4 rounded-lg bg-muted border border-border space-y-1">
          <span className="text-caption1 font-semibold text-muted-foreground">
            Platform service fee (15%)
          </span>
          <p className="text-title3 font-semibold font-mono tabular text-foreground">
            {isLoading ? '...' : `₹${platformCommission.toLocaleString('en-IN')}`}
          </p>
          <p className="text-caption2 text-muted-foreground">Platform safety & 24/7 support fee</p>
        </div>
      </div>

      {/* Payout History Preview */}
      {payoutHistory && payoutHistory.length > 0 && (
        <div className="pt-2 border-t border-border">
          <h3 className="text-caption1 font-semibold text-muted-foreground mb-3">
            Recent withdrawal transfers
          </h3>
          <div className="space-y-2">
            {payoutHistory.slice(0, 3).map((payout) => (
              <div
                key={payout.payoutId}
                className="p-3 rounded-lg bg-muted border border-border flex items-center justify-between text-caption1"
              >
                <div className="flex items-center gap-2.5">
                  <span className="p-1.5 rounded bg-success-light text-success">
                    <Checkmark16Regular />
                  </span>
                  <div>
                    <span className="font-semibold text-foreground font-mono tabular">
                      ₹{payout.amount.toLocaleString('en-IN')}
                    </span>
                    <span className="text-muted-foreground ml-2">to {payout.destination}</span>
                  </div>
                </div>
                <div className="text-right">
                  <Badge appearance="tint" color="success">
                    {payout.status}
                  </Badge>
                  <p className="text-caption2 text-muted-foreground mt-0.5 tabular">
                    {new Date(payout.createdAt).toLocaleDateString('en-IN')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Withdrawal Modal */}
      <Dialog
        open={isPayoutModalOpen}
        onOpenChange={(_, data) => {
          if (!data.open) {
            setIsPayoutModalOpen(false);
            setStatusMessage(null);
          }
        }}
      >
        <DialogSurface className="max-w-md w-full bg-card text-card-foreground rounded-2xl border border-border p-6">
          <form onSubmit={handleWithdraw}>
            <DialogBody>
              <DialogTitle
                action={
                  <Button
                    appearance="subtle"
                    aria-label="Close payout dialog"
                    icon={<Dismiss20Regular />}
                    onClick={() => {
                      setIsPayoutModalOpen(false);
                      setStatusMessage(null);
                    }}
                  />
                }
              >
                <span className="text-subtitle1 font-semibold text-foreground">
                  Withdraw cleared earnings
                </span>
              </DialogTitle>

              <DialogContent className="space-y-4 pt-4">
                {statusMessage && (
                  <MessageBar intent={statusMessage.type === 'success' ? 'success' : 'error'}>
                    <MessageBarBody>{statusMessage.text}</MessageBarBody>
                  </MessageBar>
                )}

                <div>
                  <label className="block text-caption1 font-semibold text-muted-foreground mb-1.5">
                    Withdrawal method
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <ToggleButton
                      checked={payoutType === 'Upi'}
                      appearance={payoutType === 'Upi' ? 'primary' : 'outline'}
                      onClick={() => setPayoutType('Upi')}
                      className="min-h-11"
                    >
                      UPI ID (VPA)
                    </ToggleButton>
                    <ToggleButton
                      checked={payoutType === 'BankTransfer'}
                      appearance={payoutType === 'BankTransfer' ? 'primary' : 'outline'}
                      onClick={() => setPayoutType('BankTransfer')}
                      className="min-h-11"
                    >
                      Bank (NEFT / IMPS)
                    </ToggleButton>
                  </div>
                </div>

                <Field
                  label="Amount to withdraw (₹)"
                  hint={<span className="font-mono tabular">Available: {formatINR(clearedBalance)}</span>}
                  required
                >
                  <Input
                    type="number"
                    value={payoutAmount}
                    onChange={(_, data) => setPayoutAmount(data.value)}
                    placeholder="Min ₹100"
                    min={100}
                    max={clearedBalance}
                    contentBefore={<span className="font-mono font-semibold">₹</span>}
                    className="font-mono tabular"
                    required
                  />
                </Field>

                <Field
                  label={payoutType === 'Upi' ? 'UPI ID (VPA)' : 'Bank account + IFSC'}
                  required
                >
                  <Input
                    value={destination}
                    onChange={(_, data) => setDestination(data.value)}
                    placeholder={
                      payoutType === 'Upi'
                        ? 'e.g. guest@okhdfcbank or 9876543210@paytm'
                        : 'e.g. 123456789012, HDFC0001234'
                    }
                    required
                  />
                </Field>

                <div className="p-3 rounded-lg bg-muted text-caption1 text-muted-foreground space-y-1">
                  <div className="flex justify-between">
                    <span>Transfer fee:</span>
                    <span className="font-semibold text-foreground tabular">₹5.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated arrival:</span>
                    <span className="text-success font-semibold">Instant IMPS / UPI</span>
                  </div>
                </div>
              </DialogContent>

              <DialogActions className="pt-4">
                <Button
                  appearance="secondary"
                  size="large"
                  className="min-h-11"
                  onClick={() => {
                    setIsPayoutModalOpen(false);
                    setStatusMessage(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  appearance="primary"
                  size="large"
                  className="min-h-11"
                  disabled={isRequestingPayout}
                  icon={isRequestingPayout ? <Spinner size="tiny" /> : undefined}
                >
                  {isRequestingPayout ? 'Transferring...' : 'Withdraw'}
                </Button>
              </DialogActions>
            </DialogBody>
          </form>
        </DialogSurface>
      </Dialog>
    </div>
  );
};
