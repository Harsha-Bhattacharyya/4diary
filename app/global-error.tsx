"use client";

import * as Sentry from "@sentry/nextjs";
import NextError from "next/error";
import { useEffect } from "react";

/**
 * Client-side error boundary component that reports the provided error to Sentry and renders the Next.js default error page.
 *
 * Captures `error` with Sentry when the prop changes and renders NextError with `statusCode` set to 0 so Next.js shows a generic error UI.
 *
 * @param error - The error to report; may include an optional `digest` field.
 * @returns The Next.js default error page wrapped in HTML/body markup.
 */
export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        {/* `NextError` is the default Next.js error page component. Its type
        definition requires a `statusCode` prop. However, since the App Router
        does not expose status codes for errors, we simply pass 0 to render a
        generic error message. */}
        <NextError statusCode={0} />
      </body>
    </html>
  );
}