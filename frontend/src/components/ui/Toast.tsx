import React, { createContext, useContext, useCallback, type ReactNode } from 'react';
import {
  Button,
  Toast as FluentToast,
  ToastBody,
  Toaster,
  ToastTitle,
  ToastTrigger,
  useId,
  useToastController,
} from '@fluentui/react-components';
import { Dismiss16Regular } from '@fluentui/react-icons';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  durationMs?: number;
}

interface ToastContextValue {
  showToast: (type: ToastType, title: string, description?: string, durationMs?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const toasterId = useId('cue-toaster');
  const { dispatchToast, dismissToast } = useToastController(toasterId);

  const removeToast = useCallback(
    (id: string) => {
      dismissToast(id);
    },
    [dismissToast]
  );

  const showToast = useCallback(
    (type: ToastType, title: string, description?: string, durationMs = 4500) => {
      const id = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      dispatchToast(
        <FluentToast>
          <ToastTitle
            action={
              <ToastTrigger>
                <Button
                  appearance="subtle"
                  size="small"
                  icon={<Dismiss16Regular />}
                  aria-label="Dismiss notification"
                />
              </ToastTrigger>
            }
          >
            {title}
          </ToastTitle>
          {description && <ToastBody>{description}</ToastBody>}
        </FluentToast>,
        {
          toastId: id,
          intent: type,
          timeout: durationMs > 0 ? durationMs : -1,
        }
      );
    },
    [dispatchToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <Toaster toasterId={toasterId} position="bottom-end" pauseOnHover />
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      showToast: (type, title, desc) => console.log(`[Toast ${type}]`, title, desc),
      removeToast: () => {},
    };
  }
  return ctx;
};
