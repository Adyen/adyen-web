const childProcess = require('child_process');
const packageJson = require('../package.json');

module.exports = () => {
    let COMMIT_HASH = null;
    let COMMIT_BRANCH = null;

    try {
        COMMIT_HASH = childProcess
            .execSync('git rev-parse --short HEAD')
            .toString()
            .trim();
        COMMIT_BRANCH = childProcess
            .execSync('git rev-parse --abbrev-ref HEAD')
            .toString()
            .trim();

        console.log(`Building version ${packageJson.version} (revision ${COMMIT_HASH} from branch ${COMMIT_BRANCH}).`);
    } catch (e) {
        console.warn(e.message);
    }

    return {
        ADYEN_WEB_VERSION: packageJson.version,
        COMMIT_BRANCH,
        COMMIT_HASH
    };
};
