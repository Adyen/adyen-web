const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Plugin for Yarn that installs husky hooks after all packages are installed.
 */
module.exports = {
    name: `husky-setup`,
    factory: () => ({
        hooks: {
            afterAllInstalled() {
                console.warn('[husky-setup] Installing husky hooks...');
                execSync('npx husky', { stdio: 'inherit' });
                console.warn('[husky-setup] Husky installed');
            }
        }
    })
};
