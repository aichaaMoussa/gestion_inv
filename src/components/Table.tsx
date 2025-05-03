import React from "react";
import { useTable, usePagination } from "react-table";
import { ChevronLeft, ChevronRight } from "lucide-react"; // Icônes pour pagination

interface TableProps {
  columns: any[];
  data: any[];
}

const Table: React.FC<TableProps> = ({ columns, data }) => {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
    gotoPage,
    pageOptions,
    setPageSize,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: 0, pageSize: 5 },
    },
    usePagination
  );

  return (
    <div className="p-4 bg-white rounded-md ">
      {/* Tableau */}
      <table {...getTableProps()} className="w-full border-collapse">
        <thead className="bg-sky-50 border-b-2 border-gray-400">
          {headerGroups.map((headerGroup, headerGroupIndex) => (
            <tr key={`header-group-${headerGroupIndex}`} {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column, columnIndex) => (
                <th
                  key={`header-${columnIndex}`}
                  {...column.getHeaderProps()}
                  className="px-4 py-3 text-left text-sm font-semibold text-gray-700"
                >
                  {column.render("Header")}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {page.map((row, rowIndex) => {
            prepareRow(row);
            return (
              <tr
                key={`row-${rowIndex}`}
                {...row.getRowProps()}
                className="border-b border-gray-300 hover:bg-gray-50"
              >
                {row.cells.map((cell, cellIndex) => (
                  <td
                    key={`cell-${rowIndex}-${cellIndex}`}
                    {...cell.getCellProps()}
                    className="px-4 py-3 text-sm text-gray-600"
                  >
                    {cell.render("Cell")}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        {/* Sélecteur du nombre d'éléments */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Show rows:</span>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="p-1 text-sm border rounded"
          >
            {[5, 10, 15, 20].map((size) => (
              <option key={`size-${size}`} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        {/* Numérotation */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => previousPage()}
            disabled={!canPreviousPage}
            className="p-2 text-gray-600 rounded hover:bg-gray-100 disabled:text-gray-300"
          >
            <ChevronLeft size={20} />
          </button>

          {pageOptions.map((page, index) => (
            <button
              key={`page-${index}`}
              onClick={() => gotoPage(page)}
              className={`px-3 py-1 text-sm rounded ${
                pageIndex === page
                  ? "bg-blue-500 text-white"
                  : "text-gray-700 hover:bg-gray-200"
              }`}
            >
              {page + 1}
            </button>
          ))}

          <button
            onClick={() => nextPage()}
            disabled={!canNextPage}
            className="p-2 text-gray-600 rounded hover:bg-gray-100 disabled:text-gray-300"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Table;
