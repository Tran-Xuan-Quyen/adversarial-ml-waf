import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity() // Đánh dấu lớp là một entity
export class User {
  @PrimaryGeneratedColumn()  // Đánh dấu khóa chính tự động tăng
  id: number;

  @Column()  // Đánh dấu trường dữ liệu
  name: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  phone: string;

  @Column()
  address: string;

}
