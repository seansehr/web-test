import { Controller, Delete, Get , Post, Put } from '@overnightjs/core'
import { Request, Response } from 'express'
import { Inventory } from '../models/Inventory'

@Controller('inventory')
export class InventoryController {
  @Get('')
  private async getAll(req: Request, res: Response) {
    const inventories = await Inventory.findAll({ raw: true });
    return res.status(200).json(inventories);
  }

  @Post('')
  private async post(req: Request, res: Response) {
    try {
      const entry = Inventory.build(req.body);
      await entry.save();
      return res.status(200).json({id: entry.id});
    } catch (error) {
      return res.status(500).json({errors: error.errors.map(e => e.message)});
    }
  }

  @Get(':id')
  private async get(req: Request, res: Response) {
    const entry = await Inventory.findOne({ where: { id: req.params.id } });
    if (entry === null) {
      return res.sendStatus(404);
    }
    return res.status(200).json(entry);
  }

  @Put(':id')
  private async update(req: Request, res: Response) {
    const entry = await Inventory.findOne({ where: { id: req.params.id } });
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
    const entry = await Inventory.findOne({ where: { id } });
    if (entry === null) {
      return res.sendStatus(404);
    }
    try {
      entry.destroy();
      return res.status(200).json({ id });
    }
    catch (error) {
      return res.status(500).json(error.message);
    }
  }
}
