import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { Project } from '../projects/projects.entity';
import { BotConfiguration } from '../bot-configurations/bot-configurations.entity';
import { FileUpload } from '../file-uploads/file-uploads.entity';

@Entity('promts')
export class Prompt {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'promt_name', length: 255 })
  promptName: string;

  @Column({ name: 'project_id' })
  projectId: number;

  @Column({ name: 'promt_status' })
  promptStatus: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => Project, project => project.prompts)
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @OneToMany(() => BotConfiguration, config => config.prompt)
  botConfigurations: BotConfiguration[];

  @OneToMany(() => FileUpload, file => file.prompt)
  fileUploads: FileUpload[];
} 