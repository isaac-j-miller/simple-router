import { createJsonResponse, assertNever } from "src/util";
import {
  BaseRequest,
  Params,
  Route,
  RouterRequestFactory,
  RouterResult,
  RouterResultFactory,
  RouteTransform,
} from "src/types";

const trim = (str: string, start: string, end: string): string => {
  if (str[0] === start) {
    str = str.substr(start.length);
  }
  if (str[str.length - 1] === end) {
    str = str.substr(0, str.length - end.length);
  }
  return str;
};

export function transformRoute<T extends string>(matcher: string): RouteTransform<Params<T>> {
  const paramCaptureRegex = /(?:{([a-z]|[A-Z]|[0-9]|-|_)+})/g;
  const optionalParamCaptureRegex = /(?:{(?:[a-z]|[A-Z]|[0-9]|-|_)+(?:\?)})/g;
  const paramValueRegex = "(?:[a-z]|[A-Z]|[0-9]|\\.|-|_|~|!|\\$|&|'|\\(|\\)|\\*|\\+|,|;|=|:|@)+/";
  const optionalParamValueRegex =
    "?(?:[a-z]|[A-Z]|[0-9]|\\.|-|_|~|!|\\$|&|'|\\(|\\)|\\*|\\+|,|;|=|:|@)*";
  const matches = matcher.match(paramCaptureRegex);
  const optionalMatches = matcher.match(optionalParamCaptureRegex);
  if (!matches && !optionalMatches) {
    return {
      matcher: new RegExp(`^\\${matcher}$`),
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      paramFn: () => ({} as Params<T>),
    };
  }
  const positionsToReplace = matcher.split("/");
  const indices: { [key: number]: string } = {};
  if (matches) {
    matches.forEach(match => {
      const index = positionsToReplace.indexOf(match);
      if (index !== -1) {
        positionsToReplace[index] = paramValueRegex;
        indices[index] = trim(match, "{", "}");
      }
    });
  }
  if (optionalMatches) {
    optionalMatches.forEach(match => {
      const index = positionsToReplace.indexOf(match);
      if (index !== -1) {
        positionsToReplace[index] = optionalParamValueRegex;
        indices[index] = trim(match, "{", "?}");
      }
    });
  }
  const newMatcher = new RegExp(
    `^\\/${positionsToReplace
      .filter(p => !!p)
      .map(p => trim(p, "/", "/"))
      .join("\\/")}$`
  );
  const paramFn = (path: string) => {
    const split = path.split("/");
    const v = {} as unknown as Params<T>;
    split.forEach((elem, i) => {
      if (indices[i]) {
        const key = indices[i];
        v[key as T] = elem;
      }
    });
    return v;
  };
  return {
    matcher: newMatcher,
    paramFn,
  };
}
export class Router<T, U, V> {
  constructor(
    private pathMethodGetter: (req: T) => BaseRequest,
    private requestFactory: RouterRequestFactory<T>,
    private resultFactory: RouterResultFactory<U>,
    private routes: Route[]
  ) {}
  async exec(event: T, context: V): Promise<U> {
    const result = await this.execInternal(event, context);
    return this.resultFactory(result);
  }
  private async execInternal(event: T, context: V): Promise<RouterResult> {
    const { httpMethod: method, path } = this.pathMethodGetter(event);
    try {
      console.info(`Routing request: ${path}`);
      for await (const route of this.routes) {
        const { matcher, paramFn } = transformRoute(route.matcher);
        if (matcher.test(path) && route.methods.includes(method)) {
          const request = this.requestFactory(event, paramFn);
          if (route.type === "sync") {
            return route.handler(request);
          }
          if (route.type === "async") {
            const value = await route.handler(request);
            return value;
          }
          assertNever(route);
        }
      }
      return createJsonResponse(
        {
          message: `Cannot ${method} ${path}`,
        },
        {
          statusCode: 404,
        }
      );
    } catch (err) {
      return createJsonResponse(
        {
          error: err,
          event,
          context,
        },
        {
          statusCode: 500,
        }
      );
    }
  }
}
