import { supabase } from '../supabase/client'

// Request throttling and circuit breaker state
interface RequestState {
  lastRequestTime: number;
  consecutiveFailures: number;
  isCircuitOpen: boolean;
  circuitOpenTime: number;
  pendingRequests: Set<string>;
}

const requestStates = new Map<string, RequestState>();
const CIRCUIT_BREAKER_THRESHOLD = 3; // Number of failures before opening circuit
const CIRCUIT_BREAKER_TIMEOUT = 60000; // 60 seconds circuit breaker timeout
const REQUEST_THROTTLE_MS = 1000; // 1 second request throttling
const REQUEST_DEDUPLICATION_MS = 5000; // 5 seconds for request deduplication

// Enhanced timeout wrapper with circuit breaker and intelligent retry
export const withTimeoutAndRetry = async <T>(
  fn: () => Promise<T>, 
  timeoutMs: number = 30000, // Increased default to 30 seconds
  retries: number = 2, // Reduced default to 2 retries
  requestKey?: string
): Promise<T> => {
  const key = requestKey || 'default';
  let state = requestStates.get(key) || {
    lastRequestTime: 0,
    consecutiveFailures: 0,
    isCircuitOpen: false,
    circuitOpenTime: 0,
    pendingRequests: new Set<string>()
  };

  // Check circuit breaker
  if (state.isCircuitOpen) {
    const now = Date.now();
    if (now - state.circuitOpenTime < CIRCUIT_BREAKER_TIMEOUT) {
      throw new Error(`Circuit breaker is open for ${key}. Please wait and try again later.`);
    } else {
      // Circuit breaker timeout expired, reset state
      state.isCircuitOpen = false;
      state.consecutiveFailures = 0;
    }
  }

  // Request deduplication - check if same request is already pending
  const requestId = `${key}-${Date.now()}`;
  const now = Date.now();
  
  // Check if there's a recent similar request
  for (const pendingId of state.pendingRequests) {
    const pendingTime = parseInt(pendingId.split('-').pop() || '0');
    if (now - pendingTime < REQUEST_DEDUPLICATION_MS) {
      // Wait for the pending request to complete
      await new Promise(resolve => setTimeout(resolve, REQUEST_DEDUPLICATION_MS - (now - pendingTime)));
    }
  }

  // Add this request to pending
  state.pendingRequests.add(requestId);

  // Request throttling
  const timeSinceLastRequest = now - state.lastRequestTime;
  if (timeSinceLastRequest < REQUEST_THROTTLE_MS) {
    await new Promise(resolve => setTimeout(resolve, REQUEST_THROTTLE_MS - timeSinceLastRequest));
  }
  state.lastRequestTime = Date.now();
  requestStates.set(key, state);

  let lastError: any;
  
  for (let i = 0; i < retries; i++) {
    try {
      // Create timeout promise with AbortController for better cleanup
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, timeoutMs);

      const timeoutPromise = new Promise<never>((_, reject) => {
        controller.signal.addEventListener('abort', () => {
          reject(new Error(`Request timeout after ${timeoutMs}ms - network may be slow or unstable`));
        });
      });
      
      try {
        const result = await Promise.race([fn(), timeoutPromise]);
        clearTimeout(timeoutId);
        
        // Success - reset circuit breaker state
        state.consecutiveFailures = 0;
        state.isCircuitOpen = false;
        state.pendingRequests.delete(requestId);
        requestStates.set(key, state);
        
        return result;
      } catch (raceError) {
        clearTimeout(timeoutId);
        throw raceError;
      }
    } catch (error) {
      lastError = error;
      
      // Check if this is an authentication error that might be resolved by refreshing the session
      if ((error as Error)?.message?.includes('JWT expired') || 
          (error as any)?.code === 'PGRST301' || 
          (error as any)?.status === 401) {
        try {
          // Try to refresh the session
          const { data: { session }, error: refreshError } = await supabase.auth.refreshSession();
          if (!refreshError && session) {
            // If session was refreshed, retry immediately without additional delay
            continue;
          }
        } catch (refreshError) {
          console.error('Error during session refresh attempt:', refreshError);
        }
      }
      
      // Update failure count
      state.consecutiveFailures++;
      
      // Open circuit breaker if too many failures
      if (state.consecutiveFailures >= CIRCUIT_BREAKER_THRESHOLD) {
        state.isCircuitOpen = true;
        state.circuitOpenTime = Date.now();
        console.warn(`Circuit breaker opened for ${key} due to ${state.consecutiveFailures} consecutive failures`);
      }
      
      requestStates.set(key, state);
      
      // Don't retry if circuit is now open or it's the last attempt
      if (state.isCircuitOpen || i >= retries - 1) {
        break;
      }
      
      // Exponential backoff with jitter for better distribution
      const baseDelay = 1000 * Math.pow(2, i); // Base delay of 1 second
      const jitter = Math.random() * 1000; // Jitter up to 1 second
      const delay = baseDelay + jitter;
      
      console.log(`Attempt ${i + 1} failed, retrying in ${Math.round(delay)}ms:`, (error as Error).message);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // Clean up pending request
  state.pendingRequests.delete(requestId);
  requestStates.set(key, state);
  
  // Provide more context in the error message
  if (lastError && lastError.message) {
    lastError.message = `${lastError.message} (Failed after ${retries} attempts)`;
  }
  throw lastError;
};

// Helper function to reset circuit breaker for a specific key (useful for manual recovery)
export const resetCircuitBreaker = (key: string = 'default'): void => {
  const state = requestStates.get(key);
  if (state) {
    state.isCircuitOpen = false;
    state.consecutiveFailures = 0;
    state.circuitOpenTime = 0;
    state.pendingRequests.clear();
    requestStates.set(key, state);
    console.log(`Circuit breaker reset for ${key}`);
  }
};

// Helper function to reset all circuit breakers
export const resetAllCircuitBreakers = (): void => {
  for (const [key, state] of requestStates.entries()) {
    state.isCircuitOpen = false;
    state.consecutiveFailures = 0;
    state.circuitOpenTime = 0;
    state.pendingRequests.clear();
    requestStates.set(key, state);
  }
  console.log('All circuit breakers reset');
};

// Helper function to get circuit breaker status
export const getCircuitBreakerStatus = (key: string = 'default'): { isOpen: boolean, failures: number, timeRemaining: number } => {
  const state = requestStates.get(key);
  if (!state) {
    return { isOpen: false, failures: 0, timeRemaining: 0 };
  }
  
  const timeRemaining = state.isCircuitOpen 
    ? Math.max(0, CIRCUIT_BREAKER_TIMEOUT - (Date.now() - state.circuitOpenTime))
    : 0;
    
  return {
    isOpen: state.isCircuitOpen,
    failures: state.consecutiveFailures,
    timeRemaining
  };
};