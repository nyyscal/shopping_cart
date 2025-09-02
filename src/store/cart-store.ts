import { create } from 'zustand';

type CartItemType = {
  id: number;
  title: string;
  heroImage: string;
  price: number;
  quantity: number;
  maxQuantity: number;
};

type CartState = {
  items: CartItemType[];
  addItem: (item: CartItemType) => void;
  removeItem: (id: number) => void;
  incrementItem: (id: number) => void;
  decrementItem: (id: number) => void;
  getTotalPrice: () => string;
  getItemCount: () => number;
  resetCart: () => void;
};

const initialCartItems: CartItemType[] = [];

export const useCartStore = create<CartState>((set, get) => ({
  items: initialCartItems,
 addItem: (item: CartItemType) => {
  const existingItem = get().items.find(i => i.id === item.id);

  if (existingItem) {
    set(state => ({
      items: state.items.map(i =>
        i.id === item.id
          ? {
              ...i,
              quantity: Math.min(
                (i.quantity ?? 0) + (item.quantity ?? 1), // ✅ safe fallback
                i.maxQuantity ?? (i.quantity ?? 9999)     // ✅ fallback if maxQuantity missing
              ),
              price: i.price ?? 0, // ✅ avoid undefined price
            }
          : i
      ),
    }));
  } else {
    set(state => ({
      items: [
        ...state.items,
        {
          ...item,
          quantity: item.quantity ?? 1,   // ✅ default to 1
          price: item.price ?? 0,         // ✅ default to 0
          maxQuantity: item.maxQuantity ?? 9999, // ✅ default high limit
        },
      ],
    }));
  }
},

  removeItem: (id: number) =>
    set(state => ({ items: state.items.filter(item => item.id !== id) })),
  incrementItem: (id: number) =>
    set(state => {
      return {
        items: state.items.map(item =>
          item.id === id && item.quantity < item.maxQuantity
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ),
      };
    }),
  decrementItem: (id: number) =>
    set(state => ({
      items: state.items.map(item =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      ),
    })),
getTotalPrice: () => {
  const { items } = get();
  return items
    .reduce(
      (total, item) => total + (item.price ?? 0) * (item.quantity ?? 0),
      0
    )
    .toFixed(2);
},

  getItemCount: () => {
    const { items } = get();
    return items.reduce((count, item) => count + item.quantity, 0);
  },
  resetCart: () => set({ items: initialCartItems }),
}));