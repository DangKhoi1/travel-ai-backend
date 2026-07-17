import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Review } from '../../review/entities/review.entity';
import { ChatHistory } from '../../chat/entities/chat-history.entity';
import { RecommendationRequest } from '../../recommendation/entities/recommendation-request.entity';
import { TripPlan } from '../../trip/entities/trip-plan.entity';
import { Role } from '../../roles/entities/role.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  userId: string;

  @Column({ unique: true })
  username: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ unique: true, nullable: true })
  email: string;

  @Column({ nullable: true })
  gender: string;

  @Column({ type: 'int', nullable: true })
  birthYear: number;

  @Column({ nullable: true })
  hobbies: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  fullName: string;

  @Column({ nullable: true })
  avatar: string;

  @ManyToOne(() => Role)
  @JoinColumn({ name: 'roleId' })
  role: Role;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Review, (review) => review.user)
  reviews: Review[];

  @OneToMany(() => ChatHistory, (chat) => chat.user)
  chatHistories: ChatHistory[];

  @OneToMany(() => RecommendationRequest, (rec) => rec.user)
  recommendationRequests: RecommendationRequest[];

  @OneToMany(() => TripPlan, (trip) => trip.user)
  tripPlans: TripPlan[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
