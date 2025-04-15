import {
  Column,
  Model,
  Table,
  PrimaryKey,
  DataType,
  ForeignKey,
  BelongsTo,
  Default,
} from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import { AccountModel } from './account.model';

@Table({ tableName: 'blacklist' })
export class BlacklistModel extends Model<BlacklistModel> {
  @PrimaryKey
  @Default(uuidv4)
  @Column({
    type: DataType.STRING(255),
    defaultValue: () => uuidv4(),
  })
  id: string;

  @ForeignKey(() => AccountModel)
  @Column({
    type: DataType.STRING(255),
    unique: true,
  })
  account_id: string;
  @BelongsTo(() => AccountModel)
  account: AccountModel;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  status: number;

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
}
