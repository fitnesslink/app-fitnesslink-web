"use client";

interface PaginatorProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (next: number) => void;
}

export function Paginator({ page, pageSize, total, onPageChange }: PaginatorProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(total, page * pageSize);

  return (
    <div className="flex items-center justify-between pt-4">
      <p className="text-sm text-text-secondary tabular-nums">
        {total === 0 ? "No results" : `${start}–${end} of ${total}`}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="px-3 py-1.5 rounded-lg border border-border-soft text-sm font-medium text-text-primary disabled:opacity-40 hover:bg-primary-soft"
        >
          Previous
        </button>
        <span className="text-sm text-text-secondary tabular-nums">
          {page} / {totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="px-3 py-1.5 rounded-lg border border-border-soft text-sm font-medium text-text-primary disabled:opacity-40 hover:bg-primary-soft"
        >
          Next
        </button>
      </div>
    </div>
  );
}
