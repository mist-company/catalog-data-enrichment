export interface BaseQueueHelper {
  add(name: string, data: unknown): Promise<void>;
}

export const BaseQueueHelper = Symbol.for('BaseQueueHelper');
