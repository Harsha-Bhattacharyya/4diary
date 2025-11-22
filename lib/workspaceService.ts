/**
 * Copyright © 2025 Harsha Bhattacharyya
 * 
 * This file is part of 4diary.
 * 
 * SPDX-License-Identifier: BSD-3-Clause
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the conditions in the LICENSE file are met.
 */

/**
 * Workspace service for managing workspaces
 */

import { keyManager } from "./crypto/keyManager";
import { exportKey } from "./crypto/keys";

export interface Workspace {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkspaceParams {
  userId: string;
  name: string;
}

/**
 * Create a new workspace
 */
export async function createWorkspace(
  params: CreateWorkspaceParams
): Promise<Workspace> {
  // Initialize key manager and get master key
  if (!keyManager.isInitialized()) {
    await keyManager.initialize();
  }

  const masterKey = keyManager.getMasterKey();

  // Export and encrypt the master key for storage
  const masterKeyData = await exportKey(masterKey);

  // ALPHA LIMITATION: Master key is stored with base64 encoding only.
  // Post-alpha, this will be encrypted with user's password using PBKDF2
  // with 100,000+ iterations for proper password-based key derivation.
  // Current implementation allows for quick alpha testing without password management.
  const encryptedMasterKey = btoa(masterKeyData);
  const salt = btoa(
    String.fromCharCode(...crypto.getRandomValues(new Uint8Array(16)))
  );

  // Send to API
  const response = await fetch("/api/workspaces", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: params.userId,
      name: params.name,
      encryptedMasterKey,
      salt,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to create workspace");
  }

  const result = await response.json();

  return {
    id: result.id,
    userId: params.userId,
    name: params.name,
    createdAt: result.workspace.createdAt,
    updatedAt: result.workspace.updatedAt,
  };
}

/**
 * List user's workspaces
 */
export async function listWorkspaces(userId: string): Promise<Workspace[]> {
  const response = await fetch(
    `/api/workspaces?userId=${encodeURIComponent(userId)}`
  );

  if (!response.ok) {
    throw new Error("Failed to list workspaces");
  }

  const data = await response.json();

  return data.workspaces.map((ws: { _id: string; userId: string; name: string; createdAt: string; updatedAt: string }) => ({
    id: ws._id,
    userId: ws.userId,
    name: ws.name,
    createdAt: ws.createdAt,
    updatedAt: ws.updatedAt,
  }));
}

/**
 * Get or create default workspace for user
 */
export async function getOrCreateDefaultWorkspace(
  userId: string
): Promise<Workspace> {
  const workspaces = await listWorkspaces(userId);

  if (workspaces.length > 0) {
    return workspaces[0];
  }

  return await createWorkspace({
    userId,
    name: "My Workspace",
  });
}
