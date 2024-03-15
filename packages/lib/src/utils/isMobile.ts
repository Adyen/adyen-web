const isMobile = (): boolean => window.matchMedia('(max-width: 768px)').matches && /Android|iPhone|iPod/.test(navigator.userAgent);
//const isMobile = (): boolean => true;

export default isMobile;
