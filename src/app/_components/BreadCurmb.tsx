"use client";

import React from "react";
import { HomeOutlined, UserOutlined } from "@ant-design/icons";
import { Breadcrumb } from "antd";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

const MyBreadcurmb: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const pathSnippets = pathname.split("/").filter((i) => i);
  const queryString = searchParams.toString();
  const breadcrumbItems = [
    {
      href: "/",
      title: <HomeOutlined onClick={() => router.push("/")} />,
    },
    ...pathSnippets.map((_, index) => {
      const url = `/${pathSnippets.slice(0, index + 1).join("/")}${
        queryString ? `?${queryString}` : ""
      }`;
      return {
        href: url,
        title: (
          <>
            <UserOutlined />
            <span>{pathSnippets[index]}</span>
          </>
        ),
      };
    }),
  ];

  return (
    <div className="flex w-full items-start justify-start p-4">
      <Breadcrumb items={breadcrumbItems} />
    </div>
  );
};

export default MyBreadcurmb;
