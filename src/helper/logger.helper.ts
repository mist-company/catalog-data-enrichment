/* eslint-disable prefer-spread */
import pino from 'pino';
import { LOG_LEVEL } from '../config';
import { inject, injectable } from 'tsyringe';

type LoggerArgs = [string, object] | [object, string] | [object] | [string];

@injectable()
export class LoggerHelper {
  readonly #logger: pino.Logger;

  constructor(@inject('LoggerMeta') meta?: object) {
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

  child(meta?: object): LoggerHelper {
    return new LoggerHelper({ ...meta });
  }
}
