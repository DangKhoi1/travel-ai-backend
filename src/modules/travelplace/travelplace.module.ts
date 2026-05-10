import { Module } from '@nestjs/common';
import { TravelplaceService } from './travelplace.service';
import { TravelplaceController } from './travelplace.controller';

@Module({
  controllers: [TravelplaceController],
  providers: [TravelplaceService],
})
export class TravelplaceModule {}
