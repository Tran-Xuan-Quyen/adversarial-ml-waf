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
import { ServiceModel } from './service.model';
import { v4 as uuidv4 } from 'uuid';

@Table({ tableName: 'whiteList' })
export class WhiteListModel extends Model<WhiteListModel> {
  @PrimaryKey
  @Default(uuidv4)
  @Column({
    type: DataType.STRING(255),
    defaultValue: () => uuidv4(),
  })
  id: string;

  @ForeignKey(() => ServiceModel)
  @Column({
    type: DataType.STRING(255),
  })
  service_id: string;
  @BelongsTo(() => ServiceModel)
  service: ServiceModel;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
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
