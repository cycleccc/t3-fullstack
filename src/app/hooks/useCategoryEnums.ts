import { useState, useEffect } from "react";
import { api } from "@/trpc/react";
import { createProTableEnum } from "@/utils/table";
import { useAtom } from "jotai";
import { svnBranchAtom } from "@/atoms/projectAtoms";

export function useCategoryEnums() {
    const [svnBranchId] = useAtom(svnBranchAtom);
  const {
    data: category1List,
    isLoading: categoryLoading,
    refetch: refetchCategory1List,
  } = api.category1.getAll.useQuery();

  const { data: creatorTypes } = api.textConfig.getCreatorTypes.useQuery({
    svnBranchId,
  });

  const [category1TypesEnum, setCategory1TypesEnum] = useState<
    Record<string, { text: string }>
  >({});
  const [creatorTypesEnum, setCreatorTypesEnum] = useState<
    Record<string, { text: string }>
  >({});

  useEffect(() => {
    if (category1List) {
      const types = createProTableEnum(category1List, "name");
      setCategory1TypesEnum(types);
    }
  }, [category1List]);

  useEffect(() => {
    if (creatorTypes) {
      const types = createProTableEnum(creatorTypes, "createdBy");
      setCreatorTypesEnum(types);
    }
  }, [creatorTypes]);

  return {
    category1List,
    category1TypesEnum,
    creatorTypesEnum,
    categoryLoading,
    refetchCategory1List,
  };
}
