"use client";

import React, { useState, useEffect } from "react";
import { Layout, Menu, message } from "antd";
import { useRouter, usePathname } from "next/navigation";
import { useAtom } from "jotai";
import { sidebarVisibleAtom, toggleSidebarAtom } from "@/atoms/layoutAtoms";
import { TableOutlined } from "@ant-design/icons";
import { projectAtom } from "@/atoms/projectAtoms";
const { Sider } = Layout;

const SideBar: React.FC = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [projectId] = useAtom(projectAtom);
  const [sidebarVisible, toggleSidebar] = [
    useAtom(sidebarVisibleAtom)[0],
    useAtom(toggleSidebarAtom)[1],
  ];
  const router = useRouter();
  const pathName = usePathname();
  const [selectedKey, setSelectedKey] = useState<string>("");
  const [menuItems, setMenuItems] = useState([
    {
      key: "text-config",
      label: "文本规则配置",
      icon: <TableOutlined />,
    },
  ]);

  useEffect(() => {
    if (pathName.includes("svn-branch")) {
      setSelectedKey("svn-branch");
      setMenuItems(() => []);
    } else {
      setSelectedKey("text-config");
      setMenuItems([
        {
          key: "text-config",
          label: "文本规则配置",
          icon: <TableOutlined />,
        },
      ]);
    }
  }, [pathName]);

  const handleMenuClick = (e: { key: string }) => {
    if (!projectId) {
      messageApi.error("请先选择项目");
      return;
    }
    if (e.key === "svn-branch") {
      router.push("/svn-branch");
    } else if (e.key === "text-content") {
      router.push("/text-content");
    } else if (e.key === "text-config") {
      router.push("/");
    }
  };

  return (
    <Sider collapsible collapsed={sidebarVisible} onCollapse={toggleSidebar}>
      {contextHolder}
      <Menu
        theme="dark"
        selectedKeys={[selectedKey]}
        mode="inline"
        items={menuItems}
        onClick={handleMenuClick}
      />
    </Sider>
  );
};

export default SideBar;
