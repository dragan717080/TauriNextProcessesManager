import { FC, useState, useEffect } from 'react'
import { invoke } from "@tauri-apps/api/tauri"
import { Processes } from '@/interfaces'

import {
  flexRender,
  SortingState,
  VisibilityState,
  ColumnFiltersState,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable
} from '@tanstack/react-table'

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import processesColumns from './ProcessesColumns'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const Processes: FC = () => {
  const [processes, setProcesses] = useState<Processes>({} as Processes);
  const [columns, setColumns] = useState<unknown>([])
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  const table = useReactTable({
    data: processes.processes,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const processes = await invoke<string>("get_processes_data");
        setColumns(processesColumns(processes["Total CPU usage"], processes["Total memory usage"]));
        setProcesses(processes);
      } catch (err) {
        console.error(err);
      }
    };

    // Initial fetch
    fetchData();

    const intervalId = setInterval(fetchData, 60000);

    // Cleanup function to clear the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, []);

  const removeProcessAtIndex = (indexToRemove) => {
    setProcesses((prevState) => {
      const updatedProcesses = [
        ...prevState.processes.slice(0, indexToRemove),
        ...prevState.processes.slice(indexToRemove + 1),
      ];
  
      // Create a new state object with the updated processes array
      return {
        ...prevState,
        processes: updatedProcesses,
      };
    });
  };

  const stopProcess = async (process) => {
    removeProcessAtIndex(process.index);

    await invoke<string>("stop_process", { processName: process.original["Process Group"] });
  }

  return JSON.stringify(processes) === "{}" ? <div>Loading...</div> : (
    <section className="pb-10">
      <div className="container">
        <h1 className="mb-6 text-3xl font-bold">Processes</h1>
        <>
          {/* Filters */}
          <div className='flex items-center justify-between'>
            <div className='flex items-center py-4'>
              <Input
                placeholder='Search by name...'
                value={(table.getColumn('Process Group')?.getFilterValue() as string) ?? ''}
                onChange={event =>
                  table.getColumn('Process Group')?.setFilterValue(event.target.value)
                }
                className='max-w-sm'
              />
            </div>
            {/* Column visibility */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='outline' className='ml-auto'>
                  Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                {table
                  .getAllColumns()
                  .filter(column => column.getCanHide())
                  .map(column => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className='capitalize'
                        checked={column.getIsVisible()}
                        onCheckedChange={value => column.toggleVisibility(!!value)}
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    )
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {/* Table */}
          <div className='rounded-md border'>
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map(headerGroup => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map(header => {
                      return (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && 'selected'}
                    >
                      <TableCell className='pl-7'>
                        {`${row.original["Process Group"]} (${row.original["Process Count"]})`}
                      </TableCell>
                      <TableCell className='pl-12'>
                        {row.original["CPU %"]}
                      </TableCell>
                      <TableCell className='pl-12'>
                        {`${row.original["Total WS"]}`}
                      </TableCell>
                      <TableCell className='pl-10'>
                        <Button onClick={() => stopProcess(row)} >
                          X
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className='h-24 text-center'
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {/* Pagination */}
          <div className='flex items-center justify-end space-x-2 py-4'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </>
      </div>
    </section>
  )
}

export default Processes;
