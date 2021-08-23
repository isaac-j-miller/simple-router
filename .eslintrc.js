module.exports = {
  env: {
    es6: true,
  },
  extends: [
    "eslint-config-airbnb-base",
  ],
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly",
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: false,
    },
    ecmaVersion: 2019,
    sourceType: "module",
    project: "./tsconfig.eslint.json",
    extraFileExtensions: [".json"],
  },
  plugins: [ "@typescript-eslint", "no-only-tests"],
  settings: {
    "import/parsers": {
      "@typescript-eslint/parser": [".ts", ".tsx"],
    },
    "import/resolver": {
      typescript: {
        alwaysTryTypes: true,
        project: ["./tsconfig.eslint.json"],
      },
    },
  },
  rules: {
    quotes: ["error", "double", { avoidEscape: true }],
    "no-restricted-imports": [
      "error",
      {
        paths: [],
      },
    ],
    "import/no-restricted-paths": [],
    "import/no-named-as-default-member": 0,
    // Disabled while typing because it's slow - should be enabled in eslintrc-build
    "import/no-cycle": ["error", { ignoreExternal: false, maxDepth: "∞" }],
    "import/named": 2,

    // always act like posix
    "linebreak-style": 0,
    "no-use-before-define": ["error", { functions: false, classes: true }],
    // allow idiomatic "&&/||" statements"
    "no-unused-expressions": ["error", { allowShortCircuit: true }],

    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "(^_|^T|^U)",
        varsIgnorePattern: "(^_|^T|^U)",
        ignoreRestSiblings: true,
      },
    ],
    "@typescript-eslint/array-type": [
      2,
      {
        default: "array-simple",
      },
    ],
    "@typescript-eslint/consistent-type-assertions": [
      2,
      { assertionStyle: "as", objectLiteralTypeAssertions: "allow-as-parameter" },
    ],
    "no-shadow": "error",
    "@typescript-eslint/await-thenable": 2,
    "@typescript-eslint/require-await": 2,
    "no-return-await": 0,
    "@typescript-eslint/return-await": 2,
    "@typescript-eslint/no-misused-promises": 2,
    "@typescript-eslint/promise-function-async": 2,
    "no-useless-constructor": 0,
    "@typescript-eslint/no-useless-constructor": "error",
    "no-empty-function": 0,
    "no-console": 0,
    "@typescript-eslint/no-empty-function": "error",

    /// BELOW HERE ONLY DISABLE RULES

    // Rules that are redundant with TypeScript
    "no-unused-vars": 0,
    "no-undef": 0,
    "consistent-return": 0,
    "no-useless-return": 0,
    "symbol-description": 0,
    "import/extensions": 0,
    "import/no-unresolved": 0,
    "import/no-extraneous-dependencies": 0,
    "import/prefer-default-export": 0,
    "no-dupe-class-members": 0,

    // it thinks that overloading functions is redeclaring
    "no-redeclare": 0,

    // Rules where we differ from airbnb

    "no-cond-assign": 0,
    // rule is too aggressive; string templates don't always make sense
    "prefer-template": 0,
    // disagree with this rule; creating a new symbol when transforming an argument
    // can result in bugs by accidentally using the unprocessed input arg
    "no-param-reassign": 0,
    // sometime this makes it easier to follow logic branches
    "no-lonely-if": 0,
    // arrow callback syntax is bad inline when you want to have a return type
    "prefer-arrow-callback": 0,
    // allow for/in
    "no-restricted-syntax": 0,
    // allow anonymous functions
    "func-names": 0,
    // really?
    "max-classes-per-file": 0,
    // too broad
    "prefer-destructuring": 0,
    // I think TS can decide what's valid
    "no-use-before-define": 0,
    // "void" is needed to mark intentionally unhandled promises with
    "no-void": 0,

    // things that probably should be checked for app code but not build code
    "import/no-dynamic-require": 0,
    "import/newline-after-import": 0,

    // things that prettier handles
    "generator-star-spacing": 0,
    "arrow-parens": [2, "as-needed"],
    "max-len": 0,
    "comma-dangle": 0,
    "object-curly-newline": 0,
    "implicit-arrow-linebreak": 0,
    "function-paren-newline": 0,
    "no-underscore-dangle": 0,
    "arrow-body-style": 0,
    "space-before-function-paren": 0,
    "no-multi-spaces": 0,
    "no-multiple-empty-lines": 0,
    "arrow-spacing": 0,
    "space-infix-ops": 0,
    "keyword-spacing": 0,
    "object-curly-spacing": 0,
    "comma-spacing": 0,
    "space-in-parens": 0,
    "no-trailing-spaces": 0,
    "eol-last": 0,
    "quote-props": 0,
    semi: 0,
    indent: 0,
    "newline-per-chained-call": 0,
    "no-confusing-arrow": 0,
    "brace-style": 0,

    // rationale: sometimes methods are aggregated on a class for contextual reasons; even though a method could be
    // implemented as static it makes the API confusing to do so simply because it doesn't access a state property
    "class-methods-use-this": 0,
    // prettier doesn't handle this, but this is not always a good style
    "lines-between-class-members": 0,
    "no-plusplus": 0,
    "wrap-iife": 0,
    "operator-linebreak": 0,
    // this doesn't let you have "return" right after a fat-arrow function description, e.g. should
    // remove braces/return and put value directly. I think usually good style but can make confusing code
    // e.g. if returning another function? discuss
    "arrow-body-style": 0,
    // // from airbnb?
    "no-template-curly-in-string": 0,
    "padded-blocks": 0,

    "import/named": 2,
    "@typescript-eslint/no-floating-promises": 2,
    "no-only-tests/no-only-tests": 2,
  },
};
