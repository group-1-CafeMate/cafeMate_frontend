import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn", // 或者 "off" 如果完全不想檢查
        {
          vars: "all", // 檢查所有變數
          varsIgnorePattern: "^_", // 忽略以 `_` 開頭的變數
          args: "after-used", // 只檢查未被使用的參數
          argsIgnorePattern: "^_", // 忽略參數名稱以 `_` 開頭的情況
        },
      ],
    },
  },
];

export default eslintConfig;
