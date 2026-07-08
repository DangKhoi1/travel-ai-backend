import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { TripPlaceSelection } from './trip-place-selection.entity';
import { ExpenseEstimate } from './expense-estimate.entity';

@Entity('trip_plans')
export class TripPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.tripPlans, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  title: string;

  @Column({ type: 'float', nullable: true })
  budget: number;

  @Column({ type: 'int', nullable: true })
  days: number;

  @Column({ type: 'text', nullable: true })
  preferences: string;

  @Column({ type: 'float', nullable: true })
  estimatedCost: number;

  @Column({ type: 'date', nullable: true })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

  @OneToMany(() => TripPlaceSelection, (selection) => selection.tripPlan)
  selections: TripPlaceSelection[];

  @OneToOne(() => ExpenseEstimate, (expense) => expense.tripPlan)
  expenseEstimate: ExpenseEstimate;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
