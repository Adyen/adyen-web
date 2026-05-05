#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const CONSTANTS_FILE = path.join(__dirname, '../packages/lib/src/language/constants.ts');
const TRANSLATIONS_DIR = path.join(__dirname, '../packages/server/translations');

function extractLocalesFromConstants() {
    const content = fs.readFileSync(CONSTANTS_FILE, 'utf8');

    const match = content.match(/export const CDN_SUPPORTED_LOCALES = \[([\s\S]*?)\] as const;/);
    if (!match) {
        throw new Error('Could not find CDN_SUPPORTED_LOCALES in constants.ts');
    }

    const localesString = match[1];
    const locales = localesString
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.startsWith("'"))
        .map(line => line.replace(/^'|',?$/g, ''));

    return locales;
}

function getTranslationFiles() {
    const files = fs.readdirSync(TRANSLATIONS_DIR);

    return files.filter(file => file.endsWith('.json')).map(file => file.replace('.json', ''));
}

function validateLocales() {
    console.log('🔍 Validating locale consistency...\n');

    const constantLocales = extractLocalesFromConstants();
    const translationLocales = getTranslationFiles();

    console.log(`Found ${constantLocales.length} locales in CDN_SUPPORTED_LOCALES`);
    console.log(`Found ${translationLocales.length} translation files\n`);

    const missingTranslations = constantLocales.filter(locale => !translationLocales.includes(locale));

    const orphanedTranslations = translationLocales.filter(locale => !constantLocales.includes(locale));

    let hasErrors = false;

    if (missingTranslations.length > 0) {
        hasErrors = true;
        console.error('❌ Missing translation files:\n');
        missingTranslations.forEach(locale => {
            console.error(`   - Locale '${locale}' is defined in constants.ts but missing translation file:`);
            console.error(`     packages/server/translations/${locale}.json\n`);
        });
    }

    if (orphanedTranslations.length > 0) {
        hasErrors = true;
        console.error('❌ Orphaned translation files:\n');
        orphanedTranslations.forEach(locale => {
            console.error(`   - Translation file '${locale}.json' exists but locale '${locale}' is not in CDN_SUPPORTED_LOCALES array`);
            console.error(`     File: packages/server/translations/${locale}.json\n`);
        });
    }

    if (hasErrors) {
        console.error('\n💥 Validation failed! Please ensure all locales have corresponding translation files and vice versa.\n');
        process.exit(1);
    }

    console.log(`✅ All ${constantLocales.length} locales validated successfully!\n`);
    process.exit(0);
}

try {
    validateLocales();
} catch (error) {
    console.error('❌ Error during validation:', error.message);
    process.exit(1);
}
