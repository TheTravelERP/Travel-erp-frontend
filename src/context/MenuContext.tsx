import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { fetchUserMenu } from '../services/menu.service';

type MenuItem = { id: number; title: string; path?: string; children?: MenuItem[]; is_view?: boolean };

type MenuCtx = {
  loading: boolean;
  menu: MenuItem[];
  refresh: () => Promise<void>;
};

const MenuContext = createContext<MenuCtx | undefined>(undefined);

export function MenuProvider({ children }: { children: React.ReactNode }) {
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

  useEffect(() => { refresh(); }, []);

  const value = useMemo(() => ({ loading, menu, refresh }), [loading, menu]);
  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
}

export function useMenu() {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error('MenuContext not found');
  return ctx;
}
