module.exports = {
  parser: "babel-eslint",
  extends: ["airbnb-base", "plugin:prettier/recommended"],
  plugins: ["prettier"],
  rules: {
    "prettier/prettier": "error"
  }
};
