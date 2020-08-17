import { Request, Response } from 'express';
import knex from '../database/connection';

class PointsController {
  async index(req: Request, res: Response) {
    try {
      //cidade, uf, items (Query Params)
    const { city, uf, items } = req.query;

    const parsedItems = String(items)
      .split(',')
      .map((item) => Number(item.trim()));

    const points = await knex('points')
      .join('point_items', 'points.id', '=', 'point_items.point_id')
      .whereIn('point_items.item_id', parsedItems)
      .where('city', String(city))
      .where('uf', String(uf))
      .distinct()
      .select('points.*');

    const serializedPoints = points.map((point) => {
      return {
        ...point,
        image_url: `http://192.168.15.4:5500/uploads/${point.image}`,
      };
    });

    return res.json(serializedPoints);
    } catch (error) {
      console.error(error.message)
      return res.status(400).send({error: "An error has ocurred on trying to get all points."})
    }
  }

  async show(req: Request, res: Response) {
    const { id } = req.params;

    const point = await knex('points').where('id', id).first();

    if (!point) {
      return res.status(400).json({ message: 'Point Not Found' });
    }

    const serializedPoint = {
      ...point,
      image_url: `http://192.168.15.4:5500/uploads/${point.image}`,
    };

    const items = await knex('items')
      .join('point_items', 'items.id', '=', 'point_items.item_id')
      .where('point_items.point_id', id)
      .select('items.title');

    return res.json({ point: serializedPoint, items });
  }

  async create(req: Request, res: Response) {

    try {
      const {
        name,
        email,
        whatsapp,
        latitude,
        longitude,
        city,
        uf,
        items,
      } = req.body;
  
      const trx = await knex.transaction();
  
      const point = {
        // image: req.file.filename,
        image: `https://images.unsplash.com/photo-1578916171728-46686eac8d58?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=967&q=80`,
        name,
        email,
        whatsapp,
        latitude,
        longitude,
        city,
        uf,
      };
  
      const insertedIds = await trx('points').insert(point).returning('id');
  
      const point_id = insertedIds[0];
  
      const pointItems = items
        .split(',')
        .map((item: string) => Number(item.trim()))
        .map((item_id: number) => {
          return {
            item_id,
            point_id,
          };
        });
      await trx('point_items').insert(pointItems);
  
      await trx.commit();
  
      return res.json({
        id: point_id,
        ...point,
      });
    } catch (error) {
      console.error(error.message)
      return res.status(400).send({error: "An error has ocurred on trying to create the point."})
    }
  }
}

export default PointsController;
