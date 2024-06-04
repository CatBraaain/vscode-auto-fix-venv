module.exports = {
  extends: ["alloy", "alloy/typescript"],
  env: {
    node: true,
  },
  globals: {},
  rules: {
    "max-params": [0, 3],
    "@typescript-eslint/no-unused-vars": [0],
    "@typescript-eslint/member-ordering": [0],
  },
};
