const fs = require('fs');
const path = require('path');
const prettier = require('prettier');
const loaderUtils = require('loader-utils');

const configsCache = {};

async function getConfig(filePath, loaderOptions) {
    if (configsCache[filePath]) return configsCache[filePath];

    const { resolveConfigOptions, ...passedToLoaderPrettierOptions } = loaderOptions || {};
    const outerOptions = await prettier.resolveConfig(filePath, resolveConfigOptions);
    const mergedConfig = { ...outerOptions, ...passedToLoaderPrettierOptions };

    // eslint-disable-next-line require-atomic-updates
    configsCache[filePath] = mergedConfig;

    return mergedConfig;
}

// loader
const loadedFiles = new Set();

module.exports = async function(source, map) {
    this.cacheable();
    const callback = this.async();

    if (!new RegExp(this.query.test).test(this.context)) return callback(null, source, map);

    const { skipRewritingSource, ignoreInitial, ...config } = await getConfig(this.resourcePath, loaderUtils.getOptions(this));

    if (!!ignoreInitial && !loadedFiles.has(this.resourcePath)) {
        loadedFiles.add(this.resourcePath);
        return callback(null, source, map);
    }

    let prettierSource;

    try {
        prettierSource = prettier.format(source, config);
    } catch (e) {
        return callback(e);
    }

    if (!skipRewritingSource && prettierSource !== source) {
        try {
            fs.writeFileSync(this.resourcePath, prettierSource);
        } catch (error) {
            return callback(error);
        }
    }

    callback(null, prettierSource, map);
};
