import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { runSeeds } from './seeds';

config();

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5433'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_NAME || 'travel_ai',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: true,
});

async function main() {
  try {
    await dataSource.initialize();
    console.log('Database connected!\n');

    await runSeeds(dataSource);

    await dataSource.destroy();
    console.log('\nDatabase connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
}

void main();
