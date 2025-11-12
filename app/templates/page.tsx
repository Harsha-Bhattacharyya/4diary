"use client";

import React from "react";
import Link from "next/link";
import LeatherBackground from "@/components/ui/LeatherBackground";
import GlassCard from "@/components/ui/GlassCard";
import LeatherButton from "@/components/ui/LeatherButton";
import TopMenu from "@/components/ui/TopMenu";
import { builtInTemplates, getTemplateCategories } from "@/lib/templates";

/**
 * Render the Templates page showing built-in template categories and a CTA for creating custom templates.
 *
 * @returns The page's React element containing a leather-themed background, top navigation, categorized template cards (each with an icon, name, description, and "Use Template" link), and a "Create Custom Template" call to action.
 */
export default function TemplatesPage() {
  const categories = getTemplateCategories();

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