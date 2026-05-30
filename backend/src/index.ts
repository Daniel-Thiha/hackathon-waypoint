import express, { type Request, type Response } from 'express';
import cors from 'cors';
import { z } from 'zod';
import prisma from './prisma.js';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const SafePlaceSchema = z.object({
  name: z.string().min(1),
  latitude: z.preprocess((val) => typeof val === 'string' ? parseFloat(val) : val, z.number()),
  longitude: z.preprocess((val) => typeof val === 'string' ? parseFloat(val) : val, z.number()),
  capacity: z.preprocess((val) => typeof val === 'string' ? parseInt(val, 10) : val, z.number().int()),
  currentOccupants: z.preprocess((val) => typeof val === 'string' ? parseInt(val, 10) : val, z.number().int()).optional().default(0),
  facilities: z.string().optional().default(""),
});

const SupplySchema = z.object({
  safePlaceId: z.preprocess((val) => typeof val === 'string' ? parseInt(val, 10) : val, z.number().int()),
  supplyType: z.string().min(1),
  quantity: z.string().min(1),
  distributionAt: z.preprocess((val) => typeof val === 'string' ? new Date(val) : val, z.date()),
  description: z.string().optional().default(""),
});

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: "ok", message: "Backend is fully working with NodeNext!" });
});

app.get('/api/safe-places', async (req: Request, res: Response) => {
  try {
    const places = await prisma.safePlace.findMany({
      include: {
        supplies: true
      }
    });
    res.json(places);
  } catch (error) {
    console.error("Error fetching safe places:", error);
    res.status(500).json({ error: "Failed to fetch safe places" });
  }
});

app.post('/api/safe-places', async (req: Request, res: Response) => {
  try {
    const validation = SafePlaceSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ error: "Validation failed", details: validation.error.issues });
      return;
    }
    const { name, latitude, longitude, capacity, currentOccupants, facilities } = validation.data;
    const newPlace = await prisma.safePlace.create({
      data: {
        name,
        latitude,
        longitude,
        capacity,
        currentOccupants,
        facilities,
      }
    });
    res.status(201).json(newPlace);
  } catch (error) {
    console.error("Error creating safe place:", error);
    res.status(500).json({ error: "Failed to create safe place" });
  }
});

app.put('/api/safe-places/:id', async (req: Request, res: Response) => {
  try {
    const id = typeof req.params.id === 'string' ? req.params.id : '';
    const validation = SafePlaceSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ error: "Validation failed", details: validation.error.issues });
      return;
    }
    const { name, latitude, longitude, capacity, currentOccupants, facilities } = validation.data;
    const updatedPlace = await prisma.safePlace.update({
      where: { id: parseInt(id, 10) },
      data: {
        name,
        latitude,
        longitude,
        capacity,
        currentOccupants,
        facilities,
      }
    });
    res.json(updatedPlace);
  } catch (error) {
    console.error("Error updating safe place:", error);
    res.status(500).json({ error: "Failed to update safe place" });
  }
});

app.delete('/api/safe-places/:id', async (req: Request, res: Response) => {
  try {
    const id = typeof req.params.id === 'string' ? req.params.id : '';
    await prisma.safePlace.delete({
      where: { id: parseInt(id, 10) }
    });
    res.json({ message: "Safe place deleted successfully" });
  } catch (error) {
    console.error("Error deleting safe place:", error);
    res.status(500).json({ error: "Failed to delete safe place" });
  }
});

app.post('/api/supplies', async (req: Request, res: Response) => {
  try {
    const validation = SupplySchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ error: "Validation failed", details: validation.error.issues });
      return;
    }
    const { safePlaceId, supplyType, quantity, distributionAt, description } = validation.data;
    const newSupply = await prisma.supplyDistribution.create({
      data: {
        safePlaceId,
        supplyType,
        quantity,
        distributionAt,
        description,
      }
    });
    res.status(201).json(newSupply);
  } catch (error) {
    console.error("Error scheduling supply distribution:", error);
    res.status(500).json({ error: "Failed to schedule supply distribution" });
  }
});

