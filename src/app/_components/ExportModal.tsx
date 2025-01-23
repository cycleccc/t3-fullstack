import React, { useState } from "react";
import { Modal, Form, Select } from "antd";
import { useCategoryEnums } from "../hooks/useCategoryEnums";
import { api } from "@/trpc/react";
import { exportToExcelWithSheets } from "@/utils/table";
import {
  headerMapping,
  headerOrder,
} from "@/app/text-content/_components/columns";

const ExportModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  messageApi: { open: (config: { type: string; content: string }) => void };
}> = ({ visible, onClose, messageApi }) => {
  const [form] = Form.useForm<{ category1: string }>();
  const { categoryLoading, category1List } = useCategoryEnums();
  const [loading, setLoading] = useState(false);

  const { mutateAsync: getExportData } =
    api.textConfig.getExportData.useMutation();

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      setLoading(true);

      const exportData = await getExportData({ category1: values.category1 });

      exportToExcelWithSheets(
        exportData,
        `文本配置表单表.xlsx`,
        headerOrder,
        headerMapping,
      );

      messageApi.open({
        type: "success",
        content: "导出成功",
      });

      onClose();
      form.resetFields();
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onClose();
    form.resetFields();
  };

  return (
    <Modal
      title="选择一级目录导出"
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="category1"
          label="一级目录"
          rules={[{ required: true, message: "请选择一级目录" }]}
        >
          <Select
            loading={categoryLoading}
            options={category1List?.map((item) => ({
              value: item.name,
              label: item.name,
            }))}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ExportModal;
