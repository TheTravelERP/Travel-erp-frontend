import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { fetchUserMenu } from '../services/menu.service';
import type { MenuItem } from '../types/menu.types';
import { useAuth } from '../hooks/useAuth';

type MenuCtx = {
  loading: boolean;
  menu: MenuItem[];
  refresh: () => Promise<void>;
  findMenu: (key: string) => MenuItem | undefined;
};

const MenuContext = createContext<MenuCtx | undefined>(undefined);

function findMenuRecursive(items: MenuItem[], key: string): MenuItem | undefined {
  for (const item of items) {
    if (item.id === key) return item;
    if (item.children) {
      const found = findMenuRecursive(item.children, key);
      if (found) return found;
    }
  }
}

export function MenuProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth(); // 👈 WATCH AUTH
  const [loading, setLoading] = useState(false);
  const [menu, setMenu] = useState<MenuItem[]>([]);

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await fetchUserMenu();
      setMenu(data || []);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 KEY FIX
  useEffect(() => {
    if (isAuthenticated) {
      refresh();
    } else {
      setMenu([]); // clear on logout
    }
  }, [isAuthenticated]);

  const findMenu = (key: string) => findMenuRecursive(menu, key);

  const value = useMemo(
    () => ({ loading, menu, refresh, findMenu }),
    [loading, menu]
  );

  return (
    <MenuContext.Provider value={value}>
      {children}
    </MenuContext.Provider>
  );
}

export function useMenu() {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error('MenuContext not found');
  return ctx;
}
