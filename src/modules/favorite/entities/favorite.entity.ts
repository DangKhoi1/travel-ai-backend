import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Column,
  Unique,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { TravelPlace } from '../../travelplace/entities/travelplace.entity';

@Entity('favorites')
@Unique(['userId', 'placeId'])
export class Favorite {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() userId: string;
  @Column() placeId: string;
  @ManyToOne(() => User, (user) => user.favorites, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
  @ManyToOne(() => TravelPlace, (place) => place.favorites, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'placeId' })
  place: TravelPlace;
  @CreateDateColumn() createdAt: Date;
}
