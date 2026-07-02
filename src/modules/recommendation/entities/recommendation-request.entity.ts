import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('recommendation_requests')
export class RecommendationRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.recommendationRequests, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'float', nullable: true })
  budget: number;

  @Column({ type: 'int', nullable: true })
  days: number;

  @Column({ type: 'text', nullable: true })
  preferences: string;

  @Column({ type: 'text', nullable: true })
  recommendedResult: string;

  @CreateDateColumn()
  createdAt: Date;
}
