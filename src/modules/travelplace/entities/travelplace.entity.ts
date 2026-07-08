import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { VectorData } from '../../rag/entities/vector-data.entity';
import { Review } from '../../review/entities/review.entity';
import { TripPlaceSelection } from '../../trip/entities/trip-place-selection.entity';

@Entity('travel_places')
export class TravelPlace {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  country: string;

  @Column({ type: 'float', nullable: true })
  latitude: number;

  @Column({ type: 'float', nullable: true })
  longitude: number;

  @Column({ nullable: true })
  ticketPrice: string;

  @Column({ nullable: true })
  category: string;

  @Column({ nullable: true })
  bestSeason: string;

  @Column({ nullable: true })
  imageUrl: string;

  @OneToOne(() => VectorData, (vectorData) => vectorData.place)
  vectorData: VectorData;

  @OneToMany(() => Review, (review) => review.place)
  reviews: Review[];

  @OneToMany(() => TripPlaceSelection, (selection) => selection.place)
  tripPlaceSelections: TripPlaceSelection[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
