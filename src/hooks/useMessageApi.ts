import { message } from "antd";

export const useMessageApi = () => {
  const [api, contextHolder] = message.useMessage();

  const openMessage = (config: { type: string; content: string }) => {
    api.open({
      ...config,
      type: config.type as
        | "success"
        | "error"
        | "info"
        | "warning"
        | "loading",
    });
  };

  return { openMessage, contextHolder };
};
