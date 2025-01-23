"use client";

import React from "react";
import { Layout, theme } from "antd";

const { Footer } = Layout;

type Props = {
  children?: React.ReactNode;
};
const SideBar: React.FC<Props> = ({}) => {
  //   const [collapsed, setCollapsed] = useState(false);
  const {
    // token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return <Footer style={{ textAlign: "center" }}></Footer>;
};

export default SideBar;
