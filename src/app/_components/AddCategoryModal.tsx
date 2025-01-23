import React from "react";
import { Modal, Form, Input } from "antd";
import { api } from "@/trpc/react";
import { useCategoryEnums } from "../hooks/useCategoryEnums";

const AddCategoryModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  onAdd?: () => void;
  messageApi: { open: (config: { type: string; content: string }) => void };
}> = ({ visible, onClose, messageApi }) => {
  const [form] = Form.useForm();
  const { refetchCategory1List } = useCategoryEnums();
  const addCategoryMutation = api.category1.addCategory1.useMutation({
    onSuccess: async () => {
      messageApi.open({
        type: "success",
        content: "添加一级目录成功",
      });
    },
    onError: () => {
      messageApi.open({
        type: "error",
        content: "添加一级目录失败",
      });
    },
  });

  const handleOk = async () => {
    await form.validateFields().then(async (values: { name: string }) => {
      await addCategoryMutation.mutateAsync(values);
      onClose();
      form.resetFields();
      await refetchCategory1List();
    });
  };

  return (
    <Modal
      title="添加新一级目录"
      open={visible}
      onOk={handleOk}
      onCancel={onClose}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="一级目录名称"
          rules={[{ required: true, message: "请输入一级目录名称" }]}
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddCategoryModal;
