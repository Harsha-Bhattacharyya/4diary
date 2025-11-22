"use client";

import { useEffect } from "react";
import { registerServiceWorker } from "@/lib/pwaService";

export default function PWAInit() {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return null;
}
