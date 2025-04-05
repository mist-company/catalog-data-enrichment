import pino from 'pino';
import { LoggerHelper } from './logger.helper';

const infoMock = jest.fn();
const errorMock = jest.fn();
const debugMock = jest.fn();
const childMock = jest.fn().mockImplementation(() => ({
  info: infoMock,
  error: errorMock,
  debug: debugMock,
}));

jest.mock('pino', () => {
  return jest.fn().mockImplementation(() => {
    return { child: childMock };
  });
});

jest.mock('../config', () => ({
  LOG_LEVEL: 'some-log-level',
}));

describe('LoggerHelper', () => {
  it('calls pino constructor', () => {
    new LoggerHelper();
    expect(pino).toHaveBeenCalledWith({
      name: 'catalog-data-enrichment',
      level: 'some-log-level',
    });
  });

  it('calls child method with meta', () => {
    const meta = { foo: 'bar' };
    new LoggerHelper(meta);
    expect(childMock).toHaveBeenCalledWith(meta);
  });

  it('calls child method without meta', () => {
    new LoggerHelper();
    expect(childMock).toHaveBeenCalledWith({});
  });

  it('calls info method', () => {
    const logger = new LoggerHelper();
    logger.info({ foo: 'bar' }, 'message');
    logger.info('message', { foo: 'bar' });
    logger.info('message');
    logger.info({ foo: 'bar' });
    expect(infoMock.mock.calls).toEqual([
      [{ foo: 'bar' }, 'message'],
      ['message', { foo: 'bar' }],
      ['message'],
      [{ foo: 'bar' }],
    ]);
    expect(infoMock).toHaveBeenCalledTimes(4);
  });

  it('calls error method', () => {
    const logger = new LoggerHelper();
    logger.error({ foo: 'bar' }, 'message');
    logger.error('message', { foo: 'bar' });
    logger.error('message');
    logger.error({ foo: 'bar' });
    expect(errorMock.mock.calls).toEqual([
      [{ foo: 'bar' }, 'message'],
      ['message', { foo: 'bar' }],
      ['message'],
      [{ foo: 'bar' }],
    ]);
    expect(errorMock).toHaveBeenCalledTimes(4);
  });

  it('calls debug method', () => {
    const logger = new LoggerHelper();
    logger.debug({ foo: 'bar' }, 'message');
    logger.debug('message', { foo: 'bar' });
    logger.debug('message');
    logger.debug({ foo: 'bar' });
    expect(debugMock.mock.calls).toEqual([
      [{ foo: 'bar' }, 'message'],
      ['message', { foo: 'bar' }],
      ['message'],
      [{ foo: 'bar' }],
    ]);
    expect(debugMock).toHaveBeenCalledTimes(4);
  });

  it('calls child method', () => {
    const logger = new LoggerHelper();
    const childLogger = logger.child({ foo: 'bar' });
    expect(childMock).toHaveBeenCalledWith({ foo: 'bar' });
    expect(childLogger).toBeInstanceOf(LoggerHelper);
  });

  it('calls child method without meta', () => {
    const logger = new LoggerHelper();
    const childLogger = logger.child();
    expect(childMock).toHaveBeenCalledWith({});
    expect(childLogger).toBeInstanceOf(LoggerHelper);
  });
});
