import { useState } from "react";

export const useModalState = () => {
  const [state, setState] = useState({
    isAddConfigModalVisible: false,
    isAddCategoryModalVisible: false,
    isExportModalVisible: false,
  });

  const toggleModal = (modalName: string, visible: boolean) => {
    setState((prev) => ({
      ...prev,
      [modalName]: visible,
    }));
  };

  return { ...state, toggleModal };
};