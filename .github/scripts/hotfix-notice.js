#!/usr/bin/env node
// Add or replace a hotfix notice at the top of a GitHub release body.
//
// Used by .github/workflows/flag-affected-release.yml. Fills in a template from
// .github/hotfix-templates/, removes any earlier notice with the same marker,
// and prepends the new notice. Re-running it gives the same result (idempotent).
//
// Usage:
//     node hotfix-notice.js --template <file> --marker <name> --body-in <file> --body-out <file>
//
// Values are read from the environment:
//     SUMMARY            customer-facing description of the issue (required, public)
//     REPO_URL           e.g. https://github.com/Adyen/adyen-web (required)
//     AFFECTED_VERSION   e.g. 6.47.0 (required)
//     FIXED_VERSION      e.g. 6.47.1 (optional)
//     PREVIOUS_VERSION   last good version to recommend while the fix is pending (optional)
//     PUBLIC_ISSUE_URL   public GitHub issue with details (optional)

const fs = require('node:fs');
const { parseArgs } = require('node:util');

function fail(message) {
    console.error(`error: ${message}`);
    process.exit(1);
}

function env(name, required = false) {
    const value = (process.env[name] || '').trim().split(/\s+/).join(' '); // collapse newlines/whitespace
    if (required && !value) fail(`environment variable ${name} is required`);
    return value;
}

function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function stripNotice(body, marker) {
    const m = escapeRegExp(marker);
    const pattern = new RegExp(`<!-- ${m}:start -->[\\s\\S]*?<!-- ${m}:end -->\\s*`, 'g');
    return body.replace(pattern, '').trimStart();
}

// Same placeholder syntax as Python's string.Template: $NAME, ${NAME}, and $$ for a literal "$".
function substitute(template, values, templatePath) {
    const pattern = /\$(?:(\$)|([_a-zA-Z][_a-zA-Z0-9]*)|\{([_a-zA-Z][_a-zA-Z0-9]*)\}|())/g;
    return template.replace(pattern, (match, escaped, named, braced, invalid, offset) => {
        if (escaped !== undefined) return '$';
        if (invalid !== undefined) fail(`template ${templatePath} has an invalid placeholder at offset ${offset}`);
        const name = named ?? braced;
        if (!Object.hasOwn(values, name)) fail(`template ${templatePath} uses unknown placeholder '${name}'`);
        return values[name];
    });
}

function buildValues() {
    const repoUrl = env('REPO_URL', true).replace(/\/+$/, '');
    const affected = env('AFFECTED_VERSION', true);
    const fixed = env('FIXED_VERSION');
    const previous = env('PREVIOUS_VERSION');
    const issue = env('PUBLIC_ISSUE_URL');

    const recommendation = previous
        ? `Until it is available, use [v${previous}](${repoUrl}/releases/tag/v${previous}).`
        : 'Until it is available, stay on the version you used before this one.';

    return {
        SUMMARY: env('SUMMARY', true),
        AFFECTED_VERSION: affected,
        AFFECTED_RELEASE_URL: `${repoUrl}/releases/tag/v${affected}`,
        FIXED_VERSION: fixed,
        FIXED_RELEASE_URL: fixed ? `${repoUrl}/releases/tag/v${fixed}` : '',
        RECOMMENDATION: recommendation,
        DETAILS: issue ? `\n>\n> Details: ${issue}` : ''
    };
}

function main() {
    const { values: args } = parseArgs({
        options: {
            template: { type: 'string' },
            marker: { type: 'string' },
            'body-in': { type: 'string' },
            'body-out': { type: 'string' }
        }
    });
    for (const name of ['template', 'marker', 'body-in', 'body-out']) {
        if (!args[name]) fail(`--${name} is required`);
    }

    const template = fs.readFileSync(args.template, 'utf8');
    const body = fs.readFileSync(args['body-in'], 'utf8');

    const notice = substitute(template, buildValues(), args.template);
    const newBody = `${notice.trimEnd()}\n\n${stripNotice(body, args.marker)}`;
    fs.writeFileSync(args['body-out'], `${newBody.trimEnd()}\n`, 'utf8');
}

main();
