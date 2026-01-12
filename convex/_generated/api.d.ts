/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as github from "../github.js";
import type * as sensors_codebaseAge from "../sensors/codebaseAge.js";
import type * as sensors_dal from "../sensors/dal.js";
import type * as sensors_ingest from "../sensors/ingest.js";
import type * as sensors_pulse from "../sensors/pulse.js";
import type * as sensors_timeSink from "../sensors/timeSink.js";
import type * as sensors_truckFactor from "../sensors/truckFactor.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  github: typeof github;
  "sensors/codebaseAge": typeof sensors_codebaseAge;
  "sensors/dal": typeof sensors_dal;
  "sensors/ingest": typeof sensors_ingest;
  "sensors/pulse": typeof sensors_pulse;
  "sensors/timeSink": typeof sensors_timeSink;
  "sensors/truckFactor": typeof sensors_truckFactor;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
