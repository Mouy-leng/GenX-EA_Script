import { Router } from "express";
import { MemStorage } from "./storage";
import { resourceFiltersSchema, insertResourceSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();
const storage = new MemStorage();

// GET /api/resources - Get paginated resources with filters
router.get("/api/resources", async (req, res) => {
  try {
    const filters = resourceFiltersSchema.parse({
      search: req.query.search || undefined,
      skillLevel: req.query.skillLevel || undefined,
      category: req.query.category || undefined,
      resourceType: req.query.resourceType || undefined,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 12,
    });

    const result = await storage.getResources(filters);
    res.json(result);
  } catch (error) {
    console.error("Error fetching resources:", error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid filter parameters", details: error.errors });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

// GET /api/resources/featured - Get featured resources
router.get("/api/resources/featured", async (req, res) => {
  try {
    const featuredResources = await storage.getFeaturedResources();
    res.json(featuredResources);
  } catch (error) {
    console.error("Error fetching featured resources:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/resources/:id - Get single resource
router.get("/api/resources/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const resource = await storage.getResourceById(id);
    
    if (!resource) {
      return res.status(404).json({ error: "Resource not found" });
    }
    
    res.json(resource);
  } catch (error) {
    console.error("Error fetching resource:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/resources - Create new resource
router.post("/api/resources", async (req, res) => {
  try {
    const resourceData = insertResourceSchema.parse(req.body);
    const newResource = await storage.createResource(resourceData);
    res.status(201).json(newResource);
  } catch (error) {
    console.error("Error creating resource:", error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid resource data", details: error.errors });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

// PUT /api/resources/:id - Update resource
router.put("/api/resources/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = insertResourceSchema.partial().parse(req.body);
    const updatedResource = await storage.updateResource(id, updateData);
    
    if (!updatedResource) {
      return res.status(404).json({ error: "Resource not found" });
    }
    
    res.json(updatedResource);
  } catch (error) {
    console.error("Error updating resource:", error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid resource data", details: error.errors });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

// DELETE /api/resources/:id - Delete resource
router.delete("/api/resources/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await storage.deleteResource(id);
    
    if (!deleted) {
      return res.status(404).json({ error: "Resource not found" });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting resource:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export function registerRoutes(app: any) {
  app.use(router);
  return app;
}

export default router;
