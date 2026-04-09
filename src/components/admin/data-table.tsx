'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  emptyMessage = 'No data found.',
}: DataTableProps<T>) {
  return (
    <div className='rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col, i) => (
              <TableHead key={i}>{col.header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className='text-muted-foreground h-24 text-center'
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map(row => (
              <TableRow key={row.id}>
                {columns.map((col, i) => (
                  <TableCell key={i}>
                    {col.cell
                      ? col.cell(row)
                      : col.accessorKey
                        ? String(row[col.accessorKey] ?? '')
                        : ''}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
