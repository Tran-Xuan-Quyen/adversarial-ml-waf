import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { Project } from '../projects/projects.entity';

@Entity('domains')
export class Domain {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'project_id' })
  projectId: number;

  @Column({ name: 'domain_name', length: 255, unique: true })
  domainName: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => Project, project => project.domains)
  @JoinColumn({ name: 'project_id' })
  project: Project;
} 