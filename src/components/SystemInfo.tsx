import { FC, useState, useEffect, useCallback } from 'react'
import { Drive, SystemInfo as SystemInfoInterface } from '@/interfaces'
import { invoke } from "@tauri-apps/api/tauri"

import {
  ColumnDef,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

const SystemInfo: FC = () => {
  const [systemInfo, setSystemInfo] = useState<SystemInfoInterface>({} as SystemInfo);

  const getTotalDriveSpace = useCallback((drive: Drive) => {
    return (drive["Free (GB)"] + drive["Used (GB)"]).toFixed(2)
  }, []);

  const getAvailablePercentage = useCallback((drive: Drive) => {
    const result = ((drive["Free (GB)"] / getTotalDriveSpace(drive)) * 100).toFixed(2);
    return result;
  }, []);

  const getDrivePercentageColor = useCallback((drive: Drive) => {
    const availablePercentage = getAvailablePercentage(drive);
    return Math.floor(parseFloat(availablePercentage)) > 10 ? "#3377ff": "#ff6633";
  }, []);

  useEffect(() => {
    invoke<string>("get_system_info_data")
      .then((systemInfo) => setSystemInfo(systemInfo))
      .catch((err) => console.error(err));
  }, []);

  return (
    <section className="pt-10 pb-16">
      <div className="container">
        <h1 className="mb-6 text-3xl font-bold">System Info</h1>
        {systemInfo.general_info &&
          <div className='rounded-md border md:w-7/10 lg:w-3/5'>
            <Table>
              <TableBody>
                {Object.entries(systemInfo.general_info).map(([k, v], index) => (
                  <TableRow key={index} >
                    <TableCell className='w-1/2'>
                      {k}
                    </TableCell>
                    <TableCell className='w-1/2'>
                      {v}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        }
      </div>
      <div className="container">
        <h1 className="mt-12 mb-6 text-3xl font-bold">Drives</h1>
        {systemInfo.drives && (
          <div className='rounded-md border md:w-7/10 lg:w-3/5'>
            <Table>
              <TableBody>
                {systemInfo.drives.map((drive, index) => (
                  <TableRow key={index}>
                    <TableCell className=''>
                      {drive.Drive}
                    </TableCell>
                    <TableCell className=''>
                      <div className="flex">
                        <div className='w-40 md:w-48'>{`${drive['Free (GB)']} / ${getTotalDriveSpace(drive)} GB available`}</div>
                        <div className="flex ml-6" style={{ color: getDrivePercentageColor(drive) }}>
                          { getAvailablePercentage(drive) }%
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </section>
  )
}

export default SystemInfo;
