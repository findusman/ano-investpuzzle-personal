interface LoggerConfiguration {
  /**
   * The base name of the service
   */
  service: string;
  /**
   * Token used for authentication on loggly
   */
  logglyToken: string;
  /**
   * The subdomain address used to deliver logs to
   */
  logglySubdomain: string;

  tag: string;
}

export { LoggerConfiguration };
