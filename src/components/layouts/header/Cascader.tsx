import React from "react";
import { Cascader } from "antd";
import type { CascaderProps, GetProp } from "antd";
import { DownOutlined, LoadingOutlined } from "@ant-design/icons";

type DefaultOptionType = GetProp<CascaderProps, "options">[number];

export interface Option {
  value: string;
  label: string;
  children?: Option[];
  disabled?: boolean;
}

const filter = (inputValue: string, path: DefaultOptionType[]) =>
  path.some((option) =>
    (option.label as string).toLowerCase().includes(inputValue.toLowerCase()),
  );

type Props = {
  isLoading: boolean;
  options?: Option[];
  onSelect: (selectedValue: string) => void; // 父组件传递的回调
  placeholder?: string;
  defaultValue?: string[];
  value?: string[] | undefined;
  className?: string;
};

const Input: React.FC<Props> = ({ options, isLoading, onSelect, ...rest }) => {
  const onChange: CascaderProps<Option>["onChange"] = (value) => {
    if (value?.[0]) onSelect(value[0]);
    else {
      onSelect("0");
    }
  };

  return (
    <Cascader
      size="large"
      suffixIcon={isLoading ? <LoadingOutlined /> : <DownOutlined />}
      options={options}
      onChange={onChange}
      showSearch={{ filter }}
      {...rest}
    />
  );
};

export default Input;
