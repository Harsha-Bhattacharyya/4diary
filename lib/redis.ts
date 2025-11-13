/**
 * Redis client utility for ephemeral share token storage
 * Handles secure share tokens with TTL and permissions
 */

import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL;

let redis: Redis | null = null;

/**
 * Get or create Redis client
 * Returns null if Redis is not configured
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
 * Set a share token in Redis with TTL
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
 * Get a share token from Redis
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
 * Revoke (delete) a share token from Redis
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
 * Extend TTL of a share token
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
 * Update share token permissions
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
 * Close Redis connection
 */
export async function closeRedis(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = null;
  }
}
