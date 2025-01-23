import { atom } from "jotai";
import { type inferRouterOutputs } from "@trpc/server";
import { type AppRouter } from "@/server/api/root";
type Tproject =
    inferRouterOutputs<AppRouter>["project"]["getAll"][number];

export const projectsAtom = atom<Tproject[]>([]);
export const svnBranchAtom = atom<number | string>(0);
export const projectAtom = atom<number>(0);