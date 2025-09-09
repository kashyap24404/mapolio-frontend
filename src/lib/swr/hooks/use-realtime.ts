import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';

// Hook for real-time subscriptions
export function useRealtimeSubscription(
  channel: string,
  event: string,
  callback: (payload: any) => void,
  options?: {
    enabled?: boolean;
    schema?: string;
    table?: string;
  }
) {
  const callbackRef = useRef(callback);
  const subscriptionRef = useRef<any>(null);
  
  // Update callback ref when callback changes
  callbackRef.current = callback;

  useEffect(() => {
    if (!supabase || options?.enabled === false) return;

    const schema = options?.schema || 'public';
    
    // Create subscription
    const subscription = supabase
      .channel(channel)
      .on(
        'postgres_changes' as any,
        {
          event,
          schema,
          ...(options?.table && { table: options.table })
        },
        (payload: any) => callbackRef.current(payload)
      )
      .subscribe();

    subscriptionRef.current = subscription;

    return () => {
      subscription.unsubscribe();
      subscriptionRef.current = null;
    };
  }, [channel, event, options?.enabled, options?.schema, options?.table]);

  // Return subscription control functions
  return {
    unsubscribe: () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    },
    isSubscribed: () => subscriptionRef.current !== null
  };
}

// Hook for task-specific real-time updates
export function useTaskUpdates(
  userId: string,
  onTaskUpdate: (payload: any) => void,
  enabled: boolean = true
) {
  return useRealtimeSubscription(
    `tasks:${userId}`,
    '*',
    onTaskUpdate,
    {
      enabled,
      schema: 'public',
      table: 'scraping_tasks'
    }
  );
}

// Hook for user stats real-time updates
export function useUserStatsUpdates(
  userId: string,
  onStatsUpdate: (payload: any) => void,
  enabled: boolean = true
) {
  return useRealtimeSubscription(
    `user_stats:${userId}`,
    '*',
    onStatsUpdate,
    {
      enabled,
      schema: 'public',
      table: 'profiles'
    }
  );
}

// Hook for transaction real-time updates
export function useTransactionUpdates(
  userId: string,
  onTransactionUpdate: (payload: any) => void,
  enabled: boolean = true
) {
  return useRealtimeSubscription(
    `transactions:${userId}`,
    'INSERT',
    onTransactionUpdate,
    {
      enabled,
      schema: 'public',
      table: 'transactions'
    }
  );
}

// Hook for generic table updates
export function useTableUpdates(
  tableName: string,
  onUpdate: (payload: any) => void,
  options?: {
    enabled?: boolean;
    event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
    schema?: string;
  }
) {
  return useRealtimeSubscription(
    `table:${tableName}`,
    options?.event || '*',
    onUpdate,
    {
      enabled: options?.enabled,
      schema: options?.schema || 'public',
      table: tableName
    }
  );
}