import {
  Column,
  CreatedAt,
  DeletedAt,
  Is,
  IsInt,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from 'sequelize-typescript'
import { Op } from 'sequelize';

/**
 * Verify the time string is in hh:mm format
 * TODO: Figure out how to get the field name we are verifing so we can get rid of helper functions.
 * @param value The time in hh:mm format
 */
const verifyTime = (value: string, field: string):void => {
  if (typeof value !== 'string') {
    throw new Error(`${field} must be a string. ${typeof value} was receieved`);
  }
  const [hour, min] = value.split(':').map(i => parseInt(i, 10));
  if (Number.isNaN(hour) || Number.isNaN(min)) {
    throw new Error(`${field} must be a in hh:mm format. ${value} was receieved`);
  }
  if (min >= 60 || min % 15 !== 0) {
    throw new Error(`${field} minutes must be 0, 15, 30, or 45. ${min} was receieved`);
  }
}

const verifyStartTime = (value: string): void => verifyTime(value, 'startTime');
const verifyEndTime = (value: string): void => verifyTime(value, 'endTime');

/**
 * Convert a time string to a date/time string to make comparison easier. Is this crazy?
 * @param value The time in hh:mm format
 * @returns a Date object
 */
const convertToDateTime = (value: string): Date => {
  return new Date(`January 1 2000 ${value}`);
}

@Table({
  tableName: 'inventory',
  validate: {
    /**
     * Checks if start time is before end time and it doesn't conflict with another entry.
     * @returns
     */
    validateTimeRange: async function(): Promise<void>{
      const startTime = convertToDateTime(this.start_time);
      const endTime = convertToDateTime(this.end_time);
      if (startTime >= endTime) {
        throw new Error('startTime must be before endTime');
      }
      const inventories = await Inventory.findAll({where: { id: { [Op.ne]: this.id } } });
      return inventories.forEach(i => {
        const iStartTime = convertToDateTime(i.start_time);
        const iEndTime = convertToDateTime(i.end_time);
        if ((startTime >= iStartTime && startTime < iEndTime) || (endTime > iStartTime && endTime <= iEndTime)) {
          throw new Error(`conflicts with inventory id ${i.id}`);
        }
      })
    },
  }
})
export class Inventory extends Model<Inventory> {
  @PrimaryKey
  @Column({ autoIncrement: true })
  id: number

  @Is(verifyStartTime)
  @Column({ allowNull: false})
  start_time: string

  @Is(verifyEndTime)
  @Column({ allowNull: false})
  end_time: string

  @IsInt
  @Column({ allowNull: false})
  capacity: number

  @DeletedAt
  deleted_at: string

  @CreatedAt
  created_at: string

  @UpdatedAt
  updated_at: string
}