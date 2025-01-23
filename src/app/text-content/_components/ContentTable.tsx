"use client";
import type { ColumnsState } from "@ant-design/pro-components";
import { api } from "@/trpc/react";
import { useState } from "react";
import type { ProColumns } from "@ant-design/pro-components";
import { type inferRouterOutputs } from "@trpc/server";
import { type AppRouter } from "@/server/api/root";
import { useSearchParams } from "next/navigation";
import { Button } from "antd";
import {
  PlusOutlined,
  ExportOutlined,
  FileDoneOutlined,
  EditOutlined,
} from "@ant-design/icons";
import {
  headerMapping,
  headerOrder,
  options,
  translationColumns,
} from "./columns";
import ProTable from "@/components/table/ProTable";
import AddContentModal from "./AddContentModal";
import { useMessageApi } from "@/hooks/useMessageApi";
import { exportToExcel } from "@/utils/table";

export type TtextContent =
  inferRouterOutputs<AppRouter>["textContent"]["gettextContentByConfigId"][number];

const ContentTable: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { openMessage, contextHolder } = useMessageApi();

  const [columnsStateMap, setColumnsStateMap] = useState<
    Record<string, ColumnsState>
  >({
    ...{
      textId: { fixed: "left" as const },
      paramCount: { fixed: "left" as const },
      contentCn: { fixed: "left" as const },
      option: { fixed: "right" as const },
    },
    ...options,
  });
  const searchParams = useSearchParams();
  const configId = parseInt(searchParams.get("configId") ?? "") || 0;
  const [queryParams, setQueryParams] = useState({
    page: 1,
    pageSize: 10,
  });

  const updateMutation = api.textContent.update.useMutation({
    onSuccess: async () => {
      await refetch();
      openMessage({
        type: "success",
        content: "更新成功",
      });
    },
    onError: () => {
      openMessage({
        type: "error",
        content: "更新失败",
      });
    },
  });

  const deleteMutation = api.textContent.delete.useMutation({
    onSuccess: () => {
      void refetch();
      openMessage({
        type: "success",
        content: "删除成功",
      });
    },
    onError: () => {
      openMessage({
        type: "error",
        content: "删除失败",
      });
    },
  });

  const handleDelete = async (
    key: React.Key | React.Key[],
    record: TtextContent,
  ) => {
    try {
      await deleteMutation.mutateAsync({
        id: record.id,
      });
    } catch (error) {
      console.error("删除失败:", error);
    }
  };

  const handleSave = async (
    key: React.Key | React.Key[],
    record: TtextContent,
  ) => {
    try {
      const sanitizedRecord = Object.fromEntries(
        Object.entries(record).map(([key, value]) => [key, value ?? ""]),
      );
      await updateMutation.mutateAsync({
        ...sanitizedRecord,
        id: record.id,
      });
    } catch (error) {
      console.error("更新失败:", error);
    }
  };

  const { data, isLoading, refetch } = api.textContent.getData.useQuery({
    configId,
    ...queryParams,
  });
  const { mutateAsync: getTextContent } =
    api.textContent.gettextContentByConfigId.useMutation({});
  const handleBatchAdd = () => {
    openMessage({
      type: "info",
      content: "开发中",
    });
  };

  const handleAdd = () => {
    setIsModalVisible(true);
  };
  const handleExport = async () => {
    const data = await getTextContent({ configId });
    exportToExcel(data, `文本配置表单表.xlsx`, headerOrder, headerMapping);
  };

  const toolbar = {
    actions: [
      <Button
        key="primary"
        type="text"
        icon={<FileDoneOutlined />}
        onClick={handleBatchAdd}
      >
        专业模式
      </Button>,
      <Button
        key="primary"
        type="primary"
        icon={<FileDoneOutlined />}
        onClick={handleBatchAdd}
      >
        批量添加
      </Button>,
      <Button
        key="primary"
        type="primary"
        icon={<PlusOutlined />}
        onClick={handleAdd}
      >
        添加
      </Button>,
      <Button
        key="primary"
        type="primary"
        icon={<ExportOutlined />}
        onClick={handleExport}
      >
        导出
      </Button>,
    ],
  };

  const columns: ProColumns<TtextContent>[] = [
    {
      title: "索引 ID",
      dataIndex: "textId",
      valueType: "digit",
      sorter: true,
      editable: false,
      fixed: "left",
    },
    {
      title: "参数数量",
      dataIndex: "paramCount",
      fixed: "left",
      valueType: "digit",
    },
    {
      title: "内容_简体",
      dataIndex: "contentCn",
      fixed: "left",
      ellipsis: true,
    },
    {
      title: "备注",
      dataIndex: "remark",
      ellipsis: true,
    },
    ...translationColumns,
    {
      title: "操作",
      valueType: "option",
      key: "option",
      fixed: "right",
      render: (text, record, _, action) => [
        <Button
          key="editable"
          type="link"
          icon={<EditOutlined />}
          onClick={() => {
            action?.startEditable?.(record.id);
          }}
        >
          编辑内容
        </Button>,
      ],
    },
  ];

  return (
    <>
      {contextHolder}
      <ProTable<TtextContent>
        rowKey="id"
        setQueryParams={setQueryParams}
        queryParams={queryParams}
        data={data}
        columnsState={{
          value: columnsStateMap,
          onChange: setColumnsStateMap,
        }}
        toolbar={toolbar}
        columns={columns}
        loading={isLoading}
        handleSave={handleSave}
        handleDelete={handleDelete}
        refetch={refetch}
      />
      <AddContentModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        messageApi={{ open: openMessage }}
        refetch={refetch}
      />
    </>
  );
};

export default ContentTable;
