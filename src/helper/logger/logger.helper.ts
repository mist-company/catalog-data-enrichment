/* eslint-disable prefer-spread */
import pino from 'pino';
import { LOG_LEVEL } from '../../config';
import { inject, injectable } from 'tsyringe';
import { BaseLoggerHelper, LoggerArgs, LoggerHelperMeta } from './base-logger.helper';

@injectable()
export class LoggerHelper implements BaseLoggerHelper {
  readonly #logger: pino.Logger;

  constructor(@inject(LoggerHelperMeta) meta?: LoggerHelperMeta) {
    this.#logger = pino({
      name: 'catalog-data-enrichment',
      level: LOG_LEVEL,
    }).child({ ...meta });
  }

  info(...args: LoggerArgs) {
    this.#logger.info.apply(this.#logger, args);
  }

  error(...args: LoggerArgs) {
    this.#logger.error.apply(this.#logger, args);
  }

  debug(...args: LoggerArgs) {
    this.#logger.debug.apply(this.#logger, args);
  }

  child(meta?: LoggerHelperMeta): LoggerHelper {
    return new LoggerHelper({ ...meta });
  }
}
