import sinon from "sinon";
import { ALBResult, ALBEvent } from "aws-lambda";
import { Router } from ".";
import {
  RouterRequest,
  Route,
  RouterRequestFactory,
  RouterResultFactory,
  BaseRequest,
  HttpMethod,
} from "./types";
import { normalizePath } from "./util";

describe("router routes correctly", () => {
  const requestFactory: RouterRequestFactory<ALBEvent> = (event, paramFn) => {
    const modifiedPath = normalizePath(event.path);
    const params = paramFn(modifiedPath);
    return {
      params,
      path: modifiedPath,
      headers: event.headers ?? {},
      multiValueHeaders: event.multiValueHeaders ?? {},
      query: event.queryStringParameters,
      method: event.httpMethod.toUpperCase() as unknown as HttpMethod,
      requestContext: event.requestContext,
    };
  };
  const resultFactory: RouterResultFactory<ALBResult> = res => {
    return res;
  };
  const pathMethodGetter = (r: ALBEvent): BaseRequest => {
    return {
      httpMethod: r.httpMethod.toUpperCase() as HttpMethod,
      path: normalizePath(r.path),
    };
  };

  const syncHandler = sinon.stub().returns({
    statusCode: 418,
  } as ALBResult);
  const asyncHandler = sinon.stub().resolves({
    statusCode: 204,
  });
  const failSyncHandler = sinon.stub().throws("test error");
  const failAsyncHandler = sinon.stub().rejects("test rejection");
  const paramsSyncHandler = sinon.stub().resolves({
    statusCode: 100,
  });
  const routes: Route[] = [
    {
      matcher: "/sync",
      type: "sync",
      methods: ["GET"],
      handler: syncHandler,
    },
    {
      matcher: "/async",
      type: "async",
      methods: ["GET"],
      handler: asyncHandler,
    },
    {
      matcher: "/sync/fail",
      type: "sync",
      methods: ["GET"],
      handler: failSyncHandler,
    },
    {
      matcher: "/async/fail",
      type: "async",
      methods: ["GET"],
      handler: failAsyncHandler,
    },
    {
      matcher: "/sync/{test1}/{param}/{underscore_param}",
      type: "sync",
      methods: ["GET"],
      handler: paramsSyncHandler,
    },
    {
      matcher: "/sync-optional/{test1}/{param}/{underscore_param?}",
      type: "sync",
      methods: ["GET"],
      handler: paramsSyncHandler,
    },
  ];
  const router = new Router(pathMethodGetter, requestFactory, resultFactory, routes);
  const requestContext = {
    elb: {
      targetGroupArn: "",
    },
  };
  beforeEach(() => {
    syncHandler.resetHistory();
    asyncHandler.resetHistory();
    failSyncHandler.resetHistory();
    failAsyncHandler.resetHistory();
    paramsSyncHandler.resetHistory();
  });
  it("sync handler - valid method", async () => {
    const result = await router.exec(
      {
        httpMethod: "get",
        path: "/sync",
        requestContext,
        isBase64Encoded: false,
        body: null,
      },
      requestContext
    );
    expect(syncHandler.calledOnce).toEqual(true);
    expect(result).toEqual({
      statusCode: 418,
    });
  });
  it("async handler", async () => {
    const result = await router.exec(
      {
        httpMethod: "get",
        path: "/async",
        requestContext,
        isBase64Encoded: false,
        body: null,
      },
      requestContext
    );
    expect(asyncHandler.calledOnce).toEqual(true);
    expect(result).toEqual({
      statusCode: 204,
    });
  });
  it("sync handler - invalid method", async () => {
    const result = await router.exec(
      {
        httpMethod: "post",
        path: "/sync",
        requestContext,
        isBase64Encoded: false,
        body: null,
      },
      requestContext
    );
    expect(syncHandler.calledOnce).toEqual(false);
    const expectedAlbResult: ALBResult = {
      body: JSON.stringify({ message: "Cannot POST /sync" }),
      statusCode: 404,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    };
    expect(result).toEqual(expectedAlbResult);
  });

  it("sync handler - throws error in handler", async () => {
    const event = {
      httpMethod: "get",
      path: "/sync/fail",
      requestContext,
      isBase64Encoded: false,
      body: null,
    };
    const result = await router.exec(event, requestContext);
    expect(failSyncHandler.calledOnce).toEqual(true);
    const expectedAlbResult: ALBResult = {
      body: JSON.stringify({
        error: {
          name: "test error",
        },
        event,
        context: requestContext,
      }),
      statusCode: 500,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    };
    expect(result).toEqual(expectedAlbResult);
  });
  it("async handler - throws error in handler", async () => {
    const event = {
      httpMethod: "get",
      path: "/async/fail",
      requestContext,
      isBase64Encoded: false,
      body: null,
    };
    const result = await router.exec(event, requestContext);
    expect(failAsyncHandler.calledOnce).toEqual(true);
    const expectedAlbResult: ALBResult = {
      body: JSON.stringify({
        error: {
          name: "test rejection",
        },
        event,
        context: requestContext,
      }),
      statusCode: 500,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    };
    expect(result).toEqual(expectedAlbResult);
  });
  it("invalid path", async () => {
    const result = await router.exec(
      {
        httpMethod: "get",
        path: "/sync/test-endpoint",
        requestContext,
        isBase64Encoded: false,
        body: null,
      },
      requestContext
    );
    expect(syncHandler.calledOnce).toEqual(false);
    const expectedAlbResult: ALBResult = {
      body: JSON.stringify({ message: "Cannot GET /sync/test-endpoint" }),
      statusCode: 404,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    };
    expect(result).toEqual(expectedAlbResult);
  });
  it("sync handler - with params", async () => {
    const result = await router.exec(
      {
        httpMethod: "get",
        path: "/sync/foo/bar/1",
        requestContext,
        isBase64Encoded: false,
        body: null,
      },
      requestContext
    );
    expect(paramsSyncHandler.calledOnce).toEqual(true);
    // eslint-disable-next-line camelcase
    const firstArg: RouterRequest<{ test1: string; param: string; underscore_param: string }> =
      paramsSyncHandler.firstCall.args[0];
    const { params } = firstArg;
    expect(params.test1).toEqual("foo");
    expect(params.param).toEqual("bar");
    expect(params.underscore_param).toEqual("1");
    expect(result).toEqual({
      statusCode: 100,
    });
  });
  it("sync handler - with optional params", async () => {
    const result = await router.exec(
      {
        httpMethod: "get",
        path: "/sync-optional/foo/bar",
        requestContext,
        isBase64Encoded: false,
        body: null,
      },
      requestContext
    );
    expect(paramsSyncHandler.calledOnce).toEqual(true);
    // eslint-disable-next-line camelcase
    const firstArg: RouterRequest<{ test1: string; param: string; underscore_param: string }> =
      paramsSyncHandler.firstCall.args[0];
    const { params } = firstArg;
    expect(params.test1).toEqual("foo");
    expect(params.param).toEqual("bar");
    expect(params.underscore_param).toEqual(undefined);
    expect(result).toEqual({
      statusCode: 100,
    });
  });
});
