// ESLint flat config (ESLint 10 / Next 16). Replaces .eslintrc.json.
// Mirrors the previous "next/core-web-vitals" + "next/typescript" setup.
import coreWebVitals from 'eslint-config-next/core-web-vitals'
import typescript from 'eslint-config-next/typescript'

export default [
  ...coreWebVitals,
  ...typescript,
  {
    ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts'],
  },
]
