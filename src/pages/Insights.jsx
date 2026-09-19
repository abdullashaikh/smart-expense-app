import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  Stack
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import RefreshIcon from '@mui/icons-material/Refresh';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import axios from 'axios';

const Insights = () => {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchInsights = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/api/insights');
      setInsights(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate spending insights');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return '#ef4444';
      case 'warning':
        return '#f59e0b';
      default:
        return '#0284c7';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return <ErrorOutlineIcon sx={{ color: '#ef4444' }} />;
      case 'warning':
        return <WarningAmberIcon sx={{ color: '#f59e0b' }} />;
      default:
        return <InfoOutlinedIcon sx={{ color: '#0284c7' }} />;
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AutoAwesomeIcon sx={{ color: '#0284c7', fontSize: 28 }} />
            <Typography variant="h4" fontWeight="700" color="#0f172a">
              AI Spending Insights
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary">
            Deterministic financial analysis explained with machine learning intelligence.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchInsights}
          disabled={loading}
          sx={{ borderColor: '#0284c7', color: '#0284c7', fontWeight: 600 }}
        >
          {loading ? 'Analyzing...' : 'Re-Evaluate Insights'}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {insights.map((ins, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card
                sx={{
                  borderRadius: 3,
                  border: '1px solid #e2e8f0',
                  borderLeft: `5px solid ${getSeverityColor(ins.severity)}`,
                  height: '100%',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)'
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getSeverityIcon(ins.severity)}
                      <Typography variant="h6" fontWeight="700">
                        {ins.title}
                      </Typography>
                    </Box>
                    <Chip
                      label={ins.comparisonPeriod || 'Analysis'}
                      size="small"
                      sx={{ bgcolor: '#f1f5f9', fontWeight: 600, fontSize: '0.75rem' }}
                    />
                  </Box>

                  <Typography variant="body1" color="#334155" sx={{ mb: 2, lineHeight: 1.6 }}>
                    {ins.message}
                  </Typography>

                  <Divider sx={{ my: 1.5 }} />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {ins.category && (
                        <Chip label={`Category: ${ins.category}`} size="small" variant="outlined" />
                      )}
                      {ins.amount && (
                        <Chip
                          label={`Amount: ₹${ins.amount?.toLocaleString()}`}
                          size="small"
                          sx={{ bgcolor: '#e0f2fe', color: '#0369a1', fontWeight: 600 }}
                        />
                      )}
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(ins.generatedDate).toLocaleDateString()}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default Insights;
