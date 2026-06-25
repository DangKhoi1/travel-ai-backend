import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('travelplaces')
export class Travelplace {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column({ nullable: true })
  location: string;        // VD: "Hội An, Quảng Nam"

  @Column({ nullable: true })
  region: string;          // "Miền Trung" | "Miền Bắc" | "Miền Nam"

  @Column({ nullable: true })
  bestTime: string;        // VD: "Tháng 2 - 4"

  @Column({ nullable: true })
  category: string;        // "beach" | "mountain" | "city" | "heritage"

  @Column({ nullable: true })
  entryFee: string;        // VD: "Miễn phí" hoặc "80.000đ"

  // Lưu embedding dạng text vì TypeORM chưa hỗ trợ vector type
  // Sẽ dùng raw SQL để insert/query với pgvector
  @Column({ type: 'text', nullable: true, select: false })
  embedding: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
