// Hook adaptado para web
export const useCompactUI = () => {
  // En web, detectamos por altura de ventana
  if (typeof window === 'undefined') return false;
  return window.innerHeight < 700;
};
