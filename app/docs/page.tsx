"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import 'highlight.js/styles/github-dark.css';
import LeatherBackground from "@/components/ui/LeatherBackground";
import GlassCard from "@/components/ui/GlassCard";
import TopMenu from "@/components/ui/TopMenu";

interface DocFile {
  name: string;
  slug: string;
  title: string;
}

interface DocCategory {
  name: string;
  slug: string;
  files: DocFile[];
}

interface DocsStructure {
  categories: DocCategory[];
}

/**
 * Renders a dynamic documentation page that reads markdown files from the docs directory
 * and displays them with a sidebar navigation
 */
export default function DocsPage() {
  const [docsStructure, setDocsStructure] = useState<DocsStructure | null>(null);
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [content, setContent] = useState<string>("");
  const [title, setTitle] = useState<string>("Documentation");
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Load documentation structure
  useEffect(() => {
    async function loadStructure() {
      try {
        const response = await fetch('/api/docs');
        const data: DocsStructure = await response.json();
        setDocsStructure(data);
        
        // Auto-select first document
        if (data.categories.length > 0 && data.categories[0].files.length > 0) {
          const firstCategory = data.categories[0];
          const firstFile = firstCategory.files[0];
          setCurrentCategory(firstCategory.slug);
          setCurrentFile(firstFile.slug);
          setExpandedCategories(new Set([firstCategory.slug]));
        }
      } catch (error) {
        console.error('Error loading docs structure:', error);
      } finally {
        setLoading(false);
      }
    }
    loadStructure();
  }, []);

  // Load document content when selection changes
  useEffect(() => {
    if (!currentCategory || !currentFile) return;

    async function loadContent() {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/docs/content?category=${currentCategory}&file=${currentFile}`
        );
        const data = await response.json();
        setContent(data.content || '');
        setTitle(data.title || 'Documentation');
      } catch (error) {
        console.error('Error loading document:', error);
        setContent('# Error\n\nFailed to load documentation.');
      } finally {
        setLoading(false);
      }
    }
    loadContent();
  }, [currentCategory, currentFile]);

  const toggleCategory = (categorySlug: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categorySlug)) {
        newSet.delete(categorySlug);
      } else {
        newSet.add(categorySlug);
      }
      return newSet;
    });
  };

  const selectDocument = (categorySlug: string, fileSlug: string) => {
    setCurrentCategory(categorySlug);
    setCurrentFile(fileSlug);
    // Auto-expand category when selecting a file
    if (!expandedCategories.has(categorySlug)) {
      setExpandedCategories((prev) => new Set([...prev, categorySlug]));
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col">
      <LeatherBackground />

      {/* Top Menu */}
      <div className="relative z-10">
        <TopMenu currentPage="Docs" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'w-80' : 'w-0'
          } transition-all duration-300 overflow-hidden flex-shrink-0`}
        >
          <div className="h-full p-4 overflow-y-auto">
            <GlassCard className="h-full">
              <div className="p-4">
                <h2 className="text-xl font-bold text-leather-100 mb-4">
                  Documentation
                </h2>
                
                {!docsStructure || docsStructure.categories.length === 0 ? (
                  <p className="text-leather-300 text-sm">No documentation found</p>
                ) : (
                  <nav className="space-y-2">
                    {docsStructure.categories.map((category) => (
                      <div key={category.slug}>
                        <button
                          type="button"
                          onClick={() => toggleCategory(category.slug)}
                          className="w-full flex items-center justify-between px-3 py-2 text-left text-leather-100 hover:bg-leather-900/30 rounded-md transition-colors"
                        >
                          <span className="font-semibold text-sm">{category.name}</span>
                          <span className="text-leather-400">
                            {expandedCategories.has(category.slug) ? '▼' : '▶'}
                          </span>
                        </button>
                        
                        {expandedCategories.has(category.slug) && (
                          <div className="ml-4 mt-1 space-y-1">
                            {category.files.map((file) => (
                              <button
                                type="button"
                                key={file.slug}
                                onClick={() => selectDocument(category.slug, file.slug)}
                                className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                                  currentCategory === category.slug && currentFile === file.slug
                                    ? 'bg-leather-300 text-leather-900 font-medium'
                                    : 'text-leather-300 hover:bg-leather-900/20 hover:text-leather-100'
                                }`}
                              >
                                {file.title}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </nav>
                )}
              </div>
            </GlassCard>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-6">
            {/* Toggle Sidebar Button */}
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="mb-4 px-4 py-2 bg-leather-900/30 hover:bg-leather-900/50 text-leather-100 rounded-md transition-colors text-sm"
            >
              {sidebarOpen ? '← Hide Sidebar' : '→ Show Sidebar'}
            </button>

            {/* Header */}
            <div className="mb-6 fade-in">
              <h1 className="text-4xl font-bold text-leather-100 mb-2">{title}</h1>
              <div className="h-1 w-20 bg-leather-300 rounded"></div>
            </div>

            {/* Content */}
            <GlassCard className="fade-in-delay-1">
              <div className="p-6 sm:p-8">
                {loading ? (
                  <div className="text-leather-300 text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-leather-300"></div>
                    <p className="mt-4">Loading documentation...</p>
                  </div>
                ) : (
                  <div className="prose prose-invert max-w-none docs-content">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeHighlight, rehypeRaw]}
                      components={{
                        h1: ({ children }) => (
                          <h1 className="text-3xl font-bold text-leather-100 mt-8 mb-4 first:mt-0">
                            {children}
                          </h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="text-2xl font-bold text-leather-100 mt-6 mb-3">
                            {children}
                          </h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="text-xl font-semibold text-leather-100 mt-5 mb-2">
                            {children}
                          </h3>
                        ),
                        p: ({ children }) => (
                          <p className="text-leather-300 leading-relaxed mb-4">
                            {children}
                          </p>
                        ),
                        a: ({ href, children }) => (
                          <a
                            href={href}
                            className="text-leather-200 hover:text-leather-100 underline"
                            target={href?.startsWith('http') ? '_blank' : undefined}
                            rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                          >
                            {children}
                          </a>
                        ),
                        code: ({ inline, className, children, ...props }: {
                          inline?: boolean;
                          className?: string;
                          children?: React.ReactNode;
                        }) => {
                          if (inline) {
                            return (
                              <code className="px-1.5 py-0.5 bg-leather-900/50 text-leather-200 rounded text-sm font-mono">
                                {children}
                              </code>
                            );
                          }
                          return (
                            <code className={className} {...props}>
                              {children}
                            </code>
                          );
                        },
                        pre: ({ children }) => (
                          <pre className="bg-[#0d1117] p-4 rounded-lg overflow-x-auto my-4">
                            {children}
                          </pre>
                        ),
                        ul: ({ children }) => (
                          <ul className="list-disc list-inside text-leather-300 space-y-2 mb-4">
                            {children}
                          </ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="list-decimal list-inside text-leather-300 space-y-2 mb-4">
                            {children}
                          </ol>
                        ),
                        li: ({ children }) => (
                          <li className="text-leather-300">{children}</li>
                        ),
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-4 border-leather-300 pl-4 italic text-leather-300 my-4">
                            {children}
                          </blockquote>
                        ),
                        table: ({ children }) => (
                          <div className="overflow-x-auto my-4">
                            <table className="min-w-full border-collapse border border-leather-700">
                              {children}
                            </table>
                          </div>
                        ),
                        th: ({ children }) => (
                          <th className="border border-leather-700 px-4 py-2 bg-leather-900/30 text-leather-100 font-semibold text-left">
                            {children}
                          </th>
                        ),
                        td: ({ children }) => (
                          <td className="border border-leather-700 px-4 py-2 text-leather-300">
                            {children}
                          </td>
                        ),
                        hr: () => (
                          <hr className="border-t border-leather-700 my-6" />
                        ),
                      }}
                    >
                      {content}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </GlassCard>
          </div>
        </main>
      </div>
    </div>
  );
}