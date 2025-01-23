import {
  SettingOutlined,
  LogoutOutlined,
  UserOutlined,
  BranchesOutlined,
} from "@ant-design/icons";
import { Dropdown, Avatar, message } from "antd";
import React from "react";
import { useRouter } from "next/navigation";
import type { MenuProps } from "antd";
import Cookies from "js-cookie";
import "./Settings.css";

const Settings: React.FC = () => {
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();

  // 从 Cookies 中获取用户信息
  const username = Cookies.get("user_real_name") ?? "未知用户";
  const avatar = Cookies.get("user_avatar") ?? "";

  const handleMenuClick: MenuProps["onClick"] = ({ key }: { key: string }) => {
    if (key === "svnBranch") {
      router.push("/svn-branch");
    } else if (key === "logout") {
      // 删除 cookie 信息
      Cookies.remove("auth_token");
      Cookies.remove("user_real_name");
      Cookies.remove("user_avatar");
      messageApi.open({
        type: "success",
        content: "退出登录成功",
      });
      setTimeout(() => {
        router.push("/");
      }, 500);
    }
  };

  const items: MenuProps["items"] = [
    {
      key: "userInfo",
      label: (
        <div style={{ display: "flex", alignItems: "center" }}>
          <Avatar
            src={avatar}
            icon={!avatar && <UserOutlined />}
            style={{ backgroundColor: avatar ? "transparent" : undefined }}
          />
          <span style={{ marginLeft: 8 }}>{username}</span>
        </div>
      ),
    },
    { key: "svnBranch", label: "SVN线管理", icon: <BranchesOutlined /> },
    {
      key: "divider",
      label: (
        <div
          style={{ height: 1, backgroundColor: "#f0f0f0", margin: "4px 0" }}
        />
      ),
      disabled: true,
    },
    { key: "logout", label: "退出登录", icon: <LogoutOutlined /> },
  ];

  return (
    <>
      {contextHolder}
      <Dropdown
        menu={{ items, onClick: handleMenuClick }}
        trigger={["click"]}
        overlayClassName="custom-dropdown-menu" // 应用自定义的 CSS 类
      >
        <SettingOutlined style={{ fontSize: "16px" }} />
      </Dropdown>
    </>
  );
};

export default Settings;
