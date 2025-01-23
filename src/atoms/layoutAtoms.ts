import { atom } from "jotai";

export const sidebarVisibleAtom = atom(true);

export const toggleSidebarAtom = atom(
    (get) => get(sidebarVisibleAtom),
    (get, set) => set(sidebarVisibleAtom, !get(sidebarVisibleAtom)),
);