const isScreenSmall = (): boolean => window.matchMedia('(max-width: 480px)').matches;

export default isScreenSmall;
