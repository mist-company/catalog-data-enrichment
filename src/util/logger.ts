import pino from 'pino';
import { LOG_LEVEL } from '../config';

export const logger = pino({ name: 'catalog-data-enrichment', level: LOG_LEVEL });
