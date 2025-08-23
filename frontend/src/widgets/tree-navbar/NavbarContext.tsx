import { createContext, useContext, useState, type ReactNode } from 'react';

interface NavbarContextType {
  isCollapsed: boolean;
  toggleCollapse: () => void;
  navbarWidth: number;
}

const NavbarContext = createContext<NavbarContextType | undefined>(undefined);

export const useNavbar = () => {
  const context = useContext(NavbarContext);
  if (!context) {
    throw new Error('useNavbar must be used within NavbarProvider');
  }
  return context;
};

interface NavbarProviderProps {
  children: ReactNode;
}

// eslint-disable-next-line react/prop-types
export const NavbarProvider: React.FC<NavbarProviderProps> = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const navbarWidth = isCollapsed ? 70 : 280;

  return (
    <NavbarContext.Provider value={{ isCollapsed, toggleCollapse, navbarWidth }}>
      {children}
    </NavbarContext.Provider>
  );
};
