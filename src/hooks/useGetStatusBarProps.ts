// Hook simplificado para web - no hay StatusBar en web
export const useGetStatusBarProps = () => {
  return {
    backgroundColor: '#FFFFFF',
    barStyle: 'dark-content',
    translucent: false,
  };
};

export default useGetStatusBarProps;
