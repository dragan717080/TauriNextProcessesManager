'use client'

import { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal, ArrowUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
  } from '@/components/ui/dropdown-menu'
import { Process } from '@/interfaces'

export interface Process {
  CPU: string;
  total_CPU_time: string;
  memory: string;
  process_group: string;
  cpu_percentage: string;
}

const columns: ColumnDef<Process>[] = (totalCpuUsage, totalMemoryUsage) => [
  {
    accessorKey: 'Process Group',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Name
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      )
    }
  },
  {
    accessorKey: 'Total CPU Time',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          { `CPU ${totalCpuUsage}` }
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      )
    }
  },
  {
    accessorKey: 'Total WS',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          { `Memory ${totalMemoryUsage}` }
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      )
    }
  },
  {
    accessorKey: 'Stop Process',
    header: ({ column }) => {
      return (
        <div className=''>Stop Process</div>
      )
    }
  },
]

export default columns;
