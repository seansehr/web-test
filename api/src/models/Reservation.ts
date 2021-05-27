import {
  BelongsTo,
  Column,
  CreatedAt,
  DeletedAt,
  ForeignKey,
  IsDate,
  IsEmail,
  IsInt,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from 'sequelize-typescript'
import { Inventory } from './Inventory'

@Table({
  tableName: 'reservation',
  validate: {
    /**
     * Find which inventory to put it in. Not sure if this logic belongs here.
     */
    validateInventory: async function(): Promise<void>{
      // TODO: Better way to figure out if something is being deleted?
      if (this.deleted_at !== null && this._previousDataValues.deleted_at === null) {
        return
      }
      this.time.setSeconds(0)
      this.time.setMilliseconds(0)
      const min = this.time.getMinutes()
      if (min >= 60 || min % 15 !== 0) {
        throw new Error(`minutes must be 0, 15, 30, or 45. ${min} was receieved`);
      }
      const reservations = await Reservation.findAll({ where: { time: this.time }})
      // If a reservation at the same time exists we already know the inventory.
      if (reservations.length > 0) {
        // Theoritically all reservations should have an id, but let's just be safe.
        this.inventory_id = reservations.find(i => i.inventory_id !== null).inventory_id
      } else {
        // If a reservation at the same time does not exist then we need to find it.
        const inventories = await Inventory.findAll()
        const convertToDateTime = (time: string): Date => {
          const [hour, minute] = time.split(':').map(x => parseInt(x, 10))
          const newDate = new Date(this.time);
          newDate.setHours(hour)
          newDate.setMinutes(minute)
          return newDate;
        }
        const inventory = inventories.find(i => {
          const startTime = convertToDateTime(i.start_time)
          const endTime = convertToDateTime(i.end_time)
          return this.time > startTime && this.time < endTime
        })
        if (inventory === undefined) {
          throw new Error('No inventory to add to')
        }
        this.inventory_id = inventory.id
      }
      // Now we know the inventory.id we can check how full it is for this time slot
      const inventory = await Inventory.findOne({ where: { id: this.inventory_id }})
      if (reservations.length >= inventory.capacity) {
        throw new Error('inventory is full')
      }
    },
  }
})
export class Reservation extends Model<Reservation> {
  @PrimaryKey
  @Column({ autoIncrement: true })
  id: number

  @Column({ allowNull: false})
  name: string

  @IsEmail
  @Column({ allowNull: false})
  email: string

  @IsInt
  @Column({ allowNull: false})
  party_size: number

  @IsDate
  @Column({ allowNull: false})
  time: Date

  @ForeignKey(() => Inventory)
  @Column
  inventory_id: number

  @BelongsTo(() => Inventory)
  inventory: Inventory

  @DeletedAt
  deleted_at: string

  @CreatedAt
  created_at: string

  @UpdatedAt
  updated_at: string
}