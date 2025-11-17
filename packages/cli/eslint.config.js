import { configs } from "@mkizka/eslint-config";

export default [
  ...configs.typescript(),
  {
    rules: {
      "no-console": "off",
    },
  },
];
