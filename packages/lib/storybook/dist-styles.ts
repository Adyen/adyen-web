/**
 * Loaded only in the dist Storybook build.
 * The built library bundles no styles: rollup extracts every component stylesheet into
 * `dist/es/adyen.css`, which merchants import themselves. Vite processes the per-component SCSS in
 * source mode, so in dist mode the aggregated stylesheet has to be pulled in here, or every
 * component renders unstyled.
 */
import '@adyen/adyen-web/styles/adyen.css';
