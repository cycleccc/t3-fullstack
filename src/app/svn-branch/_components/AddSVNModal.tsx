import React from "react";
import { Modal, Form, Input } from "antd";
import { api } from "@/trpc/react";
import Cookies from "js-cookie";
import { projectAtom } from "@/atoms/projectAtoms";
import { useAtom } from "jotai";

const AddCategoryModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  onAdd?: () => void;
  messageApi: { open: (config: { type: string; content: string }) => void };
  refetch: () => void;
}> = ({ visible, onClose, messageApi, refetch }) => {
  const [form] = Form.useForm();
  const [projectId] = useAtom(projectAtom);

  const createMutation = api.svnBranch.create.useMutation({
    onSuccess: async () => {
      refetch();
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

  const handleOk = async () => {
    await form
      .validateFields()
      .then(async (values: { name: string; remark: string }) => {
        const createdBy = Cookies.get("user_real_name") ?? "未知用户";
        const newItem = {
          name: values.name,
          remark: values.remark,
          projectId,
          createdBy,
          createdAt: new Date(),
        };
        await createMutation.mutateAsync(newItem);
        onClose();
        form.resetFields();
      });
  };

  const handleCancel = () => {
    onClose();
    form.resetFields();
  };

  return (
    <Modal
      title="添加新项"
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="SVN 线名称"
          rules={[{ required: true, message: "请输入SVN 线名称" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="remark" label="备注">
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddCategoryModal;
