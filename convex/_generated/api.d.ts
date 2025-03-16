/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as episodes from "../episodes.js";
import type * as podcasts from "../podcasts.js";
import type * as rss from "../rss.js";
import type * as utils_ai from "../utils/ai.js";
import type * as utils_r2 from "../utils/r2.js";
import type * as utils_s3 from "../utils/s3.js";
import type * as utils_xml from "../utils/xml.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  episodes: typeof episodes;
  podcasts: typeof podcasts;
  rss: typeof rss;
  "utils/ai": typeof utils_ai;
  "utils/r2": typeof utils_r2;
  "utils/s3": typeof utils_s3;
  "utils/xml": typeof utils_xml;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
