export default () => {
  return {
    env: process.env.NODE_ENV,
    port: parseInt(process.env.PORT, 10) || 3000,
    jwt: {
      public: process.env.JWT_PUBLIC_KEY,
    },
    user: {
      password: process.env.USER_PASSWORD,
    },
    database: {
      client: process.env.DATABASE_CLIENT,
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT ?? '', 10) || 5432,
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD || '',
      name: process.env.DATABASE_NAME,
      synchronize: process.env.DATABASE_SYNCHRONIZE === 'true',
      logging: process.env.DATABASE_LOGGING === 'true',
    },
  };
};
