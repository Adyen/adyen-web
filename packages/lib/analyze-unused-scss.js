import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Find all SCSS files
const scssFiles = execSync('find src -name "*.scss" -type f', {
    cwd: __dirname,
    encoding: 'utf-8'
})
    .trim()
    .split('\n')
    .filter(Boolean);

console.log(`Found ${scssFiles.length} SCSS files\n`);

// Extract all class names from SCSS files
// Pattern ensures class names start with a letter, underscore, or hyphen (not a digit)
const classPattern = /\.([a-zA-Z_-][a-zA-Z0-9_-]*(?:__[a-zA-Z0-9_-]+)?(?:--[a-zA-Z0-9_-]+)?)/g;
const allClasses = new Map(); // Map of className -> [files where defined]

scssFiles.forEach(file => {
    const fullPath = path.join(__dirname, file);
    const content = fs.readFileSync(fullPath, 'utf-8');
    const matches = content.matchAll(classPattern);

    for (const match of matches) {
        const className = match[1];
        // Skip SCSS variables and functions
        if (className.startsWith('$') || className.startsWith('@')) continue;

        if (!allClasses.has(className)) {
            allClasses.set(className, []);
        }
        if (!allClasses.get(className).includes(file)) {
            allClasses.get(className).push(file);
        }
    }
});

console.log(`Extracted ${allClasses.size} unique class names\n`);
console.log('Checking usage in TypeScript/JavaScript files...\n');

// Find all TS/TSX/JS/JSX files
const codeFiles = execSync('find src -type f \\( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \\)', {
    cwd: __dirname,
    encoding: 'utf-8'
})
    .trim()
    .split('\n')
    .filter(Boolean);

console.log(`Scanning ${codeFiles.length} code files for class usage...\n`);

// Check each class for usage
const unusedClasses = [];
const usedClasses = [];

for (const [className, definedIn] of allClasses.entries()) {
    console.log(`Checking ${className} defined in ${definedIn.length} files...`);
    let isUsed = false;

    // Search for the class name in code files
    try {
        const grepResult = execSync(`grep -l "${className}" ${codeFiles.map(f => `"${f}"`).join(' ')}`, {
            cwd: __dirname,
            encoding: 'utf-8',
            stdio: ['pipe', 'pipe', 'ignore']
        });
        if (grepResult.trim()) {
            isUsed = true;
            usedClasses.push(className);
        }
    } catch (e) {
        // grep returns non-zero exit code when no matches found
        if (!isUsed) {
            // Also check in SCSS files (might be used via @extend or composition)
            try {
                const scssGrepResult = execSync(`grep -l "${className}" ${scssFiles.map(f => `"${f}"`).join(' ')}`, {
                    cwd: __dirname,
                    encoding: 'utf-8',
                    stdio: ['pipe', 'pipe', 'ignore']
                });
                const usageFiles = scssGrepResult.trim().split('\n');
                // If used in more files than just where it's defined, consider it used
                if (usageFiles.length > definedIn.length) {
                    isUsed = true;
                    usedClasses.push(className);
                }
            } catch (e2) {
                // Not found anywhere
                console.log(`Error occured: ${e2.details}`);
            }
        }
    }

    if (!isUsed) {
        unusedClasses.push({ className, definedIn });
    }
}

// Output results
console.log('='.repeat(80));
console.log('ANALYSIS COMPLETE');
console.log('='.repeat(80));
console.log(`\nTotal classes found: ${allClasses.size}`);
console.log(`Used classes: ${usedClasses.length}`);
console.log(`Potentially unused classes: ${unusedClasses.length}\n`);

if (unusedClasses.length > 0) {
    console.log('POTENTIALLY UNUSED CLASSES:');
    console.log('-'.repeat(80));

    // Group by file
    const byFile = {};
    unusedClasses.forEach(({ className, definedIn }) => {
        definedIn.forEach(file => {
            if (!byFile[file]) byFile[file] = [];
            byFile[file].push(className);
        });
    });

    Object.keys(byFile)
        .sort()
        .forEach(file => {
            console.log(`\n${file}:`);
            byFile[file].sort().forEach(className => {
                console.log(`  - .${className}`);
            });
        });

    // Write to file
    const outputPath = path.join(__dirname, 'unused-scss-classes.json');
    fs.writeFileSync(outputPath, JSON.stringify({ unusedClasses, byFile }, null, 2));
    console.log(`\n\nDetailed results written to: ${outputPath}`);
}
