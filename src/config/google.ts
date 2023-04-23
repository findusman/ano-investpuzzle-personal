import Env from "./env";

export const WEB_CLIENT_ID = {
  dev: "1020864651842-0189sp4hruasjmdl40i0gafgvru5riim.apps.googleusercontent.com",
  testing: "1020864651842-0189sp4hruasjmdl40i0gafgvru5riim.apps.googleusercontent.com",
  staging: "1020864651842-0189sp4hruasjmdl40i0gafgvru5riim.apps.googleusercontent.com",
  prod: "1020864651842-0189sp4hruasjmdl40i0gafgvru5riim.apps.googleusercontent.com",
}[Env.APP_ENV];
