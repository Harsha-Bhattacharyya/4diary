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
 * Icon mapping utilities for flat-color-icons
 * Maps semantic meanings to specific flat-color icon names
 */

export interface IconDefinition {
  name: string;
  label: string;
  category: string;
}

/**
 * All available document-related icons
 */
export const documentIcons: IconDefinition[] = [
  { name: "document", label: "Document", category: "document" },
  { name: "file", label: "File", category: "document" },
  { name: "todo-list", label: "Todo List", category: "document" },
  { name: "planner", label: "Planner", category: "document" },
  { name: "calendar", label: "Calendar", category: "document" },
  { name: "bookmark", label: "Bookmark", category: "document" },
  { name: "notebook", label: "Notebook", category: "document" },
  { name: "template", label: "Template", category: "document" },
];

/**
 * All available security/encryption icons
 */
export const securityIcons: IconDefinition[] = [
  { name: "lock", label: "Lock", category: "security" },
  { name: "data-encryption", label: "Encryption", category: "security" },
  { name: "data-protection", label: "Protection", category: "security" },
  { name: "key", label: "Key", category: "security" },
  { name: "privacy", label: "Privacy", category: "security" },
  { name: "safe", label: "Safe", category: "security" },
];

/**
 * All available general purpose icons
 */
export const generalIcons: IconDefinition[] = [
  { name: "globe", label: "Globe", category: "general" },
  { name: "multiple-devices", label: "Devices", category: "general" },
  { name: "electronics", label: "Computer", category: "general" },
  { name: "package", label: "Package", category: "general" },
  { name: "info", label: "Information", category: "general" },
  { name: "disclaimer", label: "Warning", category: "general" },
  { name: "like", label: "Like", category: "general" },
  { name: "idea", label: "Idea", category: "general" },
  { name: "home", label: "Home", category: "general" },
  { name: "settings", label: "Settings", category: "general" },
  { name: "briefcase", label: "Briefcase", category: "general" },
  { name: "businessman", label: "Person", category: "general" },
  { name: "organization", label: "Organization", category: "general" },
];

/**
 * All available business/productivity icons
 */
export const businessIcons: IconDefinition[] = [
  { name: "business", label: "Business", category: "business" },
  { name: "briefcase", label: "Briefcase", category: "business" },
  { name: "manager", label: "Manager", category: "business" },
  { name: "businessman", label: "Businessman", category: "business" },
  { name: "businesswoman", label: "Businesswoman", category: "business" },
  { name: "workflow", label: "Workflow", category: "business" },
  { name: "timeline", label: "Timeline", category: "business" },
  { name: "services", label: "Services", category: "business" },
];

/**
 * All available media/creative icons
 */
export const mediaIcons: IconDefinition[] = [
  { name: "image-file", label: "Image", category: "media" },
  { name: "audio-file", label: "Audio", category: "media" },
  { name: "video-file", label: "Video", category: "media" },
  { name: "camera", label: "Camera", category: "media" },
  { name: "gallery", label: "Gallery", category: "media" },
  { name: "music", label: "Music", category: "media" },
];

/**
 * Combined list of all icons for the picker
 */
export const allPickerIcons: IconDefinition[] = [
  ...documentIcons,
  ...securityIcons,
  ...generalIcons,
  ...businessIcons,
  ...mediaIcons,
];

/**
 * Semantic icon mappings for UI elements
 */
export const semanticIcons = {
  // Document types
  defaultDocument: "document",
  note: "document",
  template: "template",
  file: "file",
  
  // Security
  encrypted: "data-encryption",
  lock: "lock",
  key: "key",
  secure: "data-protection",
  
  // General
  globe: "globe",
  web: "globe",
  computer: "multiple-devices",
  laptop: "electronics",
  
  // Actions
  export: "export",
  package: "package",
  
  // Feedback
  warning: "disclaimer",
  info: "info",
  error: "cancel",
  success: "checkmark",
  like: "like",
  love: "like",
  
  // Default for picker
  defaultPicker: "document",
} as const;

/**
 * Get the icon name for a semantic meaning
 */
export function getSemanticIcon(semantic: keyof typeof semanticIcons): string {
  return semanticIcons[semantic];
}
