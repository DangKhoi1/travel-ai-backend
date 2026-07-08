import { DataSource } from 'typeorm';
import { seedTravelPlaces } from './travelplace.seed';

export async function runSeeds(dataSource: DataSource): Promise<void> {
  console.log('Starting database seeding...\n');

  await seedTravelPlaces(dataSource);

  console.log('\nAll seeds completed successfully!');
}
