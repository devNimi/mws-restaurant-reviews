module.exports = {
    "extends": "google",
    "parserOptions": {
        "ecmaVersion": 6
    },
    rules:{
      "linebreak-style": 0,
      "ignoreComments": true,
      "ignoreUrls": true,
      "ignoreStrings": true ,
      "ignoreTrailingComments": true,
      "max-len": [0, 80, 2],
      "require-jsdoc": ["error", {
              "require": {
                  "FunctionDeclaration": false,
                  "MethodDefinition": false,
                  "ClassDeclaration": false,
                  "ArrowFunctionExpression": false,
                  "FunctionExpression": false
              }}
      ]
      // "valid-jsdoc": ["error", {
      //     "requireParamDescription": false,
      //     "requireReturn": false,
      //     "requireReturnType": false,
      //     "requireReturnDescription": false,
      //     "requireParamType": false
      //   }
      // ],
    }
};
