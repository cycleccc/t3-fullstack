// HeaderMenu.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Layout, theme, Image, Divider } from "antd";
import { useAtom } from "jotai";
import { api } from "@/trpc/react";
import { projectAtom, svnBranchAtom } from "@/atoms/projectAtoms";
import Cascader, { type Option } from "./Cascader";
import { useRouter } from "next/navigation";
import Settings from "./Settings";

const { Header } = Layout;

type Props = {
  children?: React.ReactNode;
};

const HeaderMenu: React.FC<Props> = ({}) => {
  const [projectsOptions, setProjectsOptions] = useState<Option[]>([]);
  const [svnBranchOptions, setSvnBranchOptions] = useState<Option[]>([]);
  const [selectSvnBranch, setSvnBranchValue] = useAtom(svnBranchAtom);
  const [selectProject, setSelectProject] = useAtom(projectAtom);
  const [selectSvnBranchName, setSelectSvnBranchName] = useState("");
  const router = useRouter();

  const { data: projectsData, isLoading: projectsLoading } =
    api.project.getAll.useQuery();
  const { data: svnBranchesData, isLoading: svnBranchesLoading } =
    api.svnBranch.getSvnBranchesByProjectId.useQuery({
      projectId: selectProject,
    });
  useEffect(() => {
    const selectSvnBranchName =
      svnBranchOptions.length > 0
        ? (svnBranchOptions.find((v) => v.value == selectSvnBranch)?.label ??
          "")
        : "";
    setSelectSvnBranchName(selectSvnBranchName);
  }, [svnBranchOptions, selectSvnBranch]);

  useEffect(() => {
    if (projectsData) {
      setProjectsOptions(
        projectsData.map((v) => ({
          value: v.id.toString(),
          label: v.name,
        })),
      );
    }
  }, [projectsData, setProjectsOptions]);

  useEffect(() => {
    if (svnBranchesData?.length) {
      const allOption = {
        value: "ALL",
        label: "全部",
      };
      const branchOptions = svnBranchesData.map((v) => ({
        value: v.id.toString(),
        label: v.name,
      }));
      setSvnBranchOptions([allOption, ...branchOptions]);
    } else {
      setSvnBranchOptions([]);
    }
  }, [svnBranchesData, setSvnBranchValue, selectSvnBranch]);

  const handleProjectSelect = (selectedValue: string) => {
    if (!selectedValue) {
      setSvnBranchValue(0);
    }
    setSelectProject(parseInt(selectedValue));
  };

  const handleSvnBranchSelect = (selectedValue: string) => {
    if (selectedValue === "ALL") {
      setSvnBranchValue("ALL");
    } else {
      setSvnBranchValue(parseInt(selectedValue));
    }
  };

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const navigateToHome = () => {
    router.push("/"); //
  };
  return (
    <Header
      style={{
        background: colorBgContainer,
        borderRadius: borderRadiusLG,
      }}
      className="flex items-center justify-between pl-0 pr-6"
    >
      <div className="flex w-48 justify-center">
        <button onClick={navigateToHome} className="flex items-center">
          <Image preview={false} src="/logo.png" alt="Logo" className="mr-2" />
        </button>
      </div>
      <div className="flex items-center justify-center gap-4">
        <Cascader
          options={projectsOptions}
          onSelect={handleProjectSelect}
          isLoading={projectsLoading}
          placeholder={"请选择项目"}
        />
        <Cascader
          options={svnBranchOptions}
          value={selectSvnBranchName ? [selectSvnBranchName] : undefined}
          key={selectProject}
          onSelect={handleSvnBranchSelect}
          isLoading={svnBranchesLoading}
          placeholder={"请选择 SVN 线"}
        />
        <Divider type="vertical" />
        <Settings />
      </div>
    </Header>
  );
};

export default HeaderMenu;
