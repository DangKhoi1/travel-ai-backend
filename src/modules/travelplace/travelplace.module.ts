import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TravelplaceService } from './travelplace.service';
import { TravelplaceController } from './travelplace.controller';
import { TravelPlace } from './entities/travelplace.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TravelPlace])],
  controllers: [TravelplaceController],
  providers: [TravelplaceService],
  exports: [TypeOrmModule],
})
export class TravelplaceModule {}
