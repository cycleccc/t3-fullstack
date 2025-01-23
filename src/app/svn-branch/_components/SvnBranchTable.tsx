import { api } from "@/trpc/react"; // tRPC hooks
import { useState, useEffect } from "react";
import type { ProColumns } from "@ant-design/pro-components";
import { type inferRouterOutputs } from "@trpc/server";
import { type AppRouter } from "@/server/api/root";
import { Button } from "antd";
import { useAtom } from "jotai";
import { projectAtom, svnBranchAtom } from "@/atoms/projectAtoms";
import { useRouter } from "next/navigation";
import ProTable from "@/components/table/ProTable";
import { EditOutlined, EyeOutlined } from "@ant-design/icons";
import AddSVNModal from "./AddSVNModal";
import { useMessageApi } from "@/hooks/useMessageApi";

type GettextContentBySvnBranchIdOutput =
  inferRouterOutputs<AppRouter>["svnBranch"]["getSvnBranchesByProjectId"];

type TsvnBranch = GettextContentBySvnBranchIdOutput[number];

const SvnTable: React.FC = () => {
  const { openMessage, contextHolder } = useMessageApi();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [, setSvnBranch] = useAtom(svnBranchAtom);
  const [projectId] = useAtom(projectAtom);
  const router = useRouter();

  const [queryParams, setQueryParams] = useState({
    page: 1,
    pageSize: 10,
  });

  const [creatorTypesEnum, setCreatorTypesEnum] = useState<
    Record<string, { text: string }>
  >({});

  const { data: creatorTypes } = api.svnBranch.getCreatorTypes.useQuery({
    projectId,
  });
  useEffect(() => {
    setSvnBranch("ALL");
  }, [projectId, setSvnBranch]);
  useEffect(() => {
    if (creatorTypes) {
      const types = creatorTypes.reduce(
        (acc: Record<string, { text: string }>, type) => {
          acc[type.createdBy] = {
            text: type.createdBy,
          };
          return acc;
        },
        {},
      );
      setCreatorTypesEnum(types);
    }
  }, [creatorTypes]);
  const updateMutation = api.svnBranch.update.useMutation({
    onSuccess: async () => {
      await refetch();
      openMessage({
        type: "success",
        content: "更新成功",
      });
    },
  });

  const deleteMutation = api.svnBranch.delete.useMutation({
    onSuccess: () => {
      // 重新获取数据
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
    record: TsvnBranch,
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
    record: TsvnBranch,
  ) => {
    try {
      await updateMutation.mutateAsync({
        id: record.id,
        remark: record.remark ?? undefined,
        name: record.name,
      });
    } catch (error) {
      console.error("保存失败:", error);
    }
  };

  const { data, isLoading, refetch } = api.svnBranch.getData.useQuery({
    projectId,
    ...queryParams,
  });

  const columns: ProColumns<TsvnBranch>[] = [
    {
      title: "SVN 线",
      dataIndex: "name",
    },
    {
      title: "备注",
      dataIndex: "remark",
    },
    {
      title: "创建人",
      dataIndex: "createdBy",
      filters: true,
      editable: false,
      valueEnum: creatorTypesEnum,
    },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      sorter: true,
      editable: false,
      valueType: "date",
    },
    {
      title: "操作",
      valueType: "option",
      key: "option",
      render: (text, record, _, action) => [
        <Button
          key="editable"
          type="link"
          icon={<EditOutlined />}
          onClick={() => {
            action?.startEditable?.(record.id);
          }}
        >
          编辑
        </Button>,
        <Button
          key="view"
          type="link"
          icon={<EyeOutlined />}
          onClick={() => {
            setSvnBranch(record.id);
            router.push(`/`);
          }}
        >
          查看配置表
        </Button>,
      ],
    },
  ];

  const handleAdd = () => {
    setIsModalVisible(true);
  };

  const toolbar = {
    actions: [
      <Button key="primary" type="primary" onClick={handleAdd}>
        添加
      </Button>,
    ],
  };

  return (
    <>
      {contextHolder}
      <ProTable<TsvnBranch>
        setQueryParams={setQueryParams}
        queryParams={queryParams}
        toolbar={toolbar}
        columns={columns}
        rowKey="id"
        data={data}
        loading={isLoading}
        handleDelete={handleDelete}
        handleSave={handleSave}
        refetch={refetch}
      />

      <AddSVNModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        messageApi={{ open: openMessage }}
        refetch={refetch}
      />
    </>
  );
};

export default SvnTable;
