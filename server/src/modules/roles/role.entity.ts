import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from '../users/users.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'role_name', length: 50, unique: true })
  roleName: string;

  @OneToMany(() => User, user => user.role)
  users: User[];
}