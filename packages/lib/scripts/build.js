import { concurrently } from 'concurrently';

const bundle = name => `rollup --config config/rollup.prod.js --configBundle ${name}`;

// `types` is chained after `build:types` because the .d.ts configs read dist/temp-types.
const TASKS = {
    lint: 'yarn run lint',
    'lint-styles': 'yarn run lint-styles',
    'type-check': 'yarn run type-check',
    types: `yarn run build:types && ${bundle('types')}`,
    es: bundle('es'),
    'es-legacy': bundle('es-legacy'),
    umd: bundle('umd'),
    cjs: bundle('cjs')
};

const names = process.argv.length > 2 ? process.argv.slice(2) : Object.keys(TASKS);
const unknown = names.filter(name => !Object.hasOwn(TASKS, name));
if (unknown.length > 0) {
    console.error(`Unknown build task(s): ${unknown.join(', ')}. Expected any of: ${Object.keys(TASKS).join(', ')}`);
    process.exit(1);
}

try {
    await concurrently(
        names.map(name => ({ name, command: TASKS[name] })),
        { killOthersOn: ['failure'], outputStream: process.stderr }
    ).result;
} catch {
    process.exitCode = 1;
}
