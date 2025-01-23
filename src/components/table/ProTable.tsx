import React, { useRef, useMemo } from "react";
import { createProTable } from "@/components/table/NoSSRProTable";
import type {
  ActionType,
  ParamsType,
  ProColumns,
  ProTableProps,
} from "@ant-design/pro-components";

interface ITableProps<T> extends ProTableProps<T, ParamsType> {
  toolbar?: {
    title?: string;
    actions?: React.ReactNode[];
  };
  loading?: boolean;
  columns: ProColumns<T>[];
  refetch?: () => void;
  data?: { total: number; result: T[] };
  handleSave: (key: React.Key | React.Key[], record: T) => Promise<void>;
  handleDelete: (key: React.Key | React.Key[], record: T) => Promise<void>;
  queryParams: {
    page: number;
    pageSize: number;
  };
  setQueryParams: React.Dispatch<
    React.SetStateAction<{ page: number; pageSize: number }>
  >;
}

const ProTable = <T extends object>({
  toolbar,
  columns,
  refetch,
  data,
  handleSave,
  queryParams,
  setQueryParams,
  handleDelete,
  rowKey,
  ...props
}: ITableProps<T>) => {
  const actionRef = useRef<ActionType>();

  const ProTable = useMemo(() => createProTable<T>(), []);

  return (
    <ProTable
      actionRef={actionRef}
      className="h-full w-full"
      columns={columns}
      rowKey={rowKey}
      request={async (params, sort) => {
        const convertSort = (sort: Record<string, string | null>) => {
          const newSort: Record<string, "asc" | "desc"> = {};
          Object.entries(sort).forEach(([key, value]) => {
            if (value === "ascend") {
              newSort[key] = "asc";
            } else if (value === "descend") {
              newSort[key] = "desc";
            }
          });
          return newSort;
        };

        const transformedSort = Object.keys(sort).length
          ? convertSort(sort)
          : undefined;
        setQueryParams(() => ({
          ...params,
          page: params.current ?? 1,
          pageSize: params.pageSize ?? 10,
          sort: transformedSort,
        }));
        return [];
      }}
      pagination={{
        showQuickJumper: true,
        current: queryParams.page,
        pageSize: queryParams.pageSize,
        total: data?.total,
        onChange: (page, pageSize) => {
          setQueryParams((prev) => ({
            ...prev,
            page: page,
            pageSize: pageSize,
          }));
        },
      }}
      dataSource={data?.result ?? []}
      editable={{
        type: "multiple",
        onSave: handleSave,
        onDelete: handleDelete,
      }}
      options={{
        reload: () => {
          if (refetch) {
            refetch();
          }
        },
      }}
      toolbar={toolbar}
      {...props}
    />
  );
};

export default ProTable;
