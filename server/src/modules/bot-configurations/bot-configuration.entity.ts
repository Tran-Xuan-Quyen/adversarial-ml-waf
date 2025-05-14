import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Project } from '../projects/projects.entity';

@Entity('bot_configurations')
export class BotConfiguration {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'project_id' })
  projectId: number;

  @Column({ name: 'personality', length: 255, nullable: true })
  personality: string;

  @Column({ name: 'start_suggestions', type: 'text', nullable: true })
  startSuggestions: string;

  @Column({ name: 'greeting', type: 'text', nullable: true })
  greeting: string;

  @Column({ name: 'application_domains', type: 'text', array: true, nullable: true })
  applicationDomains: string[];

  @Column({ name: 'header_title', length: 255, nullable: true })
  headerTitle: string;

  @Column({ name: 'header_title_color', length: 7, nullable: true })
  headerTitleColor: string;

  @Column({ name: 'background_color', length: 7, nullable: true })
  backgroundColor: string;

  @Column({ name: 'logo', length: 255, nullable: true })
  logo: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => Project, project => project.botConfigurations)
  @JoinColumn({ name: 'project_id' })
  project: Project;
} 