import dynamic from "next/dynamic";
import type { ParamsType, ProTableProps } from "@ant-design/pro-components";
import React from "react";

// 创建一个高阶函数用于生成动态 ProTable 组件
export function createProTable<T>() {
  // 使用 dynamic 动态加载 ProTable
  const DynamicProTable = dynamic<ProTableProps<T, ParamsType>>(
    () =>
      import("@ant-design/pro-components").then(
        (mod) =>
          mod.ProTable as React.ComponentType<ProTableProps<T, ParamsType>>,
      ),
    { ssr: false },
  );

  // 返回直接包装后的动态组件，确保泛型 T 的传递
  const WrappedProTable = (props: ProTableProps<T, ParamsType>) => {
    return <DynamicProTable {...props} />;
  };

  // 为组件添加显示名称，便于调试
  WrappedProTable.displayName = "WrappedProTable";

  return WrappedProTable;
}
