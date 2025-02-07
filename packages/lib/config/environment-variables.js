import packageJson from '../package.json' with { type: 'json' };
import { loadEnv } from 'vite';
import * as path from 'path';

function generateEnvironmentVariables(buildType = 'development', bundleType = 'esm') {
    const env = loadEnv(buildType, path.resolve('../../', '.env'), '');

    return {
        'process.env.CLIENT_ENV': JSON.stringify(env.CLIENT_ENV),
        'process.env.CLIENT_KEY': JSON.stringify(env.CLIENT_KEY),
        'process.env.BUNDLE_TYPE': JSON.stringify(bundleType),
        'process.env.NODE_ENV': JSON.stringify(buildType),
        'process.env.VERSION': JSON.stringify(packageJson.version),
        'process.env.__SF_ENV__': JSON.stringify(env.SF_ENV || 'build')
    };
}

export default generateEnvironmentVariables;
