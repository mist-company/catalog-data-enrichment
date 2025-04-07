export type LoggerArgs = [string, object] | [object, string] | [object] | [string];
export type LoggerHelperMeta = {
  component: string;
};

export interface BaseLoggerHelper {
  info(...args: LoggerArgs): void;
  error(...args: LoggerArgs): void;
  debug(...args: LoggerArgs): void;
  child(meta?: LoggerHelperMeta): BaseLoggerHelper;
}

export const BaseLoggerHelper = Symbol('BaseLoggerHelper');
export const LoggerHelperMeta = Symbol('LoggerHelperMeta');
