import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/users.entity';
import { Domain } from '../domains/domain.entity';
import { Prompt } from '../prompts/prompt.entity';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'project_name', length: 255 })
  projectName: string;

  @Column({ name: 'application_domain', length: 255 })
  applicationDomain: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @OneToMany(() => User, (user) => user.project)
  users: User[];

  @OneToMany(() => Domain, (domain) => domain.project)
  domains: Domain[];

  @OneToMany(() => Prompt, (prompt) => prompt.project)
  prompts: Prompt[];
}
