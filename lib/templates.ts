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
 * Template system for pre-built document templates
 * Supports template variables like {{date}}, {{title}}
 */

export interface TemplateVariable {
  key: string;
  label: string;
  defaultValue?: string;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon?: string;
  content: unknown; // BlockNote content structure
  variables: TemplateVariable[];
}

/**
 * Replace template variables with actual values
 */
export function processTemplateVariables(
  content: unknown,
  variables: Record<string, string>
): unknown {
  const contentString = JSON.stringify(content);
  let processed = contentString;

  // Replace all variables
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, "g");
    processed = processed.replace(regex, value);
  });

  return JSON.parse(processed);
}

/**
 * Get default variable values
 */
export function getDefaultVariables(): Record<string, string> {
  const now = new Date();
  return {
    date: now.toLocaleDateString(),
    time: now.toLocaleTimeString(),
    datetime: now.toLocaleString(),
    year: now.getFullYear().toString(),
    month: now.toLocaleDateString("en-US", { month: "long" }),
    day: now.toLocaleDateString("en-US", { weekday: "long" }),
  };
}

/**
 * Pre-built templates
 */
export const builtInTemplates: DocumentTemplate[] = [
  {
    id: "daily-note",
    name: "Daily Note",
    description: "A simple daily note with date heading",
    category: "journal",
    icon: "📅",
    content: [
      {
        type: "heading",
        props: { level: 1 },
        content: [{ type: "text", text: "{{date}}" }],
      },
      {
        type: "heading",
        props: { level: 2 },
        content: [{ type: "text", text: "Morning" }],
      },
      {
        type: "paragraph",
        content: [{ type: "text", text: "" }],
      },
      {
        type: "heading",
        props: { level: 2 },
        content: [{ type: "text", text: "Afternoon" }],
      },
      {
        type: "paragraph",
        content: [{ type: "text", text: "" }],
      },
      {
        type: "heading",
        props: { level: 2 },
        content: [{ type: "text", text: "Evening" }],
      },
      {
        type: "paragraph",
        content: [{ type: "text", text: "" }],
      },
    ],
    variables: [
      { key: "date", label: "Date" },
    ],
  },
  {
    id: "meeting-notes",
    name: "Meeting Notes",
    description: "Template for meeting minutes and action items",
    category: "work",
    icon: "📝",
    content: [
      {
        type: "heading",
        props: { level: 1 },
        content: [{ type: "text", text: "{{title}}" }],
      },
      {
        type: "paragraph",
        content: [
          { type: "text", text: "Date: {{date}}", styles: { bold: true } },
        ],
      },
      {
        type: "paragraph",
        content: [
          { type: "text", text: "Attendees: ", styles: { bold: true } },
        ],
      },
      {
        type: "heading",
        props: { level: 2 },
        content: [{ type: "text", text: "Agenda" }],
      },
      {
        type: "bulletListItem",
        content: [{ type: "text", text: "" }],
      },
      {
        type: "heading",
        props: { level: 2 },
        content: [{ type: "text", text: "Discussion" }],
      },
      {
        type: "paragraph",
        content: [{ type: "text", text: "" }],
      },
      {
        type: "heading",
        props: { level: 2 },
        content: [{ type: "text", text: "Action Items" }],
      },
      {
        type: "bulletListItem",
        content: [{ type: "text", text: "" }],
      },
    ],
    variables: [
      { key: "title", label: "Meeting Title" },
      { key: "date", label: "Date" },
    ],
  },
  {
    id: "project-plan",
    name: "Project Plan",
    description: "Comprehensive project planning template",
    category: "work",
    icon: "📊",
    content: [
      {
        type: "heading",
        props: { level: 1 },
        content: [{ type: "text", text: "{{title}}" }],
      },
      {
        type: "heading",
        props: { level: 2 },
        content: [{ type: "text", text: "Overview" }],
      },
      {
        type: "paragraph",
        content: [{ type: "text", text: "" }],
      },
      {
        type: "heading",
        props: { level: 2 },
        content: [{ type: "text", text: "Goals" }],
      },
      {
        type: "bulletListItem",
        content: [{ type: "text", text: "" }],
      },
      {
        type: "heading",
        props: { level: 2 },
        content: [{ type: "text", text: "Timeline" }],
      },
      {
        type: "paragraph",
        content: [{ type: "text", text: "" }],
      },
      {
        type: "heading",
        props: { level: 2 },
        content: [{ type: "text", text: "Deliverables" }],
      },
      {
        type: "bulletListItem",
        content: [{ type: "text", text: "" }],
      },
      {
        type: "heading",
        props: { level: 2 },
        content: [{ type: "text", text: "Resources" }],
      },
      {
        type: "bulletListItem",
        content: [{ type: "text", text: "" }],
      },
    ],
    variables: [
      { key: "title", label: "Project Name" },
    ],
  },
  {
    id: "task-list",
    name: "Task List",
    description: "Simple task list with priorities",
    category: "productivity",
    icon: "✅",
    content: [
      {
        type: "heading",
        props: { level: 1 },
        content: [{ type: "text", text: "Tasks - {{date}}" }],
      },
      {
        type: "heading",
        props: { level: 2 },
        content: [{ type: "text", text: "High Priority" }],
      },
      {
        type: "bulletListItem",
        content: [{ type: "text", text: "" }],
      },
      {
        type: "heading",
        props: { level: 2 },
        content: [{ type: "text", text: "Medium Priority" }],
      },
      {
        type: "bulletListItem",
        content: [{ type: "text", text: "" }],
      },
      {
        type: "heading",
        props: { level: 2 },
        content: [{ type: "text", text: "Low Priority" }],
      },
      {
        type: "bulletListItem",
        content: [{ type: "text", text: "" }],
      },
    ],
    variables: [
      { key: "date", label: "Date" },
    ],
  },
  {
    id: "journal-entry",
    name: "Journal Entry",
    description: "Reflective journal template",
    category: "journal",
    icon: "📔",
    content: [
      {
        type: "heading",
        props: { level: 1 },
        content: [{ type: "text", text: "Journal - {{date}}" }],
      },
      {
        type: "heading",
        props: { level: 2 },
        content: [{ type: "text", text: "How I'm Feeling" }],
      },
      {
        type: "paragraph",
        content: [{ type: "text", text: "" }],
      },
      {
        type: "heading",
        props: { level: 2 },
        content: [{ type: "text", text: "What Happened Today" }],
      },
      {
        type: "paragraph",
        content: [{ type: "text", text: "" }],
      },
      {
        type: "heading",
        props: { level: 2 },
        content: [{ type: "text", text: "Grateful For" }],
      },
      {
        type: "bulletListItem",
        content: [{ type: "text", text: "" }],
      },
      {
        type: "heading",
        props: { level: 2 },
        content: [{ type: "text", text: "Tomorrow's Goals" }],
      },
      {
        type: "bulletListItem",
        content: [{ type: "text", text: "" }],
      },
    ],
    variables: [
      { key: "date", label: "Date" },
    ],
  },
  {
    id: "research-notes",
    name: "Research Notes",
    description: "Academic or research documentation",
    category: "notes",
    icon: "📚",
    content: [
      {
        type: "heading",
        props: { level: 1 },
        content: [{ type: "text", text: "{{title}}" }],
      },
      {
        type: "paragraph",
        content: [
          { type: "text", text: "Date: {{date}}", styles: { bold: true } },
        ],
      },
      {
        type: "heading",
        props: { level: 2 },
        content: [{ type: "text", text: "Key Questions" }],
      },
      {
        type: "bulletListItem",
        content: [{ type: "text", text: "" }],
      },
      {
        type: "heading",
        props: { level: 2 },
        content: [{ type: "text", text: "Research Findings" }],
      },
      {
        type: "paragraph",
        content: [{ type: "text", text: "" }],
      },
      {
        type: "heading",
        props: { level: 2 },
        content: [{ type: "text", text: "Sources and Citations" }],
      },
      {
        type: "bulletListItem",
        content: [{ type: "text", text: "" }],
      },
      {
        type: "heading",
        props: { level: 2 },
        content: [{ type: "text", text: "Conclusions" }],
      },
      {
        type: "paragraph",
        content: [{ type: "text", text: "" }],
      },
    ],
    variables: [
      { key: "title", label: "Research Topic" },
      { key: "date", label: "Date" },
    ],
  },
  {
    id: "ideas-brainstorming",
    name: "Ideas & Brainstorming",
    description: "Capture creative ideas",
    category: "productivity",
    icon: "💡",
    content: [
      {
        type: "heading",
        props: { level: 1 },
        content: [{ type: "text", text: "{{title}}" }],
      },
      {
        type: "paragraph",
        content: [
          { type: "text", text: "Date: {{date}}", styles: { bold: true } },
        ],
      },
      {
        type: "heading",
        props: { level: 2 },
        content: [{ type: "text", text: "Problem Statement" }],
      },
      {
        type: "paragraph",
        content: [{ type: "text", text: "" }],
      },
      {
        type: "heading",
        props: { level: 2 },
        content: [{ type: "text", text: "Potential Solutions" }],
      },
      {
        type: "bulletListItem",
        content: [{ type: "text", text: "" }],
      },
      {
        type: "heading",
        props: { level: 2 },
        content: [{ type: "text", text: "Next Actions" }],
      },
      {
        type: "bulletListItem",
        content: [{ type: "text", text: "" }],
      },
    ],
    variables: [
      { key: "title", label: "Idea Title" },
      { key: "date", label: "Date" },
    ],
  },
];

/**
 * Get template by ID
 */
export function getTemplateById(id: string): DocumentTemplate | undefined {
  return builtInTemplates.find((template) => template.id === id);
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: string): DocumentTemplate[] {
  return builtInTemplates.filter((template) => template.category === category);
}

/**
 * Get all template categories
 */
export function getTemplateCategories(): string[] {
  const categories = new Set(builtInTemplates.map((t) => t.category));
  return Array.from(categories);
}

/**
 * Create document from template
 */
export function createFromTemplate(
  templateId: string,
  variables?: Record<string, string>
): unknown {
  const template = getTemplateById(templateId);
  if (!template) {
    throw new Error(`Template not found: ${templateId}`);
  }

  const defaultVars = getDefaultVariables();
  const mergedVars = { ...defaultVars, ...variables };

  return processTemplateVariables(template.content, mergedVars);
}
