import { cleanEnv, port, str, num } from "envalid";

function validateEnv() {
  cleanEnv(process.env, {
    JWT_SECRET: str(),
    MONGO_PATH: str(),
    PORT: port(),
    ENABLE_FULL_LOG: num(),
    LOGGLY_TOKEN: str(),
    LOGGLY_SUBDOMAIN: str(),
    APP_ENV: str(),
    FIREBASE_API_KEY: str(),
    FIREBASE_AUTH_SIGNER_KEY: str(),
    FIREBASE_AUTH_SALT_SEPARTOR: str(),
    AWS_ACCESS_KEY: str(),
    AWS_SECRET_KEY: str(),
    AWS_REGION: str(),    
  });
}

export default validateEnv;
