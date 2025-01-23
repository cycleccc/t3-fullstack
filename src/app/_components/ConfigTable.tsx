"use client";

import React, { useState } from "react";
import { api } from "@/trpc/react";
import { Button } from "antd";
import { PlusOutlined, ExportOutlined } from "@ant-design/icons";
import { type inferRouterOutputs } from "@trpc/server";
import { type AppRouter } from "@/server/api/root";
import { useAtom } from "jotai";
import { svnBranchAtom } from "@/atoms/projectAtoms";
import { useColumns } from "../hooks/useColumns";
import ProTable from "@/components/table/ProTable";
import AddConfigModal from "./AddConfigModal";
import AddCategoryModal from "./AddCategoryModal";
import ExportModal from "./ExportModal";
import { useMessageApi } from "@/hooks/useMessageApi";
import { useModalState } from "../hooks/useModalState";

type GetTextConfigBySvnBranchIdOutput =
  inferRouterOutputs<AppRouter>["textConfig"]["getTextConfigBySvnBranchId"];

export type TtextConfig = GetTextConfigBySvnBranchIdOutput[number];

const ConfigTable: React.FC = () => {
  const {
    isAddConfigModalVisible,
    isAddCategoryModalVisible,
    isExportModalVisible,
    toggleModal,
  } = useModalState();

  const { openMessage, contextHolder } = useMessageApi();

  const [svnBranchId] = useAtom(svnBranchAtom);
  const columns = useColumns();
  const [queryParams, setQueryParams] = useState({
    page: 1,
    pageSize: 10,
  });

  const updateMutation = api.textConfig.update.useMutation({
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

  const deleteMutation = api.textConfig.delete.useMutation({
    onSuccess: async () => {
      await refetch();
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

  const handleAdd = () => {
    if (!svnBranchId || svnBranchId === "ALL") {
      openMessage({
        type: "error",
        content: "请先选择 SVN 线",
      });
      return;
    }
    toggleModal("isAddConfigModalVisible", true);
  };

  const handleSave = async (
    key: React.Key | React.Key[],
    record: TtextConfig,
  ) => {
    try {
      await updateMutation.mutateAsync({
        id: record.id,
        category2: record.category2,
      });
    } catch (error) {
      console.error("更新失败:", error);
    }
  };

  const handleDelete = async (
    key: React.Key | React.Key[],
    record: TtextConfig,
  ) => {
    try {
      await deleteMutation.mutateAsync({
        id: record.id,
      });
    } catch (error) {
      console.error("删除失败:", error);
    }
  };

  const { data, isLoading, refetch } = api.textConfig.getData.useQuery(
    {
      svnBranchId,
      ...queryParams,
    },
    {
      enabled: !!svnBranchId,
    },
  );

  const toolbar = {
    actions: [
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
        onClick={() => toggleModal("isExportModalVisible", true)}
      >
        导出
      </Button>,
    ],
  };

  return (
    <>
      {contextHolder}
      <ProTable<TtextConfig>
        setQueryParams={setQueryParams}
        queryParams={queryParams}
        rowKey="id"
        toolbar={toolbar}
        columns={columns}
        data={data}
        loading={isLoading}
        handleSave={handleSave}
        handleDelete={handleDelete}
        refetch={refetch}
      />
      <AddConfigModal
        visible={isAddConfigModalVisible}
        onClose={() => toggleModal("isAddConfigModalVisible", false)}
        messageApi={{ open: openMessage }}
        refetch={refetch}
        showAddCategoryModal={() =>
          toggleModal("isAddCategoryModalVisible", true)
        }
      />
      <AddCategoryModal
        visible={isAddCategoryModalVisible}
        onClose={() => toggleModal("isAddCategoryModalVisible", false)}
        messageApi={{ open: openMessage }}
      />
      <ExportModal
        visible={isExportModalVisible}
        onClose={() => toggleModal("isExportModalVisible", false)}
        messageApi={{ open: openMessage }}
      />
    </>
  );
};

export default ConfigTable;
