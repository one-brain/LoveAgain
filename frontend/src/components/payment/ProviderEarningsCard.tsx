import React, { useState } from 'react';
import {
  ArrowUpRightIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
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
    <div className="bg-card rounded-3xl border border-border/80 p-6 sm:p-8 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-accent mb-0.5 block">
            Financial Settlement
          </span>
          <h2 className="text-xl font-bold font-serif text-foreground">
            Earnings & Razorpay UPI Payouts
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Your earnings from verified companion bookings with 15% platform commission automatically settled.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsPayoutModalOpen(true)}
          disabled={clearedBalance < 100}
          className="px-5 py-2.5 rounded-2xl bg-accent text-accent-foreground font-semibold text-xs transition-all shadow-sm flex items-center gap-2 hover:opacity-95 disabled:opacity-50 cursor-pointer self-start sm:self-auto"
        >
          <ArrowUpRightIcon className="w-4 h-4" />
          <span>Withdraw to UPI ({formatINR(clearedBalance)})</span>
        </button>
      </div>

      {/* Financial Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {/* Cleared Balance */}
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            Cleared & Withdrawable
          </span>
          <p className="text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
            {isLoading ? '...' : formatINR(clearedBalance)}
          </p>
          <p className="text-[10px] text-muted-foreground">Ready for instant UPI transfer</p>
        </div>

        {/* Pending Escrow */}
        <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/20 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400">
            Pending Clearance
          </span>
          <p className="text-2xl font-extrabold font-mono text-sky-600 dark:text-sky-400">
            {isLoading ? '...' : formatINR(pendingBalance)}
          </p>
          <p className="text-[10px] text-muted-foreground">Held until session ends</p>
        </div>

        {/* Gross Revenue */}
        <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Total Gross Bookings
          </span>
          <p className="text-2xl font-extrabold font-mono text-foreground">
            {isLoading ? '...' : formatINR(grossRevenue)}
          </p>
          <p className="text-[10px] text-muted-foreground">Lifetime volume generated</p>
        </div>

        {/* Platform Commission */}
        <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Platform Take-Rate (15%)
          </span>
          <p className="text-2xl font-extrabold font-mono text-foreground">
            {isLoading ? '...' : `₹${platformCommission.toLocaleString('en-IN')}`}
          </p>
          <p className="text-[10px] text-muted-foreground">Platform hosting & trust fee</p>
        </div>
      </div>

      {/* Payout History Preview */}
      {payoutHistory && payoutHistory.length > 0 && (
        <div className="pt-2 border-t border-border/50">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
            Recent Withdrawal Transfers
          </h3>
          <div className="space-y-2">
            {payoutHistory.slice(0, 3).map((payout) => (
              <div
                key={payout.payoutId}
                className="p-3 rounded-xl bg-muted/20 border border-border/40 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-600 font-bold">✓</span>
                  <div>
                    <span className="font-semibold text-foreground font-mono">₹{payout.amount.toLocaleString('en-IN')}</span>
                    <span className="text-muted-foreground ml-2">to {payout.destination}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/15 text-emerald-600">
                    {payout.status}
                  </span>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {new Date(payout.createdAt).toLocaleDateString('en-IN')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Withdrawal Modal */}
      {isPayoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-card text-card-foreground rounded-3xl border border-border shadow-2xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <h3 className="text-lg font-bold font-serif text-foreground">Withdraw Cleared Earnings</h3>
              <button
                onClick={() => {
                  setIsPayoutModalOpen(false);
                  setStatusMessage(null);
                }}
                className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {statusMessage && (
              <div
                className={`flex items-center gap-2 p-3 rounded-xl text-xs border ${
                  statusMessage.type === 'success'
                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                    : 'bg-destructive/10 text-destructive border-destructive/20'
                }`}
              >
                {statusMessage.type === 'success' ? (
                  <CheckCircleIcon className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <ExclamationCircleIcon className="w-4 h-4 flex-shrink-0" />
                )}
                <span>{statusMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleWithdraw} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
                  Payout Method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPayoutType('Upi')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      payoutType === 'Upi'
                        ? 'border-accent bg-accent/15 text-accent'
                        : 'border-border bg-muted/30 text-foreground'
                    }`}
                  >
                    UPI ID (VPA)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayoutType('BankTransfer')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      payoutType === 'BankTransfer'
                        ? 'border-accent bg-accent/15 text-accent'
                        : 'border-border bg-muted/30 text-foreground'
                    }`}
                  >
                    Bank (NEFT / IMPS)
                  </button>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">
                    Amount to Withdraw (₹)
                  </label>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    Available: {formatINR(clearedBalance)}
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground font-mono font-bold">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    placeholder="Min ₹100"
                    min="100"
                    max={clearedBalance}
                    required
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-muted/30 border border-border text-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
                  {payoutType === 'Upi' ? 'UPI ID (VPA)' : 'Bank Account + IFSC'}
                </label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder={
                    payoutType === 'Upi'
                      ? 'e.g. companion@okhdfcbank or 9876543210@paytm'
                      : 'e.g. 123456789012, HDFC0001234'
                  }
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-muted/30 border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div className="p-3 rounded-xl bg-muted/40 text-[11px] text-muted-foreground space-y-1">
                <div className="flex justify-between">
                  <span>Transfer Fee:</span>
                  <span className="font-semibold text-foreground">₹5.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Arrival:</span>
                  <span className="text-emerald-600 font-semibold">Instant IMPS / UPI</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isRequestingPayout}
                className="w-full py-3 rounded-xl font-bold text-sm bg-accent text-accent-foreground hover:opacity-95 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isRequestingPayout ? (
                  <>
                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    <span>Processing UPI Transfer...</span>
                  </>
                ) : (
                  <span>Confirm Withdrawal</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
