import * as childProcess from 'child_process';
import packageJson from '../package.json' assert { type: 'json' };

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        let r = (Math.random() * 16) | 0,
            v = c == 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

let COMMIT_HASH = null;
let COMMIT_BRANCH = null;
const ADYEN_BUILD_ID = `@adyen/adyen-web-${uuidv4()}`;

try {
    COMMIT_HASH = childProcess.execSync('git rev-parse --short HEAD').toString().trim();
    COMMIT_BRANCH = childProcess.execSync('git rev-parse --abbrev-ref HEAD').toString().trim();

    console.log(`Building version ${packageJson.version} (revision ${COMMIT_HASH} from branch ${COMMIT_BRANCH}). Build id ${ADYEN_BUILD_ID}`);
} catch (e) {
    console.warn(e.message);
}

export default {
    ADYEN_WEB_VERSION: packageJson.version,
    COMMIT_BRANCH,
    COMMIT_HASH,
    ADYEN_BUILD_ID
};

//
// module.exports = () => {
//     let COMMIT_HASH = null;
//     let COMMIT_BRANCH = null;
//     const ADYEN_BUILD_ID = `@adyen/adyen-web-${uuidv4()}`;
//
//     try {
//         COMMIT_HASH = childProcess.execSync('git rev-parse --short HEAD').toString().trim();
//         COMMIT_BRANCH = childProcess.execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
//
//         console.log(`Building version ${packageJson.version} (revision ${COMMIT_HASH} from branch ${COMMIT_BRANCH}). Build id ${ADYEN_BUILD_ID}`);
//     } catch (e) {
//         console.warn(e.message);
//     }
//
//     return {
//         ADYEN_WEB_VERSION: packageJson.version,
//         COMMIT_BRANCH,
//         COMMIT_HASH,
//         ADYEN_BUILD_ID
//     };
// };
