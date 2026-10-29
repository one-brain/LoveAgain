import React, { useState } from 'react';
import {
  BanknotesIcon,
  ShieldCheckIcon,
  ArrowDownLeftIcon,
  ArrowUpRightIcon,
  SparklesIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import {
  useGetWalletBalanceQuery,
  useGetWalletTransactionsQuery,
  useCreateTopUpOrderMutation,
  useVerifyTopUpMutation,
} from '../store/paymentApi';
import { loadRazorpayScript } from '../utils/razorpay';
import { RazorpaySandboxModal, type RazorpaySandboxPaymentResult } from '../components/payment/RazorpaySandboxModal';
import { ProviderEarningsCard } from '../components/payment/ProviderEarningsCard';

const PRESET_AMOUNTS = [500, 1000, 2000, 5000];

export const WalletPage: React.FC = () => {
  const { data: balanceData, isLoading: isBalanceLoading, refetch: refetchBalance } = useGetWalletBalanceQuery();
  const { data: transactions, isLoading: isTxnsLoading, refetch: refetchTxns } = useGetWalletTransactionsQuery(50);
  const [createTopUpOrder, { isLoading: isCreatingOrder }] = useCreateTopUpOrderMutation();
  const [verifyTopUp, { isLoading: isVerifying }] = useVerifyTopUpMutation();

  const [selectedAmount, setSelectedAmount] = useState<number>(1000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<'All' | 'TopUp' | 'BookingPayment' | 'Payout'>('All');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [sandboxOrderData, setSandboxOrderData] = useState<{
    orderId: string;
    amount: number;
  } | null>(null);

  const availableBalance = balanceData?.availableBalance ?? 0;
  const pendingBalance = balanceData?.pendingBalance ?? 0;

  const currentAmount = customAmount ? parseFloat(customAmount) || 0 : selectedAmount;

  const processTopUpVerification = async (
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string,
    amount: number
  ) => {
    try {
      await verifyTopUp({
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        amount,
      }).unwrap();

      setStatusMessage({
        type: 'success',
        text: `₹${amount.toLocaleString('en-IN')} added to your wallet successfully!`,
      });
      setCustomAmount('');
      setSandboxOrderData(null);
      await Promise.all([refetchBalance(), refetchTxns()]);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.data?.error || 'Verification failed.' });
      setSandboxOrderData(null);
    }
  };

  const handleTopUp = async () => {
    setStatusMessage(null);
    if (currentAmount < 10) {
      setStatusMessage({ type: 'error', text: 'Minimum top-up amount is ₹10.' });
      return;
    }

    try {
      const order = await createTopUpOrder({ amount: currentAmount, currency: 'INR' }).unwrap();

      const isPlaceholder =
        !order.keyId ||
        order.keyId === 'rzp_test_placeholder' ||
        order.orderId.startsWith('order_sandbox_') ||
        order.orderId.startsWith('order_mock_');

      if (!isPlaceholder) {
        const scriptLoaded = await loadRazorpayScript();
        if (scriptLoaded && window.Razorpay) {
          const options = {
            key: order.keyId,
            amount: order.amount * 100,
            currency: order.currency,
            name: 'Cue Companion Platform',
            description: 'Wallet Balance Top-Up',
            order_id: order.orderId,
            prefill: {
              name: 'Seeker',
            },
            theme: {
              color: '#E11D48',
            },
            handler: async (response: any) => {
              await processTopUpVerification(
                response.razorpay_order_id || order.orderId,
                response.razorpay_payment_id || `pay_${Date.now()}`,
                response.razorpay_signature || 'sig_valid',
                currentAmount
              );
            },
          };

          const rzp = new window.Razorpay(options);
          rzp.open();
          return;
        }
      }

      // Default or Sandbox Simulator mode
      setSandboxOrderData({
        orderId: order.orderId,
        amount: currentAmount,
      });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.data?.error || 'Failed to initialize payment.' });
    }
  };

  const filteredTransactions = transactions?.filter((t) => {
    if (activeFilter === 'All') return true;
    return t.type === activeFilter;
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8 animate-in fade-in duration-200">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-serif text-foreground">Cue Wallet</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Pre-funded instant checkout with complete 100% Escrow Protection
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-semibold self-start sm:self-auto">
          <ShieldCheckIcon className="w-4 h-4" />
          <span>India UPI & Razorpay Secured</span>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Available Balance */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-card via-card to-accent/5 border border-border/80 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Available Balance</span>
            <div className="p-2 rounded-xl bg-accent/15 text-accent">
              <BanknotesIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="my-4">
            <p className="text-3xl sm:text-4xl font-extrabold font-mono text-foreground">
              {isBalanceLoading ? '...' : `₹${availableBalance.toLocaleString('en-IN')}`}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Instant 1-click booking checkout</p>
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <span>● Ready to use</span>
          </div>
        </div>

        {/* Escrow / Pending Balance */}
        <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Protected for Meetups</span>
            <div className="p-2 rounded-xl bg-sky-500/15 text-sky-600">
              <ShieldCheckIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="my-4">
            <p className="text-3xl sm:text-4xl font-extrabold font-mono text-foreground">
              {isBalanceLoading ? '...' : `₹${pendingBalance.toLocaleString('en-IN')}`}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Held safely until meetups are complete</p>
          </div>
          <div className="text-[11px] text-sky-600 font-semibold flex items-center gap-1">
            <span>● Safe Escrow Guarantee</span>
          </div>
        </div>

        {/* Platform Take Rate Notice */}
        <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Fair Marketplace</span>
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-600">
              <SparklesIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="my-4">
            <p className="text-3xl sm:text-4xl font-extrabold font-mono text-foreground">15%</p>
            <p className="text-xs text-muted-foreground mt-1">Transparent platform service fee</p>
          </div>
          <p className="text-[11px] text-muted-foreground">
            85% goes directly to the companion upon meetup completion.
          </p>
        </div>
      </div>

      {/* Companion Earnings & UPI Withdrawal Destination */}
      <ProviderEarningsCard />

      {/* Top-Up Section */}
      <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border/80 shadow-md space-y-6">
        <div>
          <h2 className="text-lg font-bold text-foreground">Add Money to Wallet</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Add funds using Google Pay, PhonePe, Paytm, UPI QR, Netbanking, or Debit/Credit Cards.
          </p>
        </div>

        {statusMessage && (
          <div
            className={`flex items-center gap-2 p-3.5 rounded-2xl text-xs border ${
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

        {/* Amount Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {PRESET_AMOUNTS.map((amt) => {
            const isSelected = selectedAmount === amt && !customAmount;
            return (
              <button
                key={amt}
                type="button"
                onClick={() => {
                  setSelectedAmount(amt);
                  setCustomAmount('');
                }}
                className={`py-3 px-4 rounded-2xl font-bold font-mono text-base border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-accent bg-accent/15 text-accent shadow-xs ring-2 ring-accent/30'
                    : 'border-border bg-muted/40 hover:bg-muted text-foreground'
                }`}
              >
                ₹{amt.toLocaleString('en-IN')}
              </button>
            );
          })}
        </div>

        {/* Custom Amount Input & Button */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-mono font-bold">₹</span>
            <input
              type="number"
              placeholder="Or enter custom amount (e.g. 1500)"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              className="w-full pl-9 pr-4 py-3 rounded-2xl bg-muted/30 border border-border text-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              min="10"
            />
          </div>
          <button
            type="button"
            onClick={handleTopUp}
            disabled={isCreatingOrder || isVerifying || currentAmount <= 0}
            className="py-3 px-6 rounded-2xl font-bold text-sm bg-accent text-accent-foreground hover:opacity-95 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer flex-shrink-0"
          >
            {isCreatingOrder || isVerifying ? (
              <>
                <ArrowPathIcon className="w-4 h-4 animate-spin" />
                <span>Launching UPI Gateway...</span>
              </>
            ) : (
              <>
                <BanknotesIcon className="w-5 h-5" />
                <span>Add ₹{currentAmount ? currentAmount.toLocaleString('en-IN') : '0'} via UPI</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Transaction History */}
      <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border/80 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-foreground">Transaction History</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Immutable double-entry ledger records</p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-1.5 p-1 rounded-2xl bg-muted/50 border border-border/60">
            {(['All', 'TopUp', 'BookingPayment', 'Payout'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeFilter === filter
                    ? 'bg-card text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {filter === 'All'
                  ? 'All Activity'
                  : filter === 'TopUp'
                  ? 'Deposits'
                  : filter === 'BookingPayment'
                  ? 'Bookings'
                  : 'Withdrawals'}
              </button>
            ))}
          </div>
        </div>

        {/* Ledger List */}
        {isTxnsLoading ? (
          <div className="py-12 text-center text-xs text-muted-foreground">Loading transaction ledger...</div>
        ) : !filteredTransactions || filteredTransactions.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted-foreground space-y-2">
            <BanknotesIcon className="w-10 h-10 text-muted-foreground/50 mx-auto" />
            <p>No transactions found under this category.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {filteredTransactions.map((txn) => {
              const isCredit = txn.direction === 'Credit';
              return (
                <div key={txn.id} className="py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2.5 rounded-2xl ${
                        isCredit
                          ? 'bg-emerald-500/15 text-emerald-600'
                          : 'bg-rose-500/15 text-rose-600'
                      }`}
                    >
                      {isCredit ? (
                        <ArrowDownLeftIcon className="w-4 h-4" />
                      ) : (
                        <ArrowUpRightIcon className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{txn.description || txn.type}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {new Date(txn.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p
                      className={`font-mono font-bold text-sm sm:text-base ${
                        isCredit ? 'text-emerald-600' : 'text-foreground'
                      }`}
                    >
                      {isCredit ? '+' : '-'} ₹{txn.amount.toLocaleString('en-IN')}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-mono">
                      Bal: ₹{txn.balanceAfter.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {sandboxOrderData && (
        <RazorpaySandboxModal
          isOpen={Boolean(sandboxOrderData)}
          orderId={sandboxOrderData.orderId}
          amount={sandboxOrderData.amount}
          title="Cue Wallet Balance Top-Up"
          description="Add INR funds to your platform balance"
          onSuccess={(result: RazorpaySandboxPaymentResult) => {
            processTopUpVerification(
              result.razorpayOrderId,
              result.razorpayPaymentId,
              result.razorpaySignature,
              result.amount
            );
          }}
          onError={(err: string) => {
            setStatusMessage({ type: 'error', text: err });
            setSandboxOrderData(null);
          }}
          onClose={() => setSandboxOrderData(null)}
        />
      )}
    </div>
  );
};

export default WalletPage;