app.put('/api/supplies/:id', async (req: Request, res: Response) => {
  try {
    const id = typeof req.params.id === 'string' ? req.params.id : '';
    const validation = SupplySchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ error: "Validation failed", details: validation.error.issues });
      return;
    }
    const { safePlaceId, supplyType, quantity, distributionAt, description } = validation.data;
    const updatedSupply = await prisma.supplyDistribution.update({
      where: { id: parseInt(id, 10) },
      data: {
        safePlaceId,
        supplyType,
        quantity,
        distributionAt,
        description,
      }
    });
    res.json(updatedSupply);
  } catch (error) {
    console.error("Error updating supply:", error);
    res.status(500).json({ error: "Failed to update supply" });
  }
});

app.delete('/api/supplies/:id', async (req: Request, res: Response) => {
  try {
    const id = typeof req.params.id === 'string' ? req.params.id : '';
    await prisma.supplyDistribution.delete({
      where: { id: parseInt(id, 10) }
    });
    res.json({ message: "Supply deleted successfully" });
  } catch (error) {
    console.error("Error deleting supply:", error);
    res.status(500).json({ error: "Failed to delete supply" });
  }
});

async function seedInitialData() {
  await prisma.supplyDistribution.deleteMany();
  await prisma.safePlace.deleteMany();

  const place1 = await prisma.safePlace.create({
    data: {
      name: "East Sports Complex",
      latitude: 13.7563,
      longitude: 100.5018,
      capacity: 1000,
      currentOccupants: 678,
      facilities: "Medical Aid, Sanitation, Dining Hall",
    }
  });

  const place2 = await prisma.safePlace.create({
    data: {
      name: "Central Community Center",
      latitude: 13.7600,
      longitude: 100.5100,
      capacity: 500,
      currentOccupants: 234,
      facilities: "Sanitation, Food Supplies",
    }
  });

  const place3 = await prisma.safePlace.create({
    data: {
      name: "North High School",
      latitude: 13.7800,
      longitude: 100.5200,
      capacity: 800,
      currentOccupants: 456,
      facilities: "First Aid, Sleeping Bags",
    }
  });

  const place4 = await prisma.safePlace.create({
    data: {
      name: "West Convention Hall",
      latitude: 13.7900,
      longitude: 100.5300,
      capacity: 1200,
      currentOccupants: 890,
      facilities: "Sanitation, First Aid Hub",
    }
  });

  await prisma.supplyDistribution.create({
    data: {
      safePlaceId: place1.id,
      supplyType: "Water",
      quantity: "2000 bottles",
      distributionAt: new Date("2026-05-30T11:01:08.000Z"),
      description: "Emergency water supply",
    }
  });

  await prisma.supplyDistribution.create({
    data: {
      safePlaceId: place2.id,
      supplyType: "Water",
      quantity: "1000 bottles",
      distributionAt: new Date("2026-05-30T11:31:08.000Z"),
      description: "Drinking water bottles (500ml)",
    }
  });

  await prisma.supplyDistribution.create({
    data: {
      safePlaceId: place2.id,
      supplyType: "Food",
      quantity: "500 meals",
      distributionAt: new Date("2026-05-30T12:31:08.000Z"),
      description: "Hot meals - rice and canned goods",
    }
  });

  await prisma.supplyDistribution.create({
    data: {
      safePlaceId: place3.id,
      supplyType: "Medical",
      quantity: "50 kits",
      distributionAt: new Date("2026-05-30T13:31:08.000Z"),
      description: "First aid kits and basic medicines",
    }
  });

  await prisma.supplyDistribution.create({
    data: {
      safePlaceId: place3.id,
      supplyType: "Food",
      quantity: "800 meals",
      distributionAt: new Date("2026-05-30T14:31:08.000Z"),
      description: "Packaged meals and snacks",
    }
  });

  console.log("🌱 Database seeded with mock data to match UI screenshots!");
}

app.listen(PORT, async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  try {
    await seedInitialData();
  } catch (err) {
    console.error("Failed to seed data:", err);
  }
});