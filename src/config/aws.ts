import { Env } from ".";

export const BUCKETS = {
  FILE: {
    dev: "investpuzzle",
    testing: "investpuzzle",
    staging: "investpuzzle",
    prod: "investpuzzle",
  }[Env.APP_ENV],
};
