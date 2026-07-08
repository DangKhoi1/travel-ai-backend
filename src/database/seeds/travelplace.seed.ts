import { DataSource } from 'typeorm';
import { TravelPlace } from '../../modules/travelplace/entities/travelplace.entity';

export const TRAVEL_PLACES_SEED = [
  {
    name: 'Vịnh Hạ Long',
    description: 'Di sản thiên nhiên thế giới với hàng ngàn hòn đảo đá vôi kỳ vĩ.',
    city: 'Hạ Long',
    country: 'Việt Nam',
    latitude: 20.9101,
    longitude: 107.1839,
    ticketPrice: 'Từ 200.000 VNĐ',
    category: 'Biển đảo',
    bestSeason: 'Mùa hè, Mùa thu',
    imageUrl: 'https://example.com/halong.jpg',
  },
  {
    name: 'Phố cổ Hội An',
    description: 'Khu phố cổ giữ nguyên nét kiến trúc và văn hóa từ thế kỷ 16.',
    city: 'Hội An',
    country: 'Việt Nam',
    latitude: 15.8801,
    longitude: 108.3380,
    ticketPrice: '120.000 VNĐ',
    category: 'Văn hóa - Lịch sử',
    bestSeason: 'Mùa xuân, Mùa hè',
    imageUrl: 'https://example.com/hoian.jpg',
  }
  // TODO: Bạn có thể thêm tiếp các địa điểm khác vào đây
];

export async function seedTravelPlaces(dataSource: DataSource): Promise<void> {
  const repo = dataSource.getRepository(TravelPlace);

  console.log('[TravelPlace] Seeding travel places...');
  for (const placeData of TRAVEL_PLACES_SEED) {
    const existing = await repo.findOne({
      where: { name: placeData.name },
    });

    if (!existing) {
      await repo.save(repo.create(placeData));
      console.log(`Created: ${placeData.name}`);
    } else {
      console.log(`Skipped (exists): ${placeData.name}`);
    }
  }

  console.log('[TravelPlace] Seeding completed!');
}
