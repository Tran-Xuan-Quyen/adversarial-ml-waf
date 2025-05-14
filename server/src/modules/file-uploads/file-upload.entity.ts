import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Project } from '../projects/projects.entity';

@Entity('file_uploads')
export class FileUpload {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'project_id' })
  projectId: number;

  @Column({ name: 'file_name', length: 255 })
  fileName: string;

  @Column({ name: 'file_size', nullable: true })
  fileSize: number;

  @Column({ name: 'status', length: 50, nullable: true })
  status: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => Project, project => project.fileUploads)
  @JoinColumn({ name: 'project_id' })
  project: Project;
} 