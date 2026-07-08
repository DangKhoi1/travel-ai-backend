import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { TravelPlace } from '../../travelplace/entities/travelplace.entity';

@Entity('vector_data')
export class VectorData {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  placeId: string;

  @OneToOne(() => TravelPlace, (place) => place.vectorData, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'placeId' })
  place: TravelPlace;

  // Lưu embedding dạng text vì TypeORM chưa hỗ trợ vector type
  // Sẽ dùng raw SQL để insert/query với pgvector
  @Column({ type: 'text', nullable: true })
  embedding: string;

  @Column({ nullable: true })
  modelName: string;

  @CreateDateColumn()
  createdAt: Date;
}
