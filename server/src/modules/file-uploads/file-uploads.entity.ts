import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Prompt } from '../prompts/prompt.entity';

@Entity('file_uploads')
export class FileUpload {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'promt_id' })
  promptId: number;

  @Column({ name: 'file_name', length: 255 })
  fileName: string;

  @Column({ name: 'file_size', nullable: true })
  fileSize: number;

  @Column({ name: 'status', length: 50, nullable: true })
  status: string;

  @Column({ name: 'file_path', length: 255, nullable: true })
  filePath: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => Prompt, (prompt) => prompt.fileUploads)
  @JoinColumn({ name: 'promt_id' })
  prompt: Prompt;
}
