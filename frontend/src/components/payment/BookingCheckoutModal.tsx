import React, { useState } from 'react';
import {
  CreditCardIcon,
  BanknotesIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  XMarkIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import {
  useGetWalletBalanceQuery,
  useCheckoutWithWalletMutation,
  useCreateTopUpOrderMutation,
  useVerifyTopUpMutation,
} from '../../store/paymentApi';
import { loadRazorpayScript } from '../../utils/razorpay';
import { formatINR } from '../../utils/currency';

interface BookingCheckoutModalProps {
  orderId: string;
  totalAmount: number;
  providerName?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const BookingCheckoutModal: React.FC<BookingCheckoutModalProps> = ({
  orderId,
  totalAmount,
  providerName = 'Companion',
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { data: walletData, isLoading: walletLoading, refetch: refetchWallet } = useGetWalletBalanceQuery();
  const [checkoutWithWallet, { isLoading: isPayingWallet }] = useCheckoutWithWalletMutation();
  const [createTopUpOrder, { isLoading: isCreatingTopUp }] = useCreateTopUpOrderMutation();
  const [verifyTopUp, { isLoading: isVerifyingTopUp }] = useVerifyTopUpMutation();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const availableBalance = walletData?.availableBalance ?? 0;
  const platformFee = Math.round(totalAmount * 0.15 * 100) / 100;
  const companionEarnings = Math.round((totalAmount - platformFee) * 100) / 100;
  const hasSufficientBalance = availableBalance >= totalAmount;
  const shortage = Math.max(0, totalAmount - availableBalance);

  const handleWalletPayment = async () => {
    setErrorMessage(null);
    try {
      await checkoutWithWallet({ orderId }).unwrap();
      setIsSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err?.data?.error || 'Failed to complete wallet payment. Please try again.');
    }
  };

  const handleTopUpAndPay = async () => {
    setErrorMessage(null);
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      setErrorMessage('Razorpay SDK failed to load. Please check your internet connection.');
      return;
    }

    try {
      // Top up exactly the shortage amount or round up to nearest ₹100
      const topUpAmount = Math.ceil(shortage / 100) * 100 || shortage;
      const order = await createTopUpOrder({ amount: topUpAmount, currency: 'INR' }).unwrap();

      const options = {
        key: order.keyId,
        amount: order.amount * 100,
        currency: order.currency,
        name: 'Cue Companion Platform',
        description: `Wallet Top-Up for Booking #${orderId.slice(0, 8)}`,
        order_id: order.orderId,
        prefill: {
          name: 'Seeker',
        },
        theme: {
          color: '#E11D48',
        },
        handler: async (response: any) => {
          try {
            await verifyTopUp({
              razorpayOrderId: response.razorpay_order_id || order.orderId,
              razorpayPaymentId: response.razorpay_payment_id || 'pay_mock_' + Date.now(),
              razorpaySignature: response.razorpay_signature || 'sig_mock',
              amount: topUpAmount,
            }).unwrap();

            await refetchWallet();

            // Automatically proceed to wallet escrow checkout
            await checkoutWithWallet({ orderId }).unwrap();
            setIsSuccess(true);
            setTimeout(() => {
              onSuccess();
              onClose();
            }, 1500);
          } catch (verifyErr: any) {
            setErrorMessage(verifyErr?.data?.error || 'Payment verification failed.');
          }
        },
        modal: {
          ondismiss: () => {
            // User closed Razorpay modal
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    } catch (err: any) {
      setErrorMessage(err?.data?.error || 'Failed to initiate payment. Please try again.');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div className="relative w-full max-w-lg bg-card text-card-foreground rounded-3xl border border-border/80 shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border/60">
          <div>
            <h3 id="checkout-modal-title" className="text-xl font-bold font-serif text-foreground">Secure Escrow Checkout</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Booking with {providerName}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close checkout modal"
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircleIcon className="w-16 h-16 text-emerald-500 mx-auto animate-in zoom-in-75 duration-300 ease-out" />
            <h4 className="text-lg font-bold text-foreground">Payment Held in Escrow!</h4>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {formatINR(totalAmount)} is safely secured. Funds will only be released to {providerName} once your companionship session is completed.
            </p>
          </div>
        ) : (
          <>
            {/* Price Breakdown */}
            <div className="p-4 rounded-2xl bg-muted/40 border border-border/50 space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Companionship Session Total:</span>
                <span className="font-semibold text-foreground">{formatINR(totalAmount)}</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>15% Platform Commission:</span>
                <span>{formatINR(platformFee)}</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Net Companion Earnings:</span>
                <span>{formatINR(companionEarnings)}</span>
              </div>
              <div className="pt-2 border-t border-border/40 flex justify-between font-bold text-foreground text-base">
                <span>Total Payable:</span>
                <span className="text-accent font-mono">{formatINR(totalAmount)}</span>
              </div>
            </div>

            {/* Wallet Balance Card */}
            <div className="p-4 rounded-2xl bg-accent/5 border border-accent/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-accent/15 text-accent">
                  <BanknotesIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Cue Wallet Available
                  </p>
                  <p className="text-xl font-bold font-mono text-foreground">
                    {walletLoading ? '...' : formatINR(availableBalance)}
                  </p>
                </div>
              </div>
              {hasSufficientBalance ? (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 border border-emerald-500/30">
                  Ready to Pay
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-600 border border-amber-500/30">
                  Short by {formatINR(shortage)}
                </span>
              )}
            </div>

            {/* Escrow Guarantee Banner */}
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-xs text-sky-800 dark:text-sky-300">
              <ShieldCheckIcon className="w-5 h-5 flex-shrink-0 text-sky-600 dark:text-sky-400 mt-0.5" />
              <div>
                <p className="font-bold">100% Buyer Protection Escrow</p>
                <p className="mt-0.5 opacity-90 leading-relaxed">
                  Your funds are kept in a protected escrow vault. The companion does not receive payment until the appointment has concluded safely.
                </p>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-xs border border-destructive/20">
                <ExclamationCircleIcon className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Actions */}
            <div className="pt-2 space-y-3">
              {hasSufficientBalance ? (
                <button
                  type="button"
                  onClick={handleWalletPayment}
                  disabled={isPayingWallet}
                  className="w-full py-3.5 px-4 rounded-2xl font-bold text-sm bg-accent text-accent-foreground hover:opacity-95 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isPayingWallet ? (
                    <>
                      <ArrowPathIcon className="w-4 h-4 animate-spin" />
                      <span>Locking Funds in Escrow...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheckIcon className="w-5 h-5" />
                      <span>Pay {formatINR(totalAmount)} with Wallet</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleTopUpAndPay}
                  disabled={isCreatingTopUp || isVerifyingTopUp || isPayingWallet}
                  className="w-full py-3.5 px-4 rounded-2xl font-bold text-sm bg-accent text-accent-foreground hover:opacity-95 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isCreatingTopUp || isVerifyingTopUp || isPayingWallet ? (
                    <>
                      <ArrowPathIcon className="w-4 h-4 animate-spin" />
                      <span>Processing UPI Payment...</span>
                    </>
                  ) : (
                    <>
                      <CreditCardIcon className="w-5 h-5" />
                      <span>Top-Up {formatINR(shortage)} & Pay via UPI</span>
                    </>
                  )}
                </button>
              )}

              <p className="text-[11px] text-center text-muted-foreground flex items-center justify-center gap-1">
                <span>Secured via Razorpay UPI, GPay, PhonePe, Paytm, and Netbanking</span>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

