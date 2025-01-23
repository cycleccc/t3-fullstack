import { type ProColumns } from "@ant-design/pro-components";
import { Button } from "antd";
import { EditOutlined, EyeOutlined } from "@ant-design/icons";
import { type TtextConfig } from "../_components/ConfigTable";
import { useRouter } from "next/navigation";
import { useCategoryEnums } from "./useCategoryEnums";

export function useColumns(): ProColumns<TtextConfig>[] {
  const router = useRouter();
  const { category1TypesEnum, creatorTypesEnum } = useCategoryEnums();

  return [
    {
      title: "一级目录",
      dataIndex: "category1",
      disable: true,
      filters: true,
      onFilter: true,
      editable: false,
      fixed: "left",
      valueEnum: category1TypesEnum,
    },
    {
      title: "二级目录",
      dataIndex: "category2",
      fixed: "left",
    },
    {
      title: "起始 ID",
      dataIndex: "startId",
      fixed: "left",
      editable: false,
      valueType: "digit",
    },
    {
      title: "终止 ID",
      dataIndex: "endId",
      fixed: "left",
      editable: false,
      valueType: "digit",
    },
    {
      title: "创建人",
      dataIndex: "createdBy",
      disable: true,
      filters: true,
      onFilter: true,
      editable: false,
      ellipsis: true,
      valueType: "select",
      valueEnum: creatorTypesEnum,
    },
    {
      title: "创建时间",
      dataIndex: "updatedAt",
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
          编辑配置
        </Button>,
        <Button
          key="view"
          type="link"
          icon={<EyeOutlined />}
          onClick={() => {
            router.push(`/text-content?configId=${record.id}`);
          }}
        >
          查看内容表
        </Button>,
      ],
    },
  ];
}
