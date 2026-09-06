import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TripPlan } from './entities/trip-plan.entity';
import { TripPlaceSelection } from './entities/trip-place-selection.entity';
import { ExpenseEstimate } from './entities/expense-estimate.entity';
import { PublicTripController, TripController } from './trip.controller';
import { TripService } from './trip.service';
import { RagModule } from '../rag/rag.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TripPlan, TripPlaceSelection, ExpenseEstimate]),
    RagModule,
  ],
  controllers: [TripController, PublicTripController],
  providers: [TripService],
  exports: [TypeOrmModule, TripService],
})
export class TripModule {}
