import { ALBResult } from "aws-lambda";
import { IncomingHttpHeaders } from "http";
import { JsonResponseOptions } from "./types";

export function assertNever(value: never, errorMessage?: string): never {
  throw new Error(errorMessage || `Unexpected value: ${String(value)}`);
}

export function iterN<T>(n: number, callback: (i: number) => T): T[] {
  const results: T[] = [];
  for (let i = 0; i < n; i++) {
    const result = callback(i);
    results.push(result);
  }
  return results;
}
export function uppercaseFirst(str: string): string {
  return `${str[0].toUpperCase()}${str.slice(1)}`;
}
export function uppercaseAllFirstLetters(str: string): string {
  const words = str.split(" ");
  return words.map(uppercaseFirst).join(" ");
}
export function splitHeaders(headers: IncomingHttpHeaders): {
  headers: { [key: string]: string | undefined };
  multiValueHeaders: { [key: string]: string[] | undefined };
} {
  const singleHeaders: { [key: string]: string | undefined } = {};
  const multiValueHeaders: { [key: string]: string[] | undefined } = {};
  Object.entries(headers).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      multiValueHeaders[key] = value;
    } else {
      singleHeaders[key] = value;
    }
  });
  return {
    multiValueHeaders,
    headers: singleHeaders,
  };
}
export function normalizePath(path: string): string {
  let newPath = path.trim();
  if (newPath.endsWith("/")) {
    newPath = newPath.substring(0, newPath.length - 1);
  }
  return newPath;
}
export function createJsonResponse<T extends object>(
  obj: T,
  options?: JsonResponseOptions
): ALBResult {
  const { statusCode, headers } = options ?? {};
  const body = JSON.stringify(obj);
  return {
    statusCode: statusCode ?? 200,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...headers,
    },
    body,
  };
}
