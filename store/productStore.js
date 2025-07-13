// /store/productStore.js
import { create } from 'zustand';

export const useProductStore = create((set) => ({
  products: [],
  setProducts: (products) => set({ products }),
  addProduct: (product) =>
    set((state) => ({ products: [product, ...state.products] })),
  removeProduct: (id) =>
    set((state) => ({
      products: state.products.filter((p) => p._id !== id),
    })),
  updateProduct: (updatedProduct) =>
    set((state) => ({
      products: state.products.map((p) =>
        p._id === updatedProduct._id ? updatedProduct : p
      ),
    })),
}));
