import React from "react";
import { useTable, usePagination } from "react-table";

const Table = ({ columns, data }) => {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    page, // Les lignes pour la page actuelle
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
    pageOptions,
    state: { pageIndex },
  } = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: 0, pageSize: 5 }, // Nombre de lignes par page
    },
    usePagination // Plugin pour la pagination
  );

  return (
    <div className="p-4 bg-white shadow rounded-md">
      {/* Tableau */}
      <table
        {...getTableProps()}
        className="w-full border-collapse border border-gray-200"
      >
        <thead className="bg-gray-100">
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th
                  {...column.getHeaderProps()}
                  className="border border-gray-200 px-4 py-2 text-left text-sm font-semibold text-gray-700"
                >
                  {column.render("Header")}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {page.map((row, i) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()} className="hover:bg-gray-50">
                {row.cells.map((cell) => (
                  <td
                    {...cell.getCellProps()}
                    className="border border-gray-200 px-4 py-2 text-sm text-gray-600"
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
        <button
          onClick={() => previousPage()}
          disabled={!canPreviousPage}
          className="px-3 py-1 text-sm bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          Précédent
        </button>
        <span className="text-sm">
          Page <strong>{pageIndex + 1}</strong> sur {pageOptions.length}
        </span>
        <button
          onClick={() => nextPage()}
          disabled={!canNextPage}
          className="px-3 py-1 text-sm bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          Suivant
        </button>
      </div>
    </div>
  );
};

export default Table;
