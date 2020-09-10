/**
 *
 */
export function resolveEnvironment(env = 'TEST'): google.payments.api.Environment {
    const environment = env.toLowerCase();
    switch (environment) {
        case 'production':
        case 'live':
            return 'PRODUCTION';
        default:
            return 'TEST';
    }
}
