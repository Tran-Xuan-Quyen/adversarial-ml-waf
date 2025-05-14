import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../users/users.entity';
import { Domain } from '../domains/domain.entity';
import { BotConfiguration } from '../bot-configurations/bot-configuration.entity';
import { FileUpload } from '../file-uploads/file-upload.entity';

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

  @OneToMany(() => User, user => user.project)
  users: User[];

  @ManyToMany(() => Domain)
  @JoinTable({
    name: 'project_domains',
    joinColumn: { name: 'id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'domain_id', referencedColumnName: 'id' }
  })
  domains: Domain[];

  @OneToMany(() => BotConfiguration, config => config.project)
  botConfigurations: BotConfiguration[];

  @OneToMany(() => FileUpload, file => file.project)
  fileUploads: FileUpload[];
}