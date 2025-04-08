import { MongoClient } from 'mongodb';
import { DB_NAME, DB_URL } from '../config';
import { inject, singleton } from 'tsyringe';
import { LoggerHelper } from './logger/logger.helper';
import { BaseLoggerHelper } from './logger/base-logger.helper';

@singleton()
export class DatabaseHelper {
  readonly #client: MongoClient;
  readonly #logger: LoggerHelper;
  #isConnected = false;

  constructor(@inject(BaseLoggerHelper) logger: LoggerHelper) {
    this.#client = new MongoClient(DB_URL);
    this.#logger = logger.child({ component: DatabaseHelper.name });
  }

  async getCollection(collectionName: string) {
    if (!this.#isConnected) {
      await this.#client.connect();
      this.#isConnected = true;
      this.#logger.debug({ collectionName }, 'connected to database');
    }
    return this.#client.db(DB_NAME).collection(collectionName);
  }

  async disconnect() {
    await this.#client.close();
    this.#isConnected = false;
    this.#logger.debug('disconnected from database');
  }
}
