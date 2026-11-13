import type { ReactNode } from 'react';

type Column<T> = {
  key: keyof T | string;
  label: string;
  align?: 'left' | 'right' | 'center';
  render?: (row: T) => ReactNode;
};

type DataTableProps<T extends Record<string, unknown>> = {
  columns: Column<T>[];
  rows: T[];
  emptyLabel?: string;
};

export function DataTable<T extends Record<string, unknown>>({ columns, rows, emptyLabel = 'No records found.' }: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead className="bg-surface-container-low">
          <tr className="border-b border-outline-variant">
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#656464] ${
                  column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : ''
                }`}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-b border-outline-variant transition-colors hover:bg-surface-container-low">
                {columns.map((column) => (
                  <td
                    key={String(column.key)}
                    className={`px-4 py-3 text-sm text-[#1b1c1c] ${
                      column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : ''
                    }`}
                  >
                    {column.render ? column.render(row) : String(row[column.key as keyof T] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td className="px-4 py-8 text-center text-sm text-[#656464]" colSpan={columns.length}>
                {emptyLabel}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
