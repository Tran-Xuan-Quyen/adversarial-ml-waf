import {
  Column,
  Model,
  Table,
  PrimaryKey,
  DataType,
  Default,
} from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';

@Table({ tableName: 'service' })
export class ServiceModel extends Model<ServiceModel> {
  @PrimaryKey
  @Default(uuidv4)
  @Column({
    type: DataType.STRING(255),
    defaultValue: () => uuidv4(),
  })
  id: string;

  @Column({
    type: DataType.STRING(500),
    allowNull: false,
    unique: true,
  })
  public_key: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    unique: true,
  })
  service_name: string;

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
