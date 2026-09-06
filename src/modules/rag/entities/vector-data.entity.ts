import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { TravelPlace } from '../../travelplace/entities/travelplace.entity';

@Index('idx_vector_data_embedding_hnsw', { synchronize: false })
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

  @Column({ type: 'vector', length: 1536, nullable: true })
  embedding: number[] | null;

  @Column({ nullable: true })
  modelName: string;

  @CreateDateColumn()
  createdAt: Date;
}
