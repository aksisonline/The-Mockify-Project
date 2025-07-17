"use client";

import type React from "react";

import { formatDistanceToNow } from "date-fns";
import { Check, X } from "lucide-react";

interface NotificationCardProps {
  id: string;
  title: string;
  description: string;
  timestamp: Date;
  read: boolean;
  type: "info" | "success" | "warning" | "error";
  onMarkAsRead: (id: string, e: React.MouseEvent) => void;
  onDismiss: (id: string, e: React.MouseEvent) => void;
}

export function NotificationCard({
  id,
  title,
  description,
  timestamp,
  read,
  type,
  onMarkAsRead,
  onDismiss,
}: NotificationCardProps) {
  const getTypeStyles = () => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200";
      case "warning":
        return "bg-amber-50 border-amber-200";
      case "error":
        return "bg-red-50 border-red-200";
      default:
        return "bg-blue-50 border-blue-200";
    }
  };

  const getIconStyles = () => {
    switch (type) {
      case "success":
        return "bg-green-100 text-green-600";
      case "warning":
        return "bg-amber-100 text-amber-600";
      case "error":
        return "bg-red-100 text-red-600";
      default:
        return "bg-blue-100 text-blue-600";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            />
          </svg>
        );
      case "warning":
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            />
          </svg>
        );
      case "error":
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z"
            />
          </svg>
        );
    }
  };

  return (
    <div
      className={`relative p-3 border rounded-lg mb-2 transition-all ${getTypeStyles()} ${
        read ? "opacity-70" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-full ${getIconStyles()}`}>{getIcon()}</div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <h4 className="font-medium text-sm">{title}</h4>
            <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
              {formatDistanceToNow(timestamp, { addSuffix: true })}
            </span>
          </div>
          <p className="text-xs text-gray-600 mt-1">{description}</p>
        </div>
      </div>
      <div className="flex gap-1 mt-2 justify-end">
        {!read && (
          <button
            onClick={(e) => onMarkAsRead(id, e)}
            className="text-xs flex items-center gap-1 px-2 py-1 rounded bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
          >
            <Check className="w-3 h-3" />
            Mark as read
          </button>
        )}
        <button
          onClick={(e) => onDismiss(id, e)}
          className="text-xs flex items-center gap-1 px-2 py-1 rounded bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
        >
          <X className="w-3 h-3" />
          Dismiss
        </button>
      </div>
      {!read && (
        <div className="absolute top-3 right-3 w-2 h-2 bg-blue-500 rounded-full"></div>
      )}
    </div>
  );
}
