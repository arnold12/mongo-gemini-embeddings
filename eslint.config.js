import globals from 'globals';
import pluginJs from '@eslint/js';

export default [
  {
    languageOptions: { 
      globals: {
        ...globals.node,
        ...globals.es2021
      }
    }
  },
  pluginJs.configs.recommended,
  {
    rules: {
      'no-unused-vars': 'warn',
      'no-console': 'off', // Allow console logs for this backend app
    }
  }
];
