import { create } from "zustand";

type ConsoleUiState = {
  selectedAppName: string | null;
  selectedCatalogItemKey: string | null;
  setSelectedAppName: (appName: string | null) => void;
  setSelectedCatalogItemKey: (itemKey: string | null) => void;
};

export const useConsoleUiStore = create<ConsoleUiState>((set) => ({
  selectedAppName: null,
  selectedCatalogItemKey: null,
  setSelectedAppName: (selectedAppName) => set({ selectedAppName }),
  setSelectedCatalogItemKey: (selectedCatalogItemKey) =>
    set({ selectedCatalogItemKey }),
}));
