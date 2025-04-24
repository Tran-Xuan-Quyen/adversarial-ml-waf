import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Prompt {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    personality: string;

    @Column()
    greeting: string;

    @Column()
    suggestion: string;

    @Column()
    domainApp: string[];

    @Column()
    sessionId: string;

    @Column()
    userId: number;
}