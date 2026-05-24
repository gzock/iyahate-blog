import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  ...nextVitals,
  {
    ignores: [".open-next/**", ".vercel/**"],
  },
];

export default eslintConfig;
