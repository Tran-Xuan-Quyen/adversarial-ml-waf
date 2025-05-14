import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Project } from '../projects/projects.entity';

@Entity('domains')
export class Domain {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'domain_name', length: 255, unique: true })
  domainName: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @ManyToMany(() => Project, project => project.domains)
  projects: Project[];
} 