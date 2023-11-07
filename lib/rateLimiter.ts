import type { NextApiResponse } from 'next';
import { LRUCache } from 'lru-cache';

// Type for the options that can be passed to the rateLimit function
type Options = {
  uniqueTokenPerInterval?: number; // The maximum number of unique tokens that can make requests per interval
  interval?: number; // The time interval in milliseconds in which requests are limited
};

/**
 * Creates a rate limiting function using an LRU cache.
 * 
 * @param {Options} options - Optional settings for the rate limit function.
 * @returns An object with a `check` function that can be used to enforce rate limits.
 */
export default function rateLimit(options?: Options) {
  // Initialize the LRU cache with a maximum size and TTL based on provided options
  const tokenCache = new LRUCache<string, number>({
    max: options?.uniqueTokenPerInterval || 100, // Default to 100 unique tokens
    ttl: options?.interval || 1000 * 60 * 60, // Default to 1 hour
  });

  return {
    /**
     * Checks if a request with the given token should be rate limited.
     * 
     * @param {NextApiResponse} res - The response object from Next.js.
     * @param {number} limit - The maximum number of requests a token is allowed to make in the interval.
     * @param {string} token - The token to check the rate limit for.
     * @returns A promise that resolves if the request is not rate limited, or rejects if it is.
     */
    check: (res: NextApiResponse, limit: number, token: string) =>
      new Promise<void>((resolve, reject) => {
        const tokenCount = tokenCache.get(token) || 0;
        tokenCache.set(token, tokenCount + 1);

        const currentUsage = tokenCount + 1;
        const isRateLimited = currentUsage >= limit;
        
        // Set rate limit headers on the response
        res.setHeader('X-RateLimit-Limit', limit.toString());
        res.setHeader(
          'X-RateLimit-Remaining',
          isRateLimited ? '0' : (limit - currentUsage).toString()
        );

        if (isRateLimited) {
            // Calculate and return the rate limit error message
            const maxRequests = tokenCache.max;
            const minutesPerInterval = Math.round(tokenCache.ttl / (1000 * 60));
            const errorMessage = `Maximum ${maxRequests} requests per ${minutesPerInterval} minutes reached - please try again later.`;

            res.setHeader('Retry-After', Math.round(tokenCache.ttl / 1000).toString());
            res.status(429).json({ error: errorMessage });
            reject(new Error(errorMessage));
        } else {
            resolve();
        }
      }),
  }
}
