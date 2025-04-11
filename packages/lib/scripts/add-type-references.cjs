/**
 * Typescript for some reason is not adding the triple-slash directives at the generated type definition file.
 * This scripts adds them manually after the types are generated
 */

const fs = require('fs');
const path = './dist/temp-types/lib/src/types.d.ts';

const references = ['/// <reference types="googlepay" />', '/// <reference types="applepayjs" />'];

if (fs.existsSync(path)) {
    let content = fs.readFileSync(path, 'utf8');

    // Ensure references are added at the top
    references.forEach(ref => {
        if (!content.includes(ref)) {
            content = ref + '\n' + content;
        }
    });

    fs.writeFileSync(path, content, 'utf8');
    console.log('[add-type-reference.cjs] Added references to googlepay and applepayjs types.\n');
} else {
    console.error(`Error: ${path} not found. Ensure TypeScript declaration files are generated.`);
    process.exit(1);
}
