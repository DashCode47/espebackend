import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

export const bannerController = {
  // Create a new banner
  async create(req: Request, res: Response) {
    try {
      const { title, description, imageUrl } = req.body;
      console.log(req.body);

      const banner = await prisma.banner.create({
        data: {
          title,
          description,
          imageUrl,
        },
      });

      return res.status(201).json(banner);
    } catch (error) {
      return res.status(500).json({ error: 'Error creating banner' });
    }
  },

  // Get all banners
  async getAll(req: Request, res: Response) {
    try {
      const banners = await prisma.banner.findMany({
        orderBy: {
          createdAt: 'desc',
        },
      });

      return res.json(banners);
    } catch (error) {
      return res.status(500).json({ error: 'Error fetching banners' });
    }
  },

  // Get a single banner by ID
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const banner = await prisma.banner.findUnique({
        where: { id },
      });

      if (!banner) {
        return res.status(404).json({ error: 'Banner not found' });
      }

      return res.json(banner);
    } catch (error) {
      return res.status(500).json({ error: 'Error fetching banner' });
    }
  },

  // Update a banner
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { title, description, imageUrl, isActive } = req.body;

      const banner = await prisma.banner.update({
        where: { id },
        data: {
          title,
          description,
          imageUrl,
          isActive,
        },
      });

      return res.json(banner);
    } catch (error) {
      return res.status(500).json({ error: 'Error updating banner' });
    }
  },

  // Delete a banner
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.banner.delete({
        where: { id },
      });

      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: 'Error deleting banner' });
    }
  },
}; 