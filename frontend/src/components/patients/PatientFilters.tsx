"use client";

import React from "react";
import { RotateCcw } from "lucide-react";
import { SearchInput } from "@/components/shared/SearchInput";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PatientFiltersProps {
  search: string;
  onSearchChange: (search: string) => void;
  gender?: string;
  onGenderChange: (gender: string) => void;
  status: string; // "all" | "active" | "inactive"
  onStatusChange: (status: string) => void;
  onReset: () => void;
}

export const PatientFilters: React.FC<PatientFiltersProps> = ({
  search,
  onSearchChange,
  gender,
  onGenderChange,
  status,
  onStatusChange,
  onReset,
}) => {
  const hasActiveFilters = Boolean(search || (gender && gender !== "all") || (status && status !== "active"));

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-xl border border-slate-200/90 shadow-2xs">
      {/* Search Input */}
      <div className="flex-1 min-w-[240px] max-w-lg">
        <SearchInput
          value={search}
          onChange={onSearchChange}
          placeholder="Search by MRN, name, phone, or email..."
        />
      </div>

      {/* Filter Dropdowns */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Gender Filter */}
        <div className="w-36">
          <Select
            value={gender || "all"}
            onValueChange={(val) => onGenderChange(!val || val === "all" ? "" : val)}
          >
            <SelectTrigger className="h-10 text-xs bg-slate-50/70 border-slate-200">
              <SelectValue placeholder="Gender: All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Genders</SelectItem>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Status Filter */}
        <div className="w-36">
          <Select
            value={status}
            onValueChange={(val) => onStatusChange(val || "all")}
          >
            <SelectTrigger className="h-10 text-xs bg-slate-50/70 border-slate-200">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active Only</SelectItem>
              <SelectItem value="inactive">Inactive Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Reset button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-10 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 px-2.5"
            title="Reset filters"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
            Reset
          </Button>
        )}
      </div>
    </div>
  );
};

export default PatientFilters;
