import { Request, Response } from "express";
import { prisma } from "../config/db";
import redisClient from "../config/redis";

const saveToRedis = async (slug: string, data: any) => {
    await redisClient.set(slug, JSON.stringify(data));
};

export const createClient = async (
    req: Request,
    res: Response,
): Promise<void> => {
    try {
        const { name, slug, is_project, client_prefix } = req.body;
        const file = req.file;
        
        let client_logo = "no-image.jpg";
        
        if (file) {
            const protocol = req.protocol;
            const host = req.get("host");
            client_logo = `${protocol}://${host}/uploads/${file.filename}`;
        }

        const newClient = await prisma.myClient.create({
            data: {
                name,
                slug,
                is_project,
                client_prefix,
                client_logo,
            },
        });
        
        await saveToRedis(newClient.slug, newClient);
        
        res.status(201).json({ message: "Success", data: newClient });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getClients = async (req: Request, res: Response) => {
    const clients = await prisma.myClient.findMany({
        where: { deleted_at: null },
    });
    res.json(clients);
};

export const updateClient = async (
    req: Request,
    res: Response,
): Promise<void> => {
    try {
        const { id } = req.params;
        const { name, slug, is_project } = req.body;
        const oldClient = await prisma.myClient.findUnique({
            where: { id: Number(id) },
        });
        if (!oldClient) {
            res.status(404).json({ message: "Not found" });
            return;
        }

        const updatedClient = await prisma.myClient.update({
            where: { id: Number(id) },
            data: {
                name,
                slug,
                is_project,
                updated_at: new Date(),
            },
        });
        
        if (oldClient.slug) await redisClient.del(oldClient.slug);
        await saveToRedis(updatedClient.slug, updatedClient)

        res.json({ message: "Updated", data: updatedClient });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteClient = async (
    req: Request,
    res: Response,
): Promise<void> => {
    try {
        const { id } = req.params;

        const client = await prisma.myClient.findUnique({
            where: { id: Number(id) },
        });
        if (!client) {
            res.status(404).json({ message: "Not found" });
            return;
        }
        await prisma.myClient.update({
            where: { id: Number(id) },
            data: { deleted_at: new Date() },
        });
        await redisClient.del(client.slug);
        res.json({ message: "Soft Deleted and Redis cache removed" });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};