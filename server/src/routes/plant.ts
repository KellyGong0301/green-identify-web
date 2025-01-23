import { Router } from 'express';
import axios from 'axios';
import { AzureOpenAIService } from '../services/azureOpenAI';
import { authenticateToken } from '../middleware/auth';
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const router = Router();
const PLANT_ID_API_KEY = process.env.PLANT_ID_API_KEY;
const PLANT_ID_API_ENDPOINT = 'https://api.plant.id/v3/identification';
const prisma = new PrismaClient();

// 植物识别路由
router.post('/identify', authenticateToken, async (req, res) => {
  try {
    const { image } = req.body;
    
    if (!PLANT_ID_API_KEY) {
      throw new Error('Plant.id API key is not configured');
    }

    // 从 base64 字符串中移除前缀，如果有的话
    const base64Data = image.includes('base64,') 
      ? image.split('base64,')[1]
      : image;

    console.log('Making request to Plant.id API...');
    console.log('API Key:', PLANT_ID_API_KEY);
    console.log('API Endpoint:', PLANT_ID_API_ENDPOINT);
    
    // 调用 Plant.id API 进行识别
    const response = await axios.post(
      PLANT_ID_API_ENDPOINT,
      {
        images: [base64Data],
        similar_images: true
      },
      {
        headers: {
          'Api-Key': PLANT_ID_API_KEY,
        },
      }
    );

    console.log('Plant.id API Response:', JSON.stringify(response.data, null, 2));

    // 保存识别结果到数据库
    const result = response.data;
    if (result?.result?.classification?.suggestions?.length > 0) {
      const suggestion = result.result.classification.suggestions[0];
      console.log('First suggestion:', JSON.stringify(suggestion, null, 2));
      
      const plant = await prisma.plant.create({
        data: {
          commonName: suggestion.details?.common_names?.[0] || suggestion.name || 'Unknown Plant',
          scientificName: suggestion.name || 'Unknown Scientific Name',
          description: suggestion.details?.description || '',
          imageUrl: image,
          careInfo: null,
          userId: req.user.userId,
        },
      });

      response.data.plantId = plant.id;
    }

    res.json(response.data);
  } catch (error: any) {
    console.error('Error identifying plant:');
    console.error('Error response:', error.response?.data);
    console.error('Error message:', error.message);
    console.error('Full error:', error);
    res.status(500).json({ 
      message: '植物识别失败',
      error: error.response?.data || error.message 
    });
  }
});

// 植物护理信息路由
router.post('/care', authenticateToken, async (req, res) => {
  try {
    const { commonName, scientificName, description } = req.body;
    const openAIService = AzureOpenAIService.getInstance();
    const careInfo = await openAIService.getPlantCareInfo({
      commonName,
      scientificName,
      description,
    });
    res.json(careInfo);
  } catch (error: any) {
    console.error('Error getting plant care info:', error);
    res.status(500).json({ 
      message: '获取植物护理信息失败',
      error: error.message 
    });
  }
});

// 获取用户的植物识别历史
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    const [plants, total] = await Promise.all([
      prisma.plant.findMany({
        where: { userId: req.user.userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.plant.count({
        where: { userId: req.user.userId },
      }),
    ]);

    res.json({
      plants,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ message: '获取历史记录失败' });
  }
});

// 获取单个植物的详细信息
router.get('/details/:id', authenticateToken, async (req, res) => {
  try {
    const plant = await prisma.plant.findFirst({
      where: {
        AND: [
          { id: req.params.id },
          { userId: req.user.userId }
        ]
      },
    });

    if (!plant) {
      return res.status(404).json({ message: '未找到该植物记录' });
    }

    res.json(plant);
  } catch (error) {
    console.error('Error fetching plant details:', error);
    res.status(500).json({ message: '获取植物详情失败' });
  }
});

export default router;
