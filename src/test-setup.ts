import 'reflect-metadata';
import { container } from 'tsyringe';
import { BaseLoggerHelper, LoggerHelperMeta } from './helper/logger/base-logger.helper';

class LoggerHelperMock implements BaseLoggerHelper {
  debug = jest.fn();
  info = jest.fn();
  error = jest.fn();
  child = jest.fn().mockReturnValue(this);
}

container
  .register(LoggerHelperMeta, { useValue: { component: 'test' } })
  .register(BaseLoggerHelper, LoggerHelperMock);
