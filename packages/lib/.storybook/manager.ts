import { addons } from 'storybook/manager-api';
import theme from './theme';

/**
 * https://storybook.js.org/docs/html/configure/features-and-behavior
 */
addons.setConfig({
    panelPosition: 'right',
    theme
});
