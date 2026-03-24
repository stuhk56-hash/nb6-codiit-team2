# codi-it-backend

Shopping mall application backend

## Getting Started

### Prerequisites

- Node.js
- npm

### Installing

```bash
npm install
```

### Running the application

```bash
npm run db:setup
npm run start:dev
```

`DATABASE_URL` in `.env` points to `postgresql://apple@localhost:5432/codiit`, so the development database must be started and migrated before the app can read schema metadata.

### Development database

```bash
npm run db:up
npm run db:migrate
npm run prisma:generate
```

Reset and recreate the local development database with:

```bash
npm run db:reset
npm run db:migrate
```

### Test database

```bash
npm run test:db:up
dotenv -e .env.test -- npm run prisma:migrate:deploy
npm run test:auth:e2e
```

Stop and remove the test database with:

```bash
npm run test:db:down
```

If Docker is unavailable on macOS with Homebrew PostgreSQL installed, use:

```bash
npm run test:db:up:local
dotenv -e .env.test -- npm run prisma:migrate:deploy
npm run test:auth:e2e
```

## Available Scripts

- `build`: Compiles the TypeScript code.
- `start`: Starts the application.
- `start:dev`: Starts the application in development mode with watch.
- `test`: Runs the tests.
- `test:watch`: Runs the tests in watch mode.
- `test:cov`: Generates a test coverage report.
