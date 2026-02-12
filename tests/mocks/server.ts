import { setupServer } from 'msw/node';
import { handlers } from './handlers';

/**
 * MSW Server for Node.js environment (testing)
 */
export const server = setupServer(...handlers);
