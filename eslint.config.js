import js from '@eslint/js';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  js.configs.recommended,
  {
    files: ['src/**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        window: true,
        document: true,
        fetch: true,
        console: true,
        setTimeout: true,
        navigator: true,
        localStorage: true,
        sessionStorage: true,
        URL: true,
        FormData: true,
        Blob: true,
        AbortController: true,
        AbortSignal: true,
        matchMedia: true,
        requestAnimationFrame: true,
        performance: true,
        queueMicrotask: true,
        Promise: true,
        Map: true,
        Set: true,
        JSON: true,
        Math: true,
        Date: true,
        Array: true,
        Object: true,
        String: true,
        Number: true,
        Boolean: true,
        Symbol: true,
        parseInt: true,
        parseFloat: true,
        isNaN: true,
        isFinite: true,
        encodeURIComponent: true,
        decodeURIComponent: true,
      },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off', // React 17+ JSX Transform
      'react/prop-types': 'off', // Disable prop validation for simplicity
      'react-hooks/set-state-in-effect': 'off', // Allow setState in effects if needed
      'react-hooks/immutability': 'off', // Allow accessing functions before declaration in effects
      'no-unused-vars': 'off', // Allow prefixed unused vars like _err
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
];