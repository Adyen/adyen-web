const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

module.exports = {
    name: `husky-setup`,
    factory: () => ({
        hooks: {
            afterAllInstalled() {
                const libraryPackagesDir = path.resolve(__dirname, '..', 'packages');

                if (fs.existsSync(libraryPackagesDir)) {
                    console.warn('[husky-setup] Installing husky hooks...');
                    execSync('npx husky', { stdio: 'inherit' });
                    console.warn('[husky-setup] Husky installed');
                }
            }
        }
    })
};
