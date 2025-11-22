"use client";

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

import { useEffect } from "react";
import { registerServiceWorker } from "@/lib/pwaService";

export default function PWAInit() {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return null;
}
