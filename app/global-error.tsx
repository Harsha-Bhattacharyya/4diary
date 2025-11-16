"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

/**
 * Client-side error boundary component with leather-themed styling.
 *
 * Captures `error` with Sentry when the prop changes and renders a custom error page
 * with leather styling instead of the default Next.js error UI.
 *
 * @param error - The error to report; may include an optional `digest` field.
 * @returns A custom leather-styled error page wrapped in HTML/body markup.
 */
export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <head>
        <title>Something went wrong - 4diary</title>
        <style>{`
          :root {
            --leather-50: #f5f0e8;
            --leather-100: #e8dcc8;
            --leather-200: #d4c5a8;
            --leather-300: #c0ae88;
            --leather-400: #a89168;
            --leather-500: #8b6f47;
            --leather-600: #6b5539;
            --leather-700: #4a3b28;
            --leather-800: #2b1f16;
            --leather-900: #1a1108;
          }
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'IM Fell DW Pica', Georgia, 'Times New Roman', serif;
            background: linear-gradient(135deg, var(--leather-800), var(--leather-900));
            color: var(--leather-100);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
          }
          
          .error-container {
            max-width: 600px;
            width: 100%;
            background: rgba(107, 85, 57, 0.3);
            backdrop-filter: blur(12px);
            border: 2px solid var(--leather-700);
            padding: 3rem;
            text-align: center;
            animation: fadeIn 0.6s ease-out;
          }
          
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .error-icon {
            font-size: 5rem;
            margin-bottom: 1.5rem;
            animation: pulse 2s ease-in-out infinite;
          }
          
          @keyframes pulse {
            0%, 100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.05);
            }
          }
          
          h1 {
            color: var(--leather-100);
            font-size: 2.5rem;
            font-weight: bold;
            margin-bottom: 1rem;
          }
          
          p {
            color: var(--leather-300);
            font-size: 1.125rem;
            line-height: 1.6;
            margin-bottom: 2rem;
          }
          
          .error-details {
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid var(--leather-800);
            padding: 1rem;
            margin: 1.5rem 0;
            text-align: left;
            font-family: monospace;
            font-size: 0.875rem;
            color: var(--leather-400);
            word-break: break-word;
            max-height: 200px;
            overflow-y: auto;
          }
          
          .button {
            display: inline-block;
            padding: 0.75rem 2rem;
            background: var(--leather-600);
            color: var(--leather-100);
            border: 2px solid var(--leather-700);
            text-decoration: none;
            font-weight: bold;
            font-size: 1rem;
            transition: all 0.3s ease;
            cursor: pointer;
          }
          
          .button:hover {
            background: var(--leather-500);
            border-color: var(--leather-600);
            transform: translateY(-2px);
          }
          
          .vignette {
            position: fixed;
            inset: 0;
            background: radial-gradient(circle at center, transparent 0%, rgba(0, 0, 0, 0.4) 100%);
            pointer-events: none;
            z-index: -1;
          }
        `}</style>
      </head>
      <body>
        <div className="vignette"></div>
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h1>Something Went Wrong</h1>
          <p>
            We encountered an unexpected error while processing your request. 
            The issue has been logged and we'll look into it.
          </p>
          
          {error.message && (
            <div className="error-details">
              <strong>Error:</strong> {error.message}
              {error.digest && (
                <>
                  <br />
                  <strong>Error ID:</strong> {error.digest}
                </>
              )}
            </div>
          )}
          
          <button 
            className="button" 
            onClick={() => window.location.href = '/'}
          >
            Return Home
          </button>
        </div>
      </body>
    </html>
  );
}