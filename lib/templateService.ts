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
 * Template service for creating documents from templates
 */

import { createDocument, type DocumentMetadata } from "./documentService";
import {
  getTemplateById,
  createFromTemplate,
  getDefaultVariables,
} from "./templates";

export interface CreateFromTemplateParams {
  templateId: string;
  workspaceId: string;
  userId: string;
  title?: string;
  variables?: Record<string, string>;
}

/**
 * Create a new document from a template
 */
export async function createDocumentFromTemplate(
  params: CreateFromTemplateParams
): Promise<string> {
  // Get the template
  const template = getTemplateById(params.templateId);
  if (!template) {
    throw new Error(`Template not found: ${params.templateId}`);
  }

  // Prepare variables
  const defaultVars = getDefaultVariables();
  const variables = {
    ...defaultVars,
    title: params.title || `New ${template.name}`,
    ...params.variables,
  };

  // Create content from template
  const content = createFromTemplate(params.templateId, variables);

  // Ensure content is an array
  const contentArray = Array.isArray(content) ? content : [];

  // Determine document title
  const documentTitle = params.title || variables.title || template.name;

  // Create metadata
  const metadata: DocumentMetadata = {
    title: documentTitle,
    tags: [template.category],
  };

  // Create the encrypted document
  const document = await createDocument({
    workspaceId: params.workspaceId,
    userId: params.userId,
    content: contentArray,
    metadata,
  });

  return document.id;
}
