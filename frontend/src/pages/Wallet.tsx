import React, { useState } from 'react';
import {
  Button,
  Input,
  TabList,
  Tab,
  ToggleButton,
  Badge,
  MessageBar,
  MessageBarBody,
  Spinner,
  Table,
  TableHeader,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
} from '@fluentui/react-components';
import {
  Wallet24Regular,
  Wallet20Regular,
  ShieldCheckmark24Regular,
  ShieldCheckmark16Regular,
  ArrowDownLeft16Regular,
  ArrowUpRight16Regular,
  Receipt24Regular,
} from '@fluentui/react-icons';
import {
  useGetWalletBalanceQuery,
  useGetWalletTransactionsQuery,
  useCreateTopUpOrderMutation,
  useVerifyTopUpMutation,
} from '../store/paymentApi';
import { loadRazorpayScript } from '../utils/razorpay';
import { cueBrand } from '../theme/fluentTheme';
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
            name: 'Cue Escrow Platform',
            description: 'Wallet Balance Top-Up',
            order_id: order.orderId,
            prefill: {
              name: 'Host',
            },
            theme: {
              color: cueBrand[80],
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
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-title2 font-semibold text-foreground">Cue wallet</h1>
          <p className="text-body1 text-muted-foreground mt-1">
            Pre-funded instant checkout with complete 100% escrow protection
          </p>
        </div>
        <Badge
          appearance="tint"
          color="success"
          icon={<ShieldCheckmark16Regular />}
          className="self-start sm:self-auto"
        >
          India UPI & Razorpay secured
        </Badge>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Available Balance */}
        <div className="p-6 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-caption1 font-semibold text-muted-foreground">Available balance</span>
            <div className="p-2 rounded-lg bg-accent-light text-brand-fg">
              <Wallet24Regular />
            </div>
          </div>
          <div className="my-4">
            <p className="text-title1 font-semibold font-mono tabular text-foreground">
              {isBalanceLoading ? '...' : `₹${availableBalance.toLocaleString('en-IN')}`}
            </p>
            <p className="text-caption1 text-muted-foreground mt-1">Instant 1-click booking checkout</p>
          </div>
          <div className="text-caption1 text-success font-semibold flex items-center gap-1">
            <span>● Ready to use</span>
          </div>
        </div>

        {/* Escrow / Pending Balance */}
        <div className="p-6 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-caption1 font-semibold text-muted-foreground">Protected for meetups</span>
            <div className="p-2 rounded-lg bg-trust-light text-trust">
              <ShieldCheckmark24Regular />
            </div>
          </div>
          <div className="my-4">
            <p className="text-title1 font-semibold font-mono tabular text-foreground">
              {isBalanceLoading ? '...' : `₹${pendingBalance.toLocaleString('en-IN')}`}
            </p>
            <p className="text-caption1 text-muted-foreground mt-1">Held safely until meetups are complete</p>
          </div>
          <div className="text-caption1 text-trust font-semibold flex items-center gap-1">
            <span>● Safe escrow guarantee</span>
          </div>
        </div>

        {/* Platform Take Rate Notice */}
        <div className="p-6 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-caption1 font-semibold text-muted-foreground">Fair marketplace</span>
            <div className="p-2 rounded-lg bg-muted text-foreground">
              <Receipt24Regular />
            </div>
          </div>
          <div className="my-4">
            <p className="text-title1 font-semibold font-mono tabular text-foreground">15%</p>
            <p className="text-caption1 text-muted-foreground mt-1">Transparent platform service fee</p>
          </div>
          <p className="text-caption1 text-muted-foreground tabular">
            85% goes directly to the guest upon outing completion.
          </p>
        </div>
      </div>

      {/* Guest Earnings & UPI Withdrawal Destination */}
      <ProviderEarningsCard />

      {/* Top-Up Section */}
      <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-6">
        <div>
          <h2 className="text-subtitle1 font-semibold text-foreground">Add money to wallet</h2>
          <p className="text-caption1 text-muted-foreground mt-0.5">
            Add funds using Google Pay, PhonePe, Paytm, UPI QR, Netbanking, or Debit/Credit Cards.
          </p>
        </div>

        {statusMessage && (
          <MessageBar intent={statusMessage.type === 'success' ? 'success' : 'error'}>
            <MessageBarBody>{statusMessage.text}</MessageBarBody>
          </MessageBar>
        )}

        {/* Amount Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {PRESET_AMOUNTS.map((amt) => {
            const isSelected = selectedAmount === amt && !customAmount;
            return (
              <ToggleButton
                key={amt}
                size="large"
                checked={isSelected}
                appearance={isSelected ? 'primary' : 'outline'}
                onClick={() => {
                  setSelectedAmount(amt);
                  setCustomAmount('');
                }}
                className="min-h-11 font-mono tabular"
              >
                ₹{amt.toLocaleString('en-IN')}
              </ToggleButton>
            );
          })}
        </div>

        {/* Custom Amount Input & Button */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            type="number"
            size="large"
            placeholder="Or enter custom amount (e.g. 1500)"
            value={customAmount}
            onChange={(_, data) => setCustomAmount(data.value)}
            contentBefore={<span className="font-mono font-semibold">₹</span>}
            min={10}
            className="flex-1 font-mono tabular"
          />
          <Button
            appearance="primary"
            size="large"
            onClick={handleTopUp}
            disabled={isCreatingOrder || isVerifying || currentAmount <= 0}
            icon={isCreatingOrder || isVerifying ? <Spinner size="tiny" /> : <Wallet20Regular />}
            className="min-h-11 tabular shrink-0"
          >
            {isCreatingOrder || isVerifying
              ? 'Opening UPI...'
              : `Add ₹${currentAmount ? currentAmount.toLocaleString('en-IN') : '0'} UPI`}
          </Button>
        </div>
      </div>

      {/* Transaction History */}
      <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-subtitle1 font-semibold text-foreground">Transaction history</h2>
            <p className="text-caption1 text-muted-foreground mt-0.5">Immutable double-entry ledger records</p>
          </div>

          <TabList
            selectedValue={activeFilter}
            onTabSelect={(_, data) =>
              setActiveFilter(data.value as 'All' | 'TopUp' | 'BookingPayment' | 'Payout')
            }
          >
            <Tab value="All">All activity</Tab>
            <Tab value="TopUp">Deposits</Tab>
            <Tab value="BookingPayment">Bookings</Tab>
            <Tab value="Payout">Withdrawals</Tab>
          </TabList>
        </div>

        {/* Ledger Table */}
        {isTxnsLoading ? (
          <div className="py-12 text-center text-caption1 text-muted-foreground flex flex-col items-center gap-2">
            <Spinner size="medium" />
            <span>Loading transaction ledger...</span>
          </div>
        ) : !filteredTransactions || filteredTransactions.length === 0 ? (
          <div className="py-12 text-center text-caption1 text-muted-foreground space-y-2">
            <Wallet24Regular className="mx-auto text-muted-foreground" />
            <p>No transactions found under this category.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table aria-label="Wallet transactions ledger">
              <TableHeader>
                <TableRow>
                  <TableHeaderCell>Description</TableHeaderCell>
                  <TableHeaderCell>Date & time</TableHeaderCell>
                  <TableHeaderCell className="text-right">Amount</TableHeaderCell>
                  <TableHeaderCell className="text-right">Balance after</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((txn) => {
                  const isCredit = txn.direction === 'Credit';
                  return (
                    <TableRow key={txn.id}>
                      <TableCell>
                        <div className="flex items-center gap-3 py-2">
                          <div
                            className={`p-2 rounded-lg shrink-0 ${
                              isCredit
                                ? 'bg-success-light text-success'
                                : 'bg-destructive-light text-destructive'
                            }`}
                          >
                            {isCredit ? (
                              <ArrowDownLeft16Regular />
                            ) : (
                              <ArrowUpRight16Regular />
                            )}
                          </div>
                          <span className="text-body1 font-semibold text-foreground">
                            {txn.description || txn.type}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-caption1 text-muted-foreground tabular">
                        {new Date(txn.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={`font-mono tabular font-semibold text-body1 ${
                            isCredit ? 'text-success' : 'text-foreground'
                          }`}
                        >
                          {isCredit ? '+' : '-'} ₹{txn.amount.toLocaleString('en-IN')}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-mono tabular text-caption1 text-muted-foreground">
                        ₹{txn.balanceAfter.toLocaleString('en-IN')}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {sandboxOrderData && (
        <RazorpaySandboxModal
          isOpen={Boolean(sandboxOrderData)}
          orderId={sandboxOrderData.orderId}
          amount={sandboxOrderData.amount}
          title="Cue wallet balance top-up"
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
