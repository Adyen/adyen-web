/**
 * This config/file is required for Storybook 8
 */
import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

export default defineConfig({
    plugins: [preact()]
});
