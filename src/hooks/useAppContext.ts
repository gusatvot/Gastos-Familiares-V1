import { useContext } from 'react';
import { AppContext } from '../context/AppContext';

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext debe ser usado dentro de un AppProvider');
  }
  return context;
}