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
    const inventory = await Inventory.findOne({ where: { id: req.params.id } });
    if (inventory === null) {
      return res.sendStatus(404);
    }
    return res.status(200).json(inventory);
  }

  @Put(':id')
  private async update(req: Request, res: Response) {
    const inventory = await Inventory.findOne({ where: { id: req.params.id } });
    if (inventory === null) {
      return res.sendStatus(404);
    }
    try {
      await inventory.update(req.body);
      return res.status(200).json(inventory);
    } catch (error) {
      console.log(error);
      return res.status(500).json({errors: error.errors.map(e => e.message)});
    }
  }

  @Delete(':id')
  private async delete(req: Request, res: Response) {
    const inventory = await Inventory.findOne({ where: { id: req.params.id } });
    if (inventory === null) {
      return res.sendStatus(404);
    }
    try {
      inventory.destroy();
      return res.status(200).json(inventory.id);
    }
    catch (error) {
      return res.status(500).json(error.message);
    }
  }
}
