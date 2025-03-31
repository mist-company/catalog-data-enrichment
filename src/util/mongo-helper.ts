import { MongoClient } from 'mongodb';
import { DB_NAME, DB_URL } from '../config';

export class MongoHelper {
  private readonly client: MongoClient;
  private isConnected = false;

  constructor() {
    this.client = new MongoClient(DB_URL);
  }

  async getCollection(collectionName: string) {
    if (!this.isConnected) {
      await this.client.connect();
      this.isConnected = true;
    }
    return this.client.db(DB_NAME).collection(collectionName);
  }

  async disconnect() {
    await this.client.close();
    this.isConnected = false;
  }
}
