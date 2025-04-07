import { MongoClient } from 'mongodb';
import { DatabaseHelper } from './database.helper';
import { container } from 'tsyringe';

const connectMock = jest.fn();
const closeMock = jest.fn();
const collectionMock = jest.fn();
const dbMock = jest.fn().mockReturnValue({
  collection: collectionMock,
});

jest.mock('mongodb', () => {
  const MongoClient = jest.fn().mockImplementation(() => {
    return {
      connect: connectMock,
      db: dbMock,
      close: closeMock,
    };
  });
  return { MongoClient };
});

jest.mock('../config', () => ({
  DB_URL: 'mongodb://some-mongo-url:27017',
  DB_NAME: 'test-db',
  LOG_LEVEL: 'debug',
}));

function makeSut() {
  const sut = container.resolve(DatabaseHelper);
  return { sut };
}

describe('DatabaseHelper', () => {
  it('calls MongoClient constructor', async () => {
    makeSut();
    expect(MongoClient).toHaveBeenCalledWith('mongodb://some-mongo-url:27017');
  });

  it('connects to the database when getCollection is called', async () => {
    const { sut } = makeSut();
    await sut.getCollection('test-collection');
    await sut.getCollection('test-collection');
    expect(connectMock).toHaveBeenCalledTimes(1);
  });

  it('closes the connection when disconnect is called', async () => {
    const { sut } = makeSut();
    await sut.disconnect();
    expect(closeMock).toHaveBeenCalled();
  });

  it('calls MongoClient db method', async () => {
    const { sut } = makeSut();
    await sut.getCollection('test-collection');
    expect(dbMock).toHaveBeenCalledWith('test-db');
  });

  it('calls MongoClient collection method', async () => {
    const { sut } = makeSut();
    await sut.getCollection('test-collection');
    expect(collectionMock).toHaveBeenCalledWith('test-collection');
  });

  it('returns the collection from getCollection', async () => {
    const { sut } = makeSut();
    const collection = await sut.getCollection('test-collection');
    expect(collection).toBe(collectionMock());
  });
});
