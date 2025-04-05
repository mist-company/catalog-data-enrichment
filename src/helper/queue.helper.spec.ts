import { Queue } from 'bullmq';
import { QueueHelper } from './queue.helper';

const queueAddMock = jest.fn();

jest.mock('bullmq', () => {
  return {
    Queue: jest.fn().mockImplementation(() => {
      return {
        add: queueAddMock,
      };
    }),
  };
});

jest.mock('../config', () => ({
  CATALOG_ENRICHMENT_QUEUE_NAME: 'catalog-enrichment-queue',
  REDIS_URL: 'redis://some-redis-url:6379',
}));

describe('QueueHelper', () => {
  it('calls Queue constructor', () => {
    new QueueHelper();
    expect(Queue).toHaveBeenCalledWith('catalog-enrichment-queue', {
      connection: { url: 'redis://some-redis-url:6379' },
    });
  });

  it('call queue add method', async () => {
    const queueHelper = new QueueHelper();
    await queueHelper.add('test', { test: 'data' });
    expect(queueAddMock).toHaveBeenCalledWith('test', { test: 'data' });
    expect(queueAddMock).toHaveBeenCalledTimes(1);
  });
});
