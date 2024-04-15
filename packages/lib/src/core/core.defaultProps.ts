import type { CoreConfiguration } from './types';

const defaultProps: CoreConfiguration = {
    exposeLibraryMetadata: true,
    showPayButton: true,
    _translationEnvironment: process.env.NODE_ENV === 'development' ? 'local' : 'remote'
};

export { defaultProps };
