import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from '../roles/role.entity';
import { Project } from '../projects/projects.entity';
import { AccessLog } from '../access-logs/access-logs.entity';
import { Token } from '../token/token.entity';
import { UserProject } from '../user-projects/user-projects.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'email', length: 255, unique: true })
  email: string;

  @Column({ name: 'password_hash', length: 255 })
  passwordHash: string;

  @Column({ name: 'full_name', length: 255 })
  fullName: string;

  @Column({ name: 'role_id', nullable: true })
  roleId: number;

  @Column({ name: 'project_id', nullable: true })
  projectId: number;

  @Column({ name: 'gender', nullable: true })
  gender: number;

  @Column({ name: 'birth', type: 'timestamp', nullable: true })
  birth: Date;

  @Column({ name: 'image', length: 500, nullable: true })
  image: string;

  @Column({ name: 'phone_number', length: 500, nullable: true })
  phoneNumber: string;

  @Column({ name: 'status_id', nullable: true })
  statusId: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => Role, (role) => role.users)
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @ManyToOne(() => Project)
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @OneToMany(() => AccessLog, (accessLog) => accessLog.user)
  accessLogs: AccessLog[];

  @OneToMany(() => Token, (token) => token.user)
  tokens: Token[];

  @OneToMany(() => UserProject, (userProject) => userProject.user)
  userProjects: UserProject[];

  projects?: Project[];
}
