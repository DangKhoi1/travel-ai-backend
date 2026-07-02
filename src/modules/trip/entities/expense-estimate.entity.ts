import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { TripPlan } from './trip-plan.entity';

@Entity('expense_estimates')
export class ExpenseEstimate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  tripPlanId: string;

  @OneToOne(() => TripPlan, (tripPlan) => tripPlan.expenseEstimate, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tripPlanId' })
  tripPlan: TripPlan;

  @Column({ type: 'float', default: 0 })
  transportCost: number;

  @Column({ type: 'float', default: 0 })
  hotelCost: number;

  @Column({ type: 'float', default: 0 })
  foodCost: number;

  @Column({ type: 'float', default: 0 })
  ticketCost: number;

  @Column({ type: 'float', default: 0 })
  otherCost: number;

  @Column({ type: 'float', default: 0 })
  totalCost: number;
}
