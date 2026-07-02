import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Review } from '../../review/entities/review.entity';
import { ChatHistory } from '../../chat/entities/chat-history.entity';
import { RecommendationRequest } from '../../recommendation/entities/recommendation-request.entity';
import { TripPlan } from '../../trip/entities/trip-plan.entity';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  userId: string;

  @Column({ nullable: true })
  username: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  fullName: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

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
