import { Benefit } from '#/benefit/entities/benefit.entity';
import { Holiday } from '#/holiday/entities/holiday.entity';
import { SportType } from '#/sport-type/entities/sport-type.entity';
import { Sport } from '#/sport/entities/sport.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Image {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'text',
  })
  filename: string;

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

  @ManyToOne(() => Sport, (sport) => sport.images, { nullable: true })
  sport: Sport;

  @ManyToOne(() => Holiday, (holiday) => holiday.image, { nullable: true })
  holiday: Holiday;
  @Column({ type: 'uuid', nullable: true })
  holidayId: string;

  @OneToOne(() => SportType, (sportType) => sportType.image, { nullable: true })
  @JoinColumn({ name: 'sport_type_id' })
  sportType: SportType;

  @OneToOne(() => Benefit, (benefit) => benefit.image, { nullable: true })
  benefit: Benefit;
  @Column({ type: 'uuid', nullable: true })
  benefitId: string;
}
