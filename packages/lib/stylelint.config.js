module.exports = {
    extends: ['stylelint-config-standard-scss', 'stylelint-config-prettier'],
    rules: {
        'color-function-notation': 'legacy',
        'no-descending-specificity': null,
        'selector-class-pattern': null,
        'max-line-length': 180,
        'rule-empty-line-before': 'always'
    }
};
