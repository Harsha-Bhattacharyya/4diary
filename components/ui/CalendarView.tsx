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
 * Calendar view component - Shows documents organized by date
 */

"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import type { Document } from "@/lib/documentService";

interface CalendarViewProps {
  documents: Document[];
}

interface DayDocuments {
  date: Date;
  dateStr: string;
  documents: Document[];
}

export default function CalendarView({ documents }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Group documents by date using useMemo to avoid effect
  const daysWithDocs = useMemo(() => {
    const grouped = new Map<string, Document[]>();
    
    documents.forEach((doc) => {
      const date = new Date(doc.updatedAt || doc.createdAt);
      const dateStr = date.toISOString().split("T")[0];
      
      if (!grouped.has(dateStr)) {
        grouped.set(dateStr, []);
      }
      grouped.get(dateStr)!.push(doc);
    });

    return grouped;
  }, [documents]);

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: DayDocuments[] = [];

    // Add empty days for previous month
    for (let i = 0; i < startingDayOfWeek; i++) {
      const date = new Date(year, month, -startingDayOfWeek + i + 1);
      days.push({
        date,
        dateStr: date.toISOString().split("T")[0],
        documents: [],
      });
    }

    // Add days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split("T")[0];
      days.push({
        date,
        dateStr,
        documents: daysWithDocs.get(dateStr) || [],
      });
    }

    return days;
  };

  const calendarDays = generateCalendarDays();
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const prevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    );
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    );
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="p-6 glass-card rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          📅 Calendar View
        </h2>
        <div className="flex items-center gap-4">
          <button
            onClick={prevMonth}
            className="px-3 py-1 rounded bg-amber-100 hover:bg-amber-200 transition-colors"
          >
            ←
          </button>
          <span className="font-medium text-gray-700 min-w-[150px] text-center">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </span>
          <button
            onClick={nextMonth}
            className="px-3 py-1 rounded bg-amber-100 hover:bg-amber-200 transition-colors"
          >
            →
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-gray-600 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((day, index) => {
          const isCurrentMonth =
            day.date.getMonth() === currentMonth.getMonth();
          const isToday = day.dateStr === today;
          const hasDocuments = day.documents.length > 0;

          return (
            <div
              key={index}
              className={`
                min-h-[100px] p-2 rounded border
                ${isCurrentMonth ? "bg-white" : "bg-gray-50"}
                ${isToday ? "border-aqua-500 border-2" : "border-gray-200"}
                ${!isCurrentMonth ? "opacity-50" : ""}
              `}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-sm ${
                    isToday
                      ? "font-bold text-aqua-600"
                      : "text-gray-700"
                  }`}
                >
                  {day.date.getDate()}
                </span>
                {hasDocuments && (
                  <span className="text-xs bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                    {day.documents.length}
                  </span>
                )}
              </div>
              <div className="space-y-1">
                {day.documents.slice(0, 3).map((doc) => (
                  <Link
                    key={doc.id}
                    href={`/workspace?doc=${doc.id}`}
                    className="block text-xs p-1 rounded bg-amber-50 hover:bg-amber-100 transition-colors truncate"
                    title={doc.metadata.title}
                  >
                    {doc.metadata.emojiIcon || "📄"} {doc.metadata.title}
                  </Link>
                ))}
                {day.documents.length > 3 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{day.documents.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-aqua-500 rounded"></div>
          <span>Today</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-amber-100 rounded"></div>
          <span>Has documents</span>
        </div>
      </div>
    </div>
  );
}
