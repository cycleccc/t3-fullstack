import React, { useState } from "react";
import { Modal, Form, Input, InputNumber, Select, Space, Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useAtom } from "jotai";
import { svnBranchAtom } from "@/atoms/projectAtoms";
import Cookies from "js-cookie";
import { api } from "@/trpc/react";
import { useCategoryEnums } from "../hooks/useCategoryEnums";

const { Option } = Select;

const AddConfigModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  messageApi: { open: (config: { type: string; content: string }) => void };
  refetch: () => void;
  showAddCategoryModal: () => void;
}> = ({ visible, onClose, messageApi, refetch, showAddCategoryModal }) => {
  const [form] = Form.useForm<{
    category1: string;
    category2: string;
    startId: number;
    endId: number;
    createdBy: string;
  }>();
  const [svnBranchId] = useAtom(svnBranchAtom);
  const { category1List } = useCategoryEnums();
  const [category1, setCategory1] = useState<string>("");
  const { data: idRanges } = api.textConfig.getIdRanges.useQuery(
    {
      category1,
    },
    {
      enabled: !!category1,
    },
  );

  const onGenderChange = (value: string) => {
    form.setFieldsValue({ category1: value });
    setCategory1(value);
  };

  const createMutation = api.textConfig.create.useMutation({
    onSuccess: async () => {
      if (refetch) {
        refetch();
      }
      messageApi.open({
        type: "success",
        content: "添加成功",
      });
    },
    onError: () => {
      messageApi.open({
        type: "error",
        content: "添加失败",
      });
    },
  });

  // TODO: 如果区间规模到了几千个可以考虑用二分查找，显然这里用不上
  const findConflict = (startId: number, endId: number) => {
    if (idRanges === undefined) return false;
    const hasConflict = idRanges.some(
      (dir) => !(endId < dir.startId || startId > dir.endId), // 区间重叠条件
    );
    if (hasConflict) return true;
  };

  const handleOk = async () => {
    if (svnBranchId === "ALL" || typeof svnBranchId !== "number") {
      messageApi.open({
        type: "error",
        content: "请先选择项目",
      });
      return;
    }
    const values = await form.validateFields();
    const createdBy = Cookies.get("user_real_name") ?? "未知用户";
    if (values.startId > values.endId) {
      messageApi.open({
        type: "error",
        content: "起始 ID 不能大于终止 ID",
      });
      return;
    }
    if (findConflict(values.startId, values.endId)) {
      messageApi.open({
        type: "error",
        content: "ID 范围重叠,请重新输入",
      });
      return;
    }
    const newItem = {
      svnBranchId,
      category1: values.category1,
      category2: values.category2,
      startId: values.startId,
      endId: values.endId,
      createdBy,
    };
    await createMutation.mutateAsync(newItem);
    form.resetFields();
    onClose();
  };

  return (
    <Modal title="添加新配置" open={visible} onOk={handleOk} onCancel={onClose}>
      <Form form={form} layout="vertical">
        <Form.Item
          name="category1"
          label="一级目录"
          rules={[{ required: true, message: "请输入一级目录" }]}
        >
          <Space.Compact>
            <Select
              placeholder="选择一级目录"
              allowClear
              onChange={onGenderChange}
            >
              {category1List?.map((item) => {
                return (
                  <Option value={item.name} key={item.id}>
                    {item.name}
                  </Option>
                );
              })}
            </Select>
            <Button icon={<PlusOutlined />} onClick={showAddCategoryModal} />
          </Space.Compact>
        </Form.Item>
        <Form.Item
          name="category2"
          label="二级目录"
          rules={[{ required: true, message: "请输入二级目录" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="startId"
          label="起始 ID"
          rules={[{ required: true, message: "请输入起始 ID" }]}
        >
          <InputNumber min={1} />
        </Form.Item>
        <Form.Item
          name="endId"
          label="终止 ID"
          rules={[{ required: true, message: "请输入终止 ID" }]}
        >
          <InputNumber min={1} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddConfigModal;
