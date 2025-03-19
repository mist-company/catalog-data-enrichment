import { MongoClient } from 'mongodb';

export class MongoHelper {
  private readonly client: MongoClient;
  private isConnected = false;

  constructor() {
    this.client = new MongoClient(process.env.MONGO_URL);
  }

  async getCollection(dbName: string, collectionName: string) {
    if (!this.isConnected) {
      await this.client.connect();
      this.isConnected = true;
    }
    return this.client.db(dbName).collection(collectionName);
  }

  async disconnect() {
    await this.client.close();
    this.isConnected = false;
  }
}
