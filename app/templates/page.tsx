"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import LeatherBackground from "@/components/ui/LeatherBackground";
import GlassCard from "@/components/ui/GlassCard";
import LeatherButton from "@/components/ui/LeatherButton";
import TopMenu from "@/components/ui/TopMenu";
import { builtInTemplates, getTemplateCategories } from "@/lib/templates";

interface CustomTemplate {
  _id: string;
  name: string;
  description: string;
  category: string;
  public: boolean;
  userId?: string;
  isBuiltIn?: boolean;
}

/**
 * Render the Templates page showing built-in and custom template categories with management options.
 *
 * @returns The page's React element containing a leather-themed background, top navigation, categorized template cards (each with an icon, name, description, and "Use Template" link), custom templates section, and a "Create Custom Template" call to action.
 */
export default function TemplatesPage() {
  const categories = getTemplateCategories();
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>([]);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        // Check authentication
        const authResponse = await fetch("/api/auth/session");
        const authData = await authResponse.json();
        
        if (authData.authenticated) {
          setUserEmail(authData.email);
          
          // Load custom templates
          const templatesResponse = await fetch(`/api/templates?userId=${encodeURIComponent(authData.email)}`);
          const templatesData = await templatesResponse.json();
          
          // Filter to show only custom (non-built-in) templates
          const custom = templatesData.templates.filter((t: CustomTemplate) => !t.isBuiltIn);
          setCustomTemplates(custom);
        }
      } catch (err) {
        console.error("Failed to load templates:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm("Are you sure you want to delete this template?")) {
      return;
    }

    try {
      const response = await fetch(`/api/templates?id=${templateId}&userId=${encodeURIComponent(userEmail!)}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete template");
      }

      // Remove from local state
      setCustomTemplates(customTemplates.filter((t) => t._id !== templateId));
      alert("Template deleted successfully");
    } catch (err) {
      console.error("Failed to delete template:", err);
      alert("Failed to delete template");
    }
  };

  return (
    <div className="min-h-screen relative">
      <LeatherBackground />
      
      {/* Top Menu */}
      <div className="relative z-10">
        <TopMenu currentPage="Templates" />
      </div>

      <main className="relative z-10 px-6 py-12">
        {/* Header */}
        <div className="max-w-6xl mx-auto mb-12 fade-in">
          <h1 className="text-5xl font-bold mb-4 text-leather-100">
            Document Templates
          </h1>
          <p className="text-leather-300">
            Start quickly with pre-built templates for your notes, journals, and projects.
          </p>
        </div>

        {/* Categories */}
        <div className="max-w-6xl mx-auto">
          {categories.map((category) => {
            const categoryTemplates = builtInTemplates.filter(
              (t) => t.category === category
            );
            
            return (
              <div key={category} className="mb-12 fade-in-delay-1">
                <h2 className="text-2xl font-bold mb-6 capitalize text-leather-100">
                  {category}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categoryTemplates.map((template) => (
                    <GlassCard key={template.id} hover>
                      <div className="flex items-start gap-4">
                        <div className="text-4xl">{template.icon}</div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold mb-2 text-leather-100">
                            {template.name}
                          </h3>
                          <p className="text-leather-300 text-sm mb-4">
                            {template.description}
                          </p>
                          <Link href={`/workspace?template=${template.id}`}>
                            <LeatherButton variant="leather" size="sm">
                              Use Template
                            </LeatherButton>
                          </Link>
                        </div>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Custom Templates Section */}
        {!loading && customTemplates.length > 0 && (
          <div className="max-w-6xl mx-auto mb-12 fade-in-delay-1">
            <h2 className="text-2xl font-bold mb-6 text-leather-100">
              My Custom Templates
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {customTemplates.map((template) => (
                <GlassCard key={template._id} hover>
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">📝</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2 text-leather-100">
                        {template.name}
                      </h3>
                      <p className="text-leather-300 text-sm mb-2">
                        {template.description || "No description"}
                      </p>
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-xs px-2 py-1 bg-leather-900/40 text-leather-400 rounded-full">
                          {template.category}
                        </span>
                        {template.public && (
                          <span className="text-xs px-2 py-1 bg-blue-900/40 text-blue-400 rounded-full">
                            Public
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/workspace?template=${template._id}`}>
                          <LeatherButton variant="leather" size="sm">
                            Use Template
                          </LeatherButton>
                        </Link>
                        {template.userId === userEmail && (
                          <button
                            type="button"
                            onClick={() => handleDeleteTemplate(template._id)}
                            className="px-3 py-2 text-xs bg-red-900/40 hover:bg-red-900/60 text-red-300 border border-red-700 transition-colors"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        )}

        {/* Custom Template CTA */}
        <div className="max-w-6xl mx-auto mt-16 fade-in-delay-2">
          <GlassCard>
            <div className="text-center py-8">
              <h3 className="text-2xl font-bold mb-4 text-leather-100">
                Create Your Own Template
              </h3>
              <p className="text-leather-300 mb-6">
                Design custom templates that fit your unique workflow
              </p>
              <Link href="/workspace">
                <LeatherButton variant="leather" size="md">
                  Create Custom Template
                </LeatherButton>
              </Link>
            </div>
          </GlassCard>
        </div>
      </main>
    </div>
  );
}