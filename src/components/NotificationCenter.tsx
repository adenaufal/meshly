import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

type NotificationKind = 'info' | 'success' | 'error';

interface Notification {
  id: number;
  kind: NotificationKind;
  message: string;
}

interface NotifyOptions {
  message: string;
  kind?: NotificationKind;
  timeoutMs?: number;
}

interface NotificationContextValue {
  notify: (options: NotifyOptions) => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export const useNotifications = (): NotificationContextValue => {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }

  return context;
};

const KIND_STYLES: Record<NotificationKind, string> = {
  info: 'bg-blue-600 text-white',
  success: 'bg-emerald-600 text-white',
  error: 'bg-red-600 text-white',
};

export const NotificationProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [items, setItems] = useState<Notification[]>([]);
  const timers = useRef<Record<number, number>>({});

  useEffect(
    () => () => {
      Object.values(timers.current).forEach((timerId) => window.clearTimeout(timerId));
      timers.current = {};
    },
    [],
  );

  const remove = useCallback((id: number) => {
    setItems((current) => current.filter((item) => item.id !== id));

    if (timers.current[id]) {
      window.clearTimeout(timers.current[id]);
      delete timers.current[id];
    }
  }, []);

  const notify = useCallback(
    ({ message, kind = 'info', timeoutMs = 4000 }: NotifyOptions) => {
      const id = Date.now() + Math.random();
      const notification: Notification = { id, kind, message };

      setItems((current) => [...current, notification]);

      if (timeoutMs > 0) {
        timers.current[id] = window.setTimeout(() => remove(id), timeoutMs);
      }
    },
    [remove],
  );

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed top-4 right-4 z-[9999] flex w-full max-w-sm flex-col space-y-2"
        role="region"
        aria-live="assertive"
      >
        {items.map((item) => (
          <div
            key={item.id}
            className={`pointer-events-auto flex items-start justify-between rounded-lg px-4 py-3 shadow-lg shadow-black/10 ${KIND_STYLES[item.kind]}`}
            role="alert"
          >
            <span className="pr-4 text-sm font-medium">{item.message}</span>
            <button
              type="button"
              onClick={() => remove(item.id)}
              className="text-sm font-semibold underline underline-offset-2 transition-opacity hover:opacity-75"
            >
              Dismiss
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};
