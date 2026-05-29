module.exports = {
  extends: 'expo/eslintrc',
  rules: {
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'react-hooks/exhaustive-deps': 'warn',
  },
  env: {
    'react-native/react-native': true,
  },
};
