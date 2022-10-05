import { expressSession, promisifyStore } from 'next-session/lib/compat';

import Redis from 'ioredis';
import RedisStoreFactory from 'connect-redis';
import nextSession from 'next-session';

const RedisStore = RedisStoreFactory(expressSession);
export const getSession = nextSession({
  store: promisifyStore(
    new RedisStore({
      client: new Redis(),
    }),
  ),
});
