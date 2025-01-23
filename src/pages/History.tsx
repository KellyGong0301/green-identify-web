import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Pagination,
  Box,
  Alert,
} from '@mui/material';
import axios from 'axios';
import { PLANT_ENDPOINTS } from '../api/config';
import { getAuthHeader } from '../api/config';
import { format } from 'date-fns';

interface Plant {
  id: string;
  commonName: string;
  scientificName: string;
  description: string;
  imageUrl: string;
  careInfo: any;
  createdAt: string;
}

interface HistoryResponse {
  plants: Plant[];
  total: number;
  currentPage: number;
  totalPages: number;
}

const History: React.FC = () => {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchHistory = async (pageNum: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get<HistoryResponse>(
        `${PLANT_ENDPOINTS.history}?page=${pageNum}&limit=6`,
        { headers: getAuthHeader() }
      );
      setPlants(response.data.plants);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      setError('获取历史记录失败，请稍后重试');
      console.error('Error fetching history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    fetchHistory(value);
  };

  const handlePlantClick = async (plant: Plant) => {
    try {
      const response = await axios.get(
        PLANT_ENDPOINTS.details(plant.id),
        { headers: getAuthHeader() }
      );
      setSelectedPlant(response.data);
      setDialogOpen(true);
    } catch (err) {
      console.error('Error fetching plant details:', err);
    }
  };

  useEffect(() => {
    fetchHistory(1);
  }, []);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography 
        variant="h4" 
        component="h1" 
        gutterBottom
        sx={{
          fontWeight: 600,
          color: 'primary.main',
          mb: 4
        }}
      >
        识别历史
      </Typography>

      {plants.length === 0 ? (
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '200px',
            bgcolor: 'background.paper',
            borderRadius: 4,
            p: 4,
            boxShadow: 1
          }}
        >
          <Typography variant="body1" color="text.secondary">
            暂无识别记录
          </Typography>
        </Box>
      ) : (
        <>
          <Grid container spacing={4}>
            {plants.map((plant) => (
              <Grid item xs={12} sm={6} md={4} key={plant.id}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    cursor: 'pointer',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                    },
                  }}
                  onClick={() => handlePlantClick(plant)}
                >
                  <CardMedia
                    component="img"
                    height="240"
                    image={plant.imageUrl || '/placeholder.jpg'}
                    alt={plant.commonName}
                    sx={{ 
                      objectFit: 'cover',
                      borderBottom: '1px solid',
                      borderColor: 'divider'
                    }}
                  />
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Typography 
                      gutterBottom 
                      variant="h6" 
                      component="div"
                      sx={{ 
                        fontWeight: 600,
                        color: 'primary.main'
                      }}
                    >
                      {plant.commonName}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'text.secondary',
                        mb: 2
                      }}
                    >
                      {plant.scientificName}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      display="block" 
                      sx={{ 
                        color: 'text.secondary',
                        mt: 'auto'
                      }}
                    >
                      识别时间: {format(new Date(plant.createdAt), 'yyyy-MM-dd HH:mm')}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ mt: 6, display: 'flex', justifyContent: 'center' }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
              size="large"
              sx={{
                '& .MuiPaginationItem-root': {
                  fontSize: '1rem',
                }
              }}
            />
          </Box>
        </>
      )}

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            overflow: 'hidden'
          }
        }}
      >
        {selectedPlant && (
          <>
            <DialogTitle 
              sx={{ 
                p: 3,
                bgcolor: 'background.paper'
              }}
            >
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 600,
                  color: 'primary.main'
                }}
              >
                {selectedPlant.commonName}
              </Typography>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  color: 'text.secondary',
                  mt: 0.5
                }}
              >
                {selectedPlant.scientificName}
              </Typography>
            </DialogTitle>
            <DialogContent 
              dividers 
              sx={{ 
                p: 3,
                bgcolor: 'background.paper'
              }}
            >
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <Box
                    component="img"
                    src={selectedPlant.imageUrl || '/placeholder.jpg'}
                    alt={selectedPlant.commonName}
                    sx={{
                      width: '100%',
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography 
                    variant="h6" 
                    gutterBottom
                    sx={{ 
                      fontWeight: 600,
                      color: 'primary.main',
                      mb: 2
                    }}
                  >
                    植物描述
                  </Typography>
                  <Typography 
                    paragraph
                    sx={{ 
                      color: 'text.primary',
                      mb: 3
                    }}
                  >
                    {selectedPlant.description || '暂无描述'}
                  </Typography>
                  
                  {selectedPlant.careInfo && (
                    <>
                      <Typography 
                        variant="h6" 
                        gutterBottom
                        sx={{ 
                          fontWeight: 600,
                          color: 'primary.main',
                          mb: 2,
                          mt: 4
                        }}
                      >
                        护理信息
                      </Typography>
                      <Typography 
                        paragraph
                        sx={{ 
                          color: 'text.primary',
                          mb: 2
                        }}
                      >
                        {selectedPlant.careInfo.general || '暂无护理信息'}
                      </Typography>
                      {selectedPlant.careInfo.watering && (
                        <Typography 
                          paragraph
                          sx={{ mb: 2 }}
                        >
                          <Box component="strong" sx={{ color: 'primary.main' }}>
                            浇水建议：
                          </Box> 
                          {selectedPlant.careInfo.watering}
                        </Typography>
                      )}
                      {selectedPlant.careInfo.sunlight && (
                        <Typography paragraph>
                          <Box component="strong" sx={{ color: 'primary.main' }}>
                            光照需求：
                          </Box> 
                          {selectedPlant.careInfo.sunlight}
                        </Typography>
                      )}
                    </>
                  )}
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 2, bgcolor: 'background.paper' }}>
              <Button 
                onClick={() => setDialogOpen(false)}
                variant="contained"
                sx={{
                  borderRadius: '8px',
                  textTransform: 'none',
                  px: 4
                }}
              >
                关闭
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default History;
