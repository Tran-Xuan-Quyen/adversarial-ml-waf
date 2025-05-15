import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../users/users.entity';

@Entity('tokens')
export class Token {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({ name: 'user_id' })
    userId: number;

    @Column({ name: 'refresh_token', length: 1000 })
    refreshToken: string;

    @Column({ name: 'expired_at' })
    expiredAt: Date;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @ManyToOne(() => User, user => user.tokens)
    @JoinColumn({ name: 'user_id' })
    user: User;
}
