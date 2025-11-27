import globals from 'globals';
import pluginJs from '@eslint/js';

import stylistic from '@stylistic/eslint-plugin';

export default [
  {
    languageOptions: { 
      globals: {
        ...globals.node,
        ...globals.es2021
      }
    },
    plugins: {
      '@stylistic': stylistic
    }
  },
  pluginJs.configs.recommended,
  {
    rules: {
      'no-unused-vars': 'warn',
      'no-console': 'off', // Allow console logs for this backend app
      
      // Stylistic Rules
      '@stylistic/indent': ['error', 2],
      '@stylistic/quotes': ['error', 'single'],
      '@stylistic/semi': ['error', 'always'],
      '@stylistic/comma-dangle': ['error', 'only-multiline'],
      '@stylistic/arrow-parens': ['error', 'always'],
      '@stylistic/object-curly-spacing': ['error', 'always'],
    }
  }
];
