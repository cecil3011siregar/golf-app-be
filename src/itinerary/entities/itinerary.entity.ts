import { Holiday } from '#/holiday/entities/holiday.entity';
import { Sport } from '#/sport/entities/sport.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Itinerary {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'int',
  })
  day: number;

  @Column({
    type: 'text',
  })
  description: string;

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

  @ManyToOne(() => Sport, (sport) => sport.itineraries, { nullable: true })
  sport: Sport;

  @ManyToOne(() => Holiday, (holiday) => holiday.itinerary, { nullable: true })
  holiday: Holiday;
  @Column({ type: 'uuid', nullable: true })
  holidayId: string;
}
