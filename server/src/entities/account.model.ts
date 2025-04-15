import {
  Column,
  Model,
  Table,
  PrimaryKey,
  DataType,
  Default,
  HasMany,
} from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import { TokenModel } from './token.model';
@Table({ tableName: 'account' })
export class AccountModel extends Model<AccountModel> {
  @PrimaryKey
  @Default(uuidv4)
  @Column({
    type: DataType.STRING(255),
    defaultValue: () => uuidv4(),
  })
  id: string;

  @Column({
    type: DataType.STRING(255),
    unique: true,
  })
  email: string;

  @Column({
    type: DataType.STRING(255),
  })
  password: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: 0,
  })
  verify: boolean;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
    allowNull: false,
  })
  role: number;

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
    allowNull: false,
  })
  createdAt: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  updatedAt: Date;

  @HasMany(() => TokenModel, {
    onDelete: 'CASCADE', // Thiết lập onDelete cascade ở đây
    hooks: true,
  })
  token: TokenModel[];
}
