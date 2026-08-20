import isLocalhost from '../../../utils/isLocalhost';

function resolveEnvironment(env = 'PRODUCTION'): google.payments.api.Environment {
    switch (env) {
        case 'beta':
        case 'test':
            return 'TEST';
        default:
            return 'PRODUCTION';
    }
}

function resolveEnvironmentForAcceleratedCheckout(env = 'PRODUCTION'): google.payments.api.Environment | 'EMULATOR' {
    switch (env) {
        case 'beta':
        case 'test': {
            if (isLocalhost()) {
                return 'EMULATOR';
            }

            return 'TEST';
        }
        default:
            return 'PRODUCTION';
    }
}

export { resolveEnvironment, resolveEnvironmentForAcceleratedCheckout };
