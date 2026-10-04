"use client";

import React, { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value: externalValue,
  onChange,
  placeholder = "Search...",
  debounceMs = 300,
  className,
}) => {
  const [internalValue, setInternalValue] = useState<string>(externalValue);

  // Sync internal state when external prop changes
  useEffect(() => {
    setInternalValue(externalValue);
  }, [externalValue]);

  // Debounced effect for triggering onChange
  useEffect(() => {
    const handler = setTimeout(() => {
      if (internalValue !== externalValue) {
        onChange(internalValue);
      }
    }, debounceMs);

    return () => clearTimeout(handler);
  }, [internalValue, externalValue, onChange, debounceMs]);

  const handleClear = () => {
    setInternalValue("");
    onChange("");
  };

  return (
    <div className={cn("relative flex items-center w-full", className)}>
      <Search className="absolute left-3 h-4 w-4 text-slate-400 pointer-events-none" />
      <Input
        type="text"
        value={internalValue}
        onChange={(e) => setInternalValue(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-9 h-10 w-full bg-white border-slate-200/90 text-sm focus-visible:ring-indigo-500 rounded-lg"
        aria-label={placeholder}
      />
      {internalValue && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleClear}
          className="absolute right-1.5 h-7 w-7 text-slate-400 hover:text-slate-600 rounded-md"
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
};

export default SearchInput;
