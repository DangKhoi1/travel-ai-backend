import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { TravelPlace } from '../../travelplace/entities/travelplace.entity';

@Entity('reviews')
@Unique(['userId', 'placeId'])
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  placeId: string;

  @ManyToOne(() => User, (user) => user.reviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => TravelPlace, (place) => place.reviews, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'placeId' })
  place: TravelPlace;

  @Column({ type: 'int' })
  rating: number; // 1 - 5

  @Column({ type: 'text', nullable: true })
  comment: string;

  @CreateDateColumn()
  createdAt: Date;
}
