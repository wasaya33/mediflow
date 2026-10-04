"use client";

import React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PaginationMeta } from "@/types";

interface DataTablePaginationProps {
  meta?: PaginationMeta;
  onPageChange: (page: number) => void;
  className?: string;
}

export const DataTablePagination: React.FC<DataTablePaginationProps> = ({
  meta,
  onPageChange,
  className,
}) => {
  if (!meta || meta.total === 0) return null;

  const { page, limit, total, totalPages, hasNextPage, hasPreviousPage } = meta;

  const startRecord = Math.min((page - 1) * limit + 1, total);
  const endRecord = Math.min(page * limit, total);

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-2 ${className || ""}`}
    >
      <div className="text-xs text-slate-500 font-medium">
        Showing <span className="font-semibold text-slate-800">{startRecord}</span> to{" "}
        <span className="font-semibold text-slate-800">{endRecord}</span> of{" "}
        <span className="font-semibold text-slate-800">{total}</span> records
      </div>

      <div className="flex items-center space-x-1.5">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(1)}
          disabled={page <= 1}
          className="h-8 w-8 text-slate-600 disabled:opacity-40"
          aria-label="First page"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPreviousPage}
          className="h-8 w-8 text-slate-600 disabled:opacity-40"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <span className="px-3 text-xs font-semibold text-slate-700">
          Page {page} of {totalPages}
        </span>

        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNextPage}
          className="h-8 w-8 text-slate-600 disabled:opacity-40"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(totalPages)}
          disabled={page >= totalPages}
          className="h-8 w-8 text-slate-600 disabled:opacity-40"
          aria-label="Last page"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default DataTablePagination;
