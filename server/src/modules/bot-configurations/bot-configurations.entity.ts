import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Project } from '../projects/projects.entity';

@Entity('bot_configurations')
export class BotConfiguration {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'project_id' })
  projectId: number;

  @Column({ nullable: true })
  personality: string;

  @Column({ name: 'start_suggestions', type: 'text', nullable: true })
  startSuggestions: string;

  @Column({ type: 'text', nullable: true })
  greeting: string;

  @Column('text', { array: true, name: 'application_domains' })
  applicationDomains: string[];

  @Column({ name: 'header_title', nullable: true })
  headerTitle: string;

  @Column({ name: 'header_title_color', length: 7, nullable: true })
  headerTitleColor: string;

  @Column({ name: 'background_color', length: 7, nullable: true })
  backgroundColor: string;

  @Column({ nullable: true })
  logo: string;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @ManyToOne(() => Project, project => project.botConfigurations)
  @JoinColumn({ name: 'project_id' })
  project: Project;
}