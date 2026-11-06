import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Badge,
  MessageBar,
  MessageBarBody,
  Spinner,
} from '@fluentui/react-components';
import {
  Payment20Regular,
  Wallet24Regular,
  ShieldCheckmark20Regular,
  CheckmarkCircle24Regular,
  Dismiss20Regular,
} from '@fluentui/react-icons';
import {
  useGetWalletBalanceQuery,
  useCheckoutWithWalletMutation,
  useCreateTopUpOrderMutation,
  useVerifyTopUpMutation,
} from '../../store/paymentApi';
import { bookingApi } from '../../store/bookingApi';
import { loadRazorpayScript } from '../../utils/razorpay';
import { formatINR } from '../../utils/currency';
import { cueBrand } from '../../theme/fluentTheme';
import { RazorpaySandboxModal, type RazorpaySandboxPaymentResult } from './RazorpaySandboxModal';

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
  providerName = 'Guest',
  isOpen,
  onClose,
  onSuccess,
}) => {
  const dispatch = useDispatch();
  const { data: walletData, isLoading: walletLoading, refetch: refetchWallet } = useGetWalletBalanceQuery();
  const [checkoutWithWallet, { isLoading: isPayingWallet }] = useCheckoutWithWalletMutation();
  const [createTopUpOrder, { isLoading: isCreatingTopUp }] = useCreateTopUpOrderMutation();
  const [verifyTopUp, { isLoading: isVerifyingTopUp }] = useVerifyTopUpMutation();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [sandboxOrderData, setSandboxOrderData] = useState<{
    orderId: string;
    amount: number;
  } | null>(null);

  if (!isOpen) return null;

  const availableBalance = walletData?.availableBalance ?? 0;
  const platformFee = Math.round(totalAmount * 0.15 * 100) / 100;
  const guestEarnings = Math.round((totalAmount - platformFee) * 100) / 100;
  const hasSufficientBalance = availableBalance >= totalAmount;
  const shortage = Math.max(0, totalAmount - availableBalance);

  const extractError = (err: any, fallback: string) => {
    if (err?.data?.error) return err.data.error;
    if (err?.data?.message) return err.data.message;
    if (err?.data?.title) return err.data.title;
    if (err?.data?.errors && typeof err.data.errors === 'object') {
      const firstKey = Object.keys(err.data.errors)[0];
      if (firstKey && Array.isArray(err.data.errors[firstKey])) {
        return err.data.errors[firstKey][0];
      }
    }
    if (typeof err?.data === 'string') return err.data;
    return fallback;
  };

  const handleWalletPayment = async () => {
    setErrorMessage(null);
    try {
      await checkoutWithWallet({ orderId }).unwrap();
      dispatch(bookingApi.util.invalidateTags(['Bookings']));
      setIsSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMessage(extractError(err, 'Failed to complete wallet payment. Please try again.'));
    }
  };

  const processVerificationAndEscrow = async (
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

      await refetchWallet();

      await checkoutWithWallet({ orderId }).unwrap();
      dispatch(bookingApi.util.invalidateTags(['Bookings']));
      setSandboxOrderData(null);
      setIsSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (verifyErr: any) {
      setErrorMessage(extractError(verifyErr, 'Payment verification failed.'));
      setSandboxOrderData(null);
    }
  };

  const handleTopUpAndPay = async () => {
    setErrorMessage(null);
    try {
      const topUpAmount = Math.ceil(shortage / 100) * 100 || shortage;
      const order = await createTopUpOrder({ amount: topUpAmount, currency: 'INR' }).unwrap();

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
            description: `Escrow Hold for Booking #${orderId.slice(0, 8)}`,
            order_id: order.orderId,
            prefill: {
              name: 'Host',
            },
            theme: {
              color: cueBrand[80],
            },
            handler: async (response: any) => {
              await processVerificationAndEscrow(
                response.razorpay_order_id || order.orderId,
                response.razorpay_payment_id || `pay_${Date.now()}`,
                response.razorpay_signature || 'sig_valid',
                topUpAmount
              );
            },
            modal: {
              ondismiss: () => {},
            },
          };

          const razorpayInstance = new window.Razorpay(options);
          razorpayInstance.open();
          return;
        }
      }

      setSandboxOrderData({
        orderId: order.orderId,
        amount: topUpAmount,
      });
    } catch (err: any) {
      setErrorMessage(err?.data?.error || 'Failed to initiate payment. Please try again.');
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(_, data) => !data.open && onClose()}>
        <DialogSurface className="max-w-lg w-full bg-card text-card-foreground rounded-2xl border border-border p-6">
          <DialogBody>
            <DialogTitle
              action={
                <Button
                  appearance="subtle"
                  aria-label="Close checkout modal"
                  icon={<Dismiss20Regular />}
                  onClick={onClose}
                />
              }
            >
              <div>
                <span id="checkout-modal-title" className="text-subtitle1 font-semibold text-foreground block">
                  Confirm & pay for meetup
                </span>
                <span className="text-caption1 font-normal text-muted-foreground block">
                  Booking with {providerName}
                </span>
              </div>
            </DialogTitle>

            <DialogContent className="space-y-5 pt-4">
              {isSuccess ? (
                <div className="py-8 text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-success-light text-success flex items-center justify-center mx-auto">
                    <CheckmarkCircle24Regular />
                  </div>
                  <h4 className="text-subtitle1 font-semibold text-foreground">Payment safely protected!</h4>
                  <p className="text-caption1 text-muted-foreground max-w-sm mx-auto tabular">
                    {formatINR(totalAmount)} is held safely. Payment will only be released to {providerName} after your outing is completed.
                  </p>
                </div>
              ) : (
                <>
                  {/* Price Breakdown */}
                  <div className="p-4 rounded-lg bg-muted border border-border space-y-2 text-body1">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Outing total:</span>
                      <span className="font-semibold text-foreground tabular">{formatINR(totalAmount)}</span>
                    </div>
                    <div className="flex justify-between text-caption1 text-muted-foreground">
                      <span>Platform service fee (15%):</span>
                      <span className="tabular">{formatINR(platformFee)}</span>
                    </div>
                    <div className="flex justify-between text-caption1 text-muted-foreground">
                      <span>Guest earnings (85%):</span>
                      <span className="tabular">{formatINR(guestEarnings)}</span>
                    </div>
                    <div className="pt-2 border-t border-border flex justify-between font-semibold text-foreground text-body2">
                      <span>Total payable:</span>
                      <span className="text-brand-fg font-mono tabular">{formatINR(totalAmount)}</span>
                    </div>
                  </div>

                  {/* Wallet Balance Card */}
                  <div className="p-4 rounded-lg bg-accent-light border border-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-lg bg-card border border-border text-brand-fg">
                        <Wallet24Regular />
                      </div>
                      <div>
                        <p className="text-caption1 font-semibold text-muted-foreground">
                          Cue wallet available
                        </p>
                        <p className="text-subtitle1 font-semibold font-mono tabular text-foreground">
                          {walletLoading ? '...' : formatINR(availableBalance)}
                        </p>
                      </div>
                    </div>
                    {hasSufficientBalance ? (
                      <Badge appearance="tint" color="success">
                        Ready to pay
                      </Badge>
                    ) : (
                      <Badge appearance="tint" color="warning" className="tabular">
                        Short by {formatINR(shortage)}
                      </Badge>
                    )}
                  </div>

                  {/* Escrow Guarantee Banner */}
                  <div className="flex items-start gap-3 p-3.5 rounded-lg bg-trust-light border border-trust-border text-caption1 text-trust">
                    <ShieldCheckmark20Regular className="shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Protected payment guarantee</p>
                      <p className="mt-0.5 text-muted-foreground">
                        Your payment is held safely in escrow. The guest receives payment only after your outing has ended successfully.
                      </p>
                    </div>
                  </div>

                  {errorMessage && (
                    <MessageBar intent="error">
                      <MessageBarBody>{errorMessage}</MessageBarBody>
                    </MessageBar>
                  )}

                  <p className="text-caption1 text-center text-muted-foreground">
                    Secured via Razorpay UPI, GPay, PhonePe, Paytm, and Netbanking
                  </p>
                </>
              )}
            </DialogContent>

            {!isSuccess && (
              <DialogActions className="pt-4">
                <Button
                  appearance="secondary"
                  size="large"
                  className="min-h-11"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                {hasSufficientBalance ? (
                  <Button
                    appearance="primary"
                    size="large"
                    className="min-h-11 tabular"
                    onClick={handleWalletPayment}
                    disabled={isPayingWallet}
                    icon={isPayingWallet ? <Spinner size="tiny" /> : <ShieldCheckmark20Regular />}
                  >
                    {isPayingWallet ? 'Funding escrow...' : `Fund escrow • ${formatINR(totalAmount)}`}
                  </Button>
                ) : (
                  <Button
                    appearance="primary"
                    size="large"
                    className="min-h-11 tabular"
                    onClick={handleTopUpAndPay}
                    disabled={isCreatingTopUp || isVerifyingTopUp || isPayingWallet}
                    icon={isCreatingTopUp || isVerifyingTopUp || isPayingWallet ? <Spinner size="tiny" /> : <Payment20Regular />}
                  >
                    {isCreatingTopUp || isVerifyingTopUp || isPayingWallet
                      ? 'Funding escrow...'
                      : `Add ${formatINR(shortage)} & fund`}
                  </Button>
                )}
              </DialogActions>
            )}
          </DialogBody>
        </DialogSurface>
      </Dialog>

      {sandboxOrderData && (
        <RazorpaySandboxModal
          isOpen={Boolean(sandboxOrderData)}
          orderId={sandboxOrderData.orderId}
          amount={sandboxOrderData.amount}
          title={`Safe payment • ${providerName}`}
          description={`Payment held safely for Meetup #${orderId.slice(0, 8)}`}
          onSuccess={(result: RazorpaySandboxPaymentResult) => {
            processVerificationAndEscrow(
              result.razorpayOrderId,
              result.razorpayPaymentId,
              result.razorpaySignature,
              result.amount
            );
          }}
          onError={(err: string) => {
            setErrorMessage(err);
            setSandboxOrderData(null);
          }}
          onClose={() => setSandboxOrderData(null)}
        />
      )}
    </>
  );
};
