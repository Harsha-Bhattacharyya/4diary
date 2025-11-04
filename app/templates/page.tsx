import React from "react";
import Link from "next/link";
import FruityBackground from "@/components/ui/FruityBackground";
import GlassCard from "@/components/ui/GlassCard";
import FruityButton from "@/components/ui/FruityButton";
import { builtInTemplates, getTemplateCategories } from "@/lib/templates";

export default function TemplatesPage() {
  const categories = getTemplateCategories();

  return (
    <div className="min-h-screen relative">
      <FruityBackground />

      <main className="relative z-10 px-6 py-12">
        {/* Header */}
        <div className="max-w-6xl mx-auto mb-12">
          <Link href="/">
            <FruityButton variant="glass" size="sm">
              ← Back to Home
            </FruityButton>
          </Link>

          <h1 className="text-5xl font-bold mt-8 mb-4 bg-gradient-to-r from-aqua-600 to-purple-600 bg-clip-text text-transparent">
            Document Templates
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
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
              <div key={category} className="mb-12">
                <h2 className="text-2xl font-semibold mb-6 capitalize text-gray-800 dark:text-gray-200">
                  {category}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categoryTemplates.map((template) => (
                    <GlassCard key={template.id} hover>
                      <div className="flex items-start gap-4">
                        <div className="text-4xl">{template.icon}</div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">
                            {template.name}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                            {template.description}
                          </p>
                          <Link href={`/workspace?template=${template.id}`}>
                            <FruityButton variant="aqua" size="sm">
                              Use Template
                            </FruityButton>
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
        <div className="max-w-6xl mx-auto mt-16">
          <GlassCard>
            <div className="text-center py-8">
              <h3 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
                Create Your Own Template
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Design custom templates that fit your unique workflow
              </p>
              <Link href="/workspace">
                <FruityButton variant="gradient" size="md">
                  Create Custom Template
                </FruityButton>
              </Link>
            </div>
          </GlassCard>
        </div>
      </main>
    </div>
  );
}
