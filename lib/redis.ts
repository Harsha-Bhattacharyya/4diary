/**
 * Redis client utility for ephemeral share token storage
 * Handles secure share tokens with TTL and permissions
 */

import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL;

let redis: Redis | null = null;

/**
 * Get the singleton Redis client, initializing it lazily if a Redis URL is configured.
 *
 * @returns The Redis client instance, or `null` if REDIS_URL is not configured
 */
export function getRedisClient(): Redis | null {
  if (!redisUrl) {
    console.warn("Redis URL not configured - share tokens will be unavailable");
    return null;
  }

  if (!redis) {
    redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    redis.on("error", (err) => {
      console.error("Redis client error:", err);
    });
  }

  return redis;
}

/**
 * Share token payload
 */
export interface ShareTokenPayload {
  documentId: string;
  encryptedDocumentKey: string; // Encrypted document key for E2EE
  permissions: {
    canEdit: boolean;
    canView: boolean;
  };
  createdBy: string;
  createdAt: string;
}

/**
 * Store a share token payload in Redis with an expiration time.
 *
 * @param token - The share token key (stored as `share:{token}` in Redis)
 * @param payload - The share token payload to persist
 * @param ttlSeconds - Time to live in seconds; defaults to 86400 (24 hours)
 * @returns `true` if the token was stored successfully, `false` otherwise
 */
export async function setShareToken(
  token: string,
  payload: ShareTokenPayload,
  ttlSeconds: number = 86400 // 24 hours default
): Promise<boolean> {
  const client = getRedisClient();
  if (!client) {
    return false;
  }

  try {
    const key = `share:${token}`;
    await client.setex(key, ttlSeconds, JSON.stringify(payload));
    return true;
  } catch (error) {
    console.error("Failed to set share token:", error);
    return false;
  }
}

/**
 * Retrieve a share token payload from Redis using the token identifier.
 *
 * @param token - The share token identifier (used to form the Redis key `share:{token}`)
 * @returns The parsed `ShareTokenPayload` if the key exists; `null` if the key is missing, Redis is unavailable, or an error occurs
 */
export async function getShareToken(
  token: string
): Promise<ShareTokenPayload | null> {
  const client = getRedisClient();
  if (!client) {
    return null;
  }

  try {
    const key = `share:${token}`;
    const data = await client.get(key);
    if (!data) {
      return null;
    }
    return JSON.parse(data) as ShareTokenPayload;
  } catch (error) {
    console.error("Failed to get share token:", error);
    return null;
  }
}

/**
 * Delete the share token entry stored in Redis.
 *
 * @param token - The share token identifier to remove (used as `share:{token}` key)
 * @returns `true` if a Redis key was deleted, `false` if no key was deleted, Redis is unavailable, or an error occurred
 */
export async function revokeShareToken(token: string): Promise<boolean> {
  const client = getRedisClient();
  if (!client) {
    return false;
  }

  try {
    const key = `share:${token}`;
    const result = await client.del(key);
    return result > 0;
  } catch (error) {
    console.error("Failed to revoke share token:", error);
    return false;
  }
}

/**
 * Set a new time-to-live for a share token stored in Redis.
 *
 * @param token - The share token identifier
 * @param ttlSeconds - The TTL to apply, in seconds
 * @returns `true` if the token's expiry was set (Redis returned 1), `false` otherwise
 */
export async function extendShareTokenTTL(
  token: string,
  ttlSeconds: number
): Promise<boolean> {
  const client = getRedisClient();
  if (!client) {
    return false;
  }

  try {
    const key = `share:${token}`;
    const result = await client.expire(key, ttlSeconds);
    return result === 1;
  } catch (error) {
    console.error("Failed to extend share token TTL:", error);
    return false;
  }
}

/**
 * Update the permissions stored on an existing share token while preserving its remaining TTL.
 *
 * Attempts to load the share payload for `token`, replace its `permissions`, and write it back with the original TTL.
 *
 * @param token - The share token identifier whose permissions should be updated
 * @param permissions - New permissions to set on the share payload
 * @returns `true` if the permissions were updated and the key's TTL was preserved; `false` if Redis is unavailable, the token does not exist, the key had no positive TTL, or an error occurred
 */
export async function updateShareTokenPermissions(
  token: string,
  permissions: ShareTokenPayload["permissions"]
): Promise<boolean> {
  const client = getRedisClient();
  if (!client) {
    return false;
  }

  try {
    const key = `share:${token}`;
    const data = await client.get(key);
    if (!data) {
      return false;
    }

    const payload = JSON.parse(data) as ShareTokenPayload;
    payload.permissions = permissions;

    const ttl = await client.ttl(key);
    if (ttl > 0) {
      await client.setex(key, ttl, JSON.stringify(payload));
      return true;
    }
    return false;
  } catch (error) {
    console.error("Failed to update share token permissions:", error);
    return false;
  }
}

/**
 * Closes the active Redis client connection and clears the cached client.
 *
 * Does nothing if no client is initialized.
 */
export async function closeRedis(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = null;
  }
}