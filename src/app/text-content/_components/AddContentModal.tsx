import React from "react";
import { Modal, Form, Input } from "antd";
import { api } from "@/trpc/react";
import { useSearchParams } from "next/navigation";

const AddCategoryModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  onAdd?: () => void;
  messageApi: { open: (config: { type: string; content: string }) => void };
  refetch: () => void;
}> = ({ visible, onClose, messageApi, refetch }) => {
  const [form] = Form.useForm();
  const searchParams = useSearchParams();
  const configId = parseInt(searchParams.get("configId") ?? "") || 0;

  const createMutation = api.textContent.createWithUniqueTextId.useMutation({
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
      .then(
        async (values: {
          paramCount: string;
          contentCn: string;
          remark?: string;
        }) => {
          const newItem = {
            configId,
            paramCount: parseInt(values.paramCount) ?? 0,
            contentCn: values.contentCn,
            remark: values.remark,
          };
          await createMutation.mutateAsync(newItem);
          onClose();
          form.resetFields();
        },
      );
  };

  const handleCancel = () => {
    onClose();
    form.resetFields();
  };

  return (
    <Modal
      title="添加新文本"
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="paramCount"
          label="参数数量"
          rules={[{ required: true, message: "请输入参数数量" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="contentCn"
          label="内容_简体"
          rules={[{ required: true, message: "请输入内容_简体" }]}
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
