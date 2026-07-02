import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TripPlan } from './entities/trip-plan.entity';
import { TripPlaceSelection } from './entities/trip-place-selection.entity';
import { ExpenseEstimate } from './entities/expense-estimate.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TripPlan, TripPlaceSelection, ExpenseEstimate])],
  controllers: [],
  providers: [],
  exports: [TypeOrmModule],
})
export class TripModule {}
