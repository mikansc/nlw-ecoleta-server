import { Request, Response } from 'express';
import knex from '../database/connection';

class ItemsController {
  async index(req: Request, res: Response) {
    const items = await knex('items').select('*');

    const serializedItems = items.map((item) => {
      return {
        id: item.id,
        title: item.title,
        image_url: `https://mn-ecoleta.s3.us-east-2.amazonaws.com/${item.image}`,
      };
    });

    return res.json(serializedItems);
  }
}

export default ItemsController;
