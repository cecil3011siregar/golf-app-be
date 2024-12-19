import { Holiday } from '#/holiday/entities/holiday.entity';
import { Image } from '#/image/entities/image.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Benefit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 60 })
  name: string;

  @OneToOne(() => Image, (image) => image.benefit)
  image: Image;

  @ManyToMany(() => Holiday, (Holiday) => Holiday.benefit)
  holiday: Holiday[];

  @Column({ type: 'boolean', default: true })
  status: boolean;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp with time zone',
    nullable: false,
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp with time zone',
    nullable: false,
  })
  updatedAt: Date;

  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamp with time zone',
    nullable: true,
  })
  deletedAt: Date;
}
