import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class CustomizeUI {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    titleStyle: string;

    @Column()
    image: string;

    @Column()
    iconButton: string;

    @Column()
    colorButton: string;

    @Column()
    userId: number;
}