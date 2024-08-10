import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default [
    ...tseslint.configs.recommended,
    pluginJs.configs.recommended,
    { ignores: ['dist/'] },
    {
        files: ['**/*.{ts,js}'],
        languageOptions: {
            ecmaVersion: 'latest',
            globals: {
                ...globals.node,
                ...globals.browser,
            },
        },
        rules: {
            'no-console': 'error',
            'no-unused-vars': 'off',
            'no-undef': 'warn',
            '@typescript-eslint/no-unused-vars': [
                'warn',
                {
                    args: 'all',
                    argsIgnorePattern: '^_',
                    caughtErrors: 'all',
                    caughtErrorsIgnorePattern: '^_',
                    destructuredArrayIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    ignoreRestSiblings: true,
                },
            ],
        },
    },
    {
        files: ['dist/**/*.js'],
        rules: {
            '@typescript-eslint/no-var-requires': 'off',
            'no-cond-assign': 'off',
            'no-console': 'off',
            'require-yield': 'off',
        },
    },
];
