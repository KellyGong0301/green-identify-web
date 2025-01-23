import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// 获取用户统计信息
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // 获取用户的所有植物识别记录
    const plantRecords = await prisma.plant.findMany({
      where: {
        userId: userId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // 计算统计信息
    const stats = {
      totalIdentifications: plantRecords.length,
      lastIdentification: plantRecords[0]?.createdAt || null,
      plantFamilies: new Set(plantRecords.map(p => p.scientificName.split(' ')[0])).size,
      commonPlants: await prisma.plant.groupBy({
        by: ['commonName'],
        where: {
          userId: userId
        },
        _count: {
          commonName: true
        },
        orderBy: {
          _count: {
            commonName: 'desc'
          }
        },
        take: 3
      })
    };

    res.json(stats);
  } catch (error) {
    console.error('Error getting user stats:', error);
    res.status(500).json({ message: '获取用户统计信息失败' });
  }
});

export default router;
