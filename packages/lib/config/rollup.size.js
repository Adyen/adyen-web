import productionConfig from './rollup.prod.js';

/**
 * Bundle size measurement build, used by the `build:size` script in CI.
 *
 * Derived from the production config, it keeps only the outputs that .size-limit.cjs reads:
 * dist/umd/adyen.js, dist/es and dist/es-legacy (through auto/auto.js).
 * Leaving out the CJS and .d.ts configs also leaves out their dist/temp-types
 * input, which is why this build doesn't need `yarn run build:types` first.
 */

const MEASURED_OUTPUTS = ['dist/umd/adyen.js', './dist/es', './dist/es-legacy'];

export default commandLineArgs =>
    productionConfig(commandLineArgs).filter(config => [config.output].flat().some(output => MEASURED_OUTPUTS.includes(output.dir ?? output.file)));
