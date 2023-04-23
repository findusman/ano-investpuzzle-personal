import { EnvType } from "_app/enums";

export default {
  JWT_SECRET: process.env.JWT_SECRET,
  MONGO_PATH: process.env.MONGO_PATH,
  PORT: process.env.PORT,
  ENABLE_FULL_LOG: process.env.ENABLE_FULL_LOG,
  LOGGLY_TOKEN: process.env.LOGGLY_TOKEN,
  LOGGLY_SUBDOMAIN: process.env.LOGGLY_SUBDOMAIN,
  APP_ENV: process.env.APP_ENV as EnvType,
  FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
  FIREBASE_PUSH_API_KEY: process.env.FIREBASE_PUSH_API_KEY,
  FIREBASE_AUTH_SIGNER_KEY: process.env.FIREBASE_AUTH_SIGNER_KEY,
  FIREBASE_AUTH_SALT_SEPARTOR: process.env.FIREBASE_AUTH_SALT_SEPARTOR,
  AWS_ACCESS_KEY: process.env.AWS_ACCESS_KEY,
  AWS_SECRET_KEY: process.env.AWS_SECRET_KEY,
  AWS_REGION: process.env.AWS_REGION,
  FMP_API_KEY: process.env.FMP_API_KEY,
  STOCK_NEWS_API_KEY: process.env.STOCK_NEWS_API_KEY,
};
