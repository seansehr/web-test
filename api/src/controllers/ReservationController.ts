import { Controller, Delete, Get , Post, Put } from '@overnightjs/core'
import { Request, Response } from 'express'
import { Inventory } from '../models/Inventory'
import { Reservation } from '../models/Reservation'

@Controller('reservation')
export class ReservationController {
  @Get('')
  private async getAll(req: Request, res: Response) {
    let entries = await Reservation.findAll();
    if (req.query.date) {
      const [year, month, day] = req.query.date.toString().split('-').map(i => parseInt(i, 10))
      const date = new Date(year, month, day, 0, 0, 0)
      entries = entries.filter(i => {
        const iYear = i.time.getFullYear()
        const iMonth = i.time.getMonth()
        const iDay = i.time.getDate()
        return iYear === year && iMonth === month && iDay === day
      })
    }
    console.log(entries)
    return res.status(200).json(entries);
  }

  @Post('')
  private async post(req: Request, res: Response) {
    try {
      const entry = Reservation.build(req.body);
      await entry.save();
      return res.status(200).json({id: entry.id});
    } catch (error) {
      return res.status(500).json({errors: error.errors.map(e => e.message)});
    }
  }

  @Get(':id')
  private async get(req: Request, res: Response) {
    const entry = await Reservation.findOne({ where: { id: req.params.id } });
    if (entry === null) {
      return res.sendStatus(404);
    }
    return res.status(200).json(entry);
  }

  @Put(':id')
  private async update(req: Request, res: Response) {
    const entry = await Reservation.findOne({ where: { id: req.params.id } });
    if (entry === null) {
      return res.sendStatus(404);
    }
    try {
      await entry.update(req.body);
      return res.status(200).json(entry);
    } catch (error) {
      console.log(error);
      return res.status(500).json({errors: error.errors.map(e => e.message)});
    }
  }

  @Delete(':id')
  private async delete(req: Request, res: Response) {
    const id = req.params.id;
    const entry = await Reservation.findOne({ where: { id } });
    if (entry === null) {
      return res.sendStatus(404);
    }
    try {
      entry.destroy();
      return res.status(200).json({id});
    }
    catch (error) {
      return res.status(500).json(error.message);
    }
  }
}
