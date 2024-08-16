import { create } from "zustand";

export const useSetUser = create((set) => ({
  name: "",
  id: "",
  setUser: (newUser) => set({ name: newUser.name, id: newUser.id }),
}));
