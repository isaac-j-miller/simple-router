import { ALBEvent, ALBEventRequestContext } from "aws-lambda";

export type RouterRequestFactory<T> = (
  req: T,
  paramFn: <U extends string>(path: string) => Params<U>
) => RouterRequest;
export type RouterResultFactory<T> = (res: RouterResult) => T;
export type BaseRequest = {
  path: string;
  httpMethod: HttpMethod;
};
export type JsonResponseOptions = {
  statusCode?: number;
  headers?: { [header: string]: boolean | number | string } | undefined;
};

export type RouterRequest<
  TParams extends Params<any> = any,
  TQuery extends ALBEvent["queryStringParameters"] = any,
  TBody extends object = any
> = {
  params: TParams;
  path: string;
  query: TQuery;
  body?: TBody;
  method: HttpMethod;
  headers: { [header: string]: string | undefined };
  multiValueHeaders: { [header: string]: string[] | undefined };
  requestContext: ALBEventRequestContext;
};

export type RouterResult = {
  statusCode: number;
  statusDescription?: string | undefined;
  headers?: { [header: string]: boolean | number | string } | undefined;
  multiValueHeaders?: { [header: string]: Array<boolean | number | string> } | undefined;
  body?: string | undefined;
  isBase64Encoded?: boolean | undefined;
};

export type AsyncHandlerFunction = (event: RouterRequest) => Promise<RouterResult>;
export type HandlerFunction = (event: RouterRequest) => RouterResult;
export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
export type Route = {
  matcher: string;
  methods: HttpMethod[];
} & (
  | {
      type: "async";
      handler: AsyncHandlerFunction;
    }
  | {
      type: "sync";
      handler: HandlerFunction;
    }
);
export type Params<T extends string> = {
  [k in T]: string;
};
export type RouteTransform<T extends Params<any>> = {
  matcher: RegExp;
  paramFn: (path: string) => T;
};
