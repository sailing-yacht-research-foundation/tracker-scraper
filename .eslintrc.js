module.exports = {
    env: {
        mocha: true,
    },
    extends: ['prettier', 'standard'],
    plugins: ['prettier'],
    rules: {
        'prettier/prettier': 'error',
        indent: 'off',
        'comma-dangle': 'off',
        semi: 'off',
        'space-before-function-paren': 'off',
    },
};
