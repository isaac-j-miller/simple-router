[![PR-CI](https://github.com/isaac-j-miller/simple-router/actions/workflows/check.yaml/badge.svg)](https://github.com/isaac-j-miller/simple-router/actions/workflows/check.yaml)

# Router API

Due to the fact that the whole service is hosted in a lambda, rather than in a docker container,
express does not actually run in production. Instead, a custom router implementation mimicking
express was used. This was necessary because the lambda itself does not send or receive HTTP
requests/responses. Instead, the request is passed to the lambda by the ALB as an event, and the
lambda must return the response object to the ALB, which sends this as an HTTP response.

Routes are specified in `src/index.ts`, where path parameters are specified using the following
syntax: `/base-path/{required_param}/{optional_param?}`. Path parameters are specified by enclosing
the parameter name in curly brackets. If a path parameter is optional, a question mark should
precede the closing curly bracket. An example has been provided below.

```typescript
// in your handler file under src/routes
type ExampleRequestParams = {
  foo: string;
  bar?: string;
};

export const exampleSyncHandlerFunction: HandlerFunction = (
  request: RouterRequest<ExampleRequestParams>
) => {
  const { foo, bar } = request;
  return createJsonResponse(
    {
      foo, // will be defined
      bar, // possibly undefined
    },
    {
      statusCode: 200, // default,
      headers: {
        myCustomHeader: "baz",
      },
    }
  );
};
// in src/index.ts:
// add the following entry to the Router constructor arg:
[
    ...,
    {
        matcher: "/your-route/{foo}/{bar?}",
        type: "sync",
        methods: ["GET"],
        handler: exampleSyncHandlerFunction
    }
]
```
