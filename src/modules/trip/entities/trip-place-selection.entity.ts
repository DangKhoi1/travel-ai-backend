import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TripPlan } from './trip-plan.entity';
import { TravelPlace } from '../../travelplace/entities/travelplace.entity';

@Entity('trip_place_selections')
export class TripPlaceSelection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tripPlanId: string;

  @Column()
  placeId: string;

  @ManyToOne(() => TripPlan, (tripPlan) => tripPlan.selections, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'tripPlanId' })
  tripPlan: TripPlan;

  @ManyToOne(() => TravelPlace, (place) => place.tripPlaceSelections, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'placeId' })
  place: TravelPlace;

  @Column({ type: 'int' })
  dayNumber: number;

  @Column({ type: 'int' })
  orderIndex: number;

  @Column({ nullable: true })
  estimatedDuration: string;
}
