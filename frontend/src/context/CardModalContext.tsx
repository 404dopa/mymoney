import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface CardModalContextType {
  isAddModalOpen: boolean;
  openAddModal: () => void;
  closeAddModal: () => void;
  isCardEditMode: boolean;
  toggleCardEditMode: () => void;
  setIsCardEditMode: (val: boolean) => void;
}

const CardModalContext = createContext<CardModalContextType>({
  isAddModalOpen: false,
  openAddModal: () => {},
  closeAddModal: () => {},
  isCardEditMode: false,
  toggleCardEditMode: () => {},
  setIsCardEditMode: () => {},
});

export const useCardModal = () => useContext(CardModalContext);

export const CardModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCardEditMode, setIsCardEditMode] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname === '/statistics') {
      setIsCardEditMode(false);
    }
  }, [location.pathname]);

  const openAddModal = () => {
    // If user is on statistics, navigate to expenses first
    if (location.pathname === '/statistics') {
      navigate('/expenses');
    }
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
  };

  const toggleCardEditMode = () => {
    setIsCardEditMode((prev) => !prev);
  };

  return (
    <CardModalContext.Provider
      value={{
        isAddModalOpen,
        openAddModal,
        closeAddModal,
        isCardEditMode,
        toggleCardEditMode,
        setIsCardEditMode,
      }}
    >
      {children}
    </CardModalContext.Provider>
  );
};
