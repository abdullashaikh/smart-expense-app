import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Stack
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableChartIcon from '@mui/icons-material/TableChart';
import AssessmentIcon from '@mui/icons-material/Assessment';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = [
  'All',
  'Food',
  'Travel',
  'Transportation',
  'Shopping',
  'Utilities',
  'Bills',
  'Healthcare',
  'Education',
  'Entertainment',
  'Other'
];

const Reports = () => {
  const { user } = useAuth();

  const [datePreset, setDatePreset] = useState('current_month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [category, setCategory] = useState('All');
  const [vendor, setVendor] = useState('');

  const [loading, setLoading] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadingExcel, setDownloadingExcel] = useState(false);
  const [error, setError] = useState('');
  const [previewData, setPreviewData] = useState(null);

  // Compute preset dates
  useEffect(() => {
    const now = new Date();
    if (datePreset === 'current_month') {
      const s = new Date(now.getFullYear(), now.getMonth(), 1);
      const e = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      setStartDate(s.toISOString().split('T')[0]);
      setEndDate(e.toISOString().split('T')[0]);
    } else if (datePreset === 'previous_month') {
      const s = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const e = new Date(now.getFullYear(), now.getMonth(), 0);
      setStartDate(s.toISOString().split('T')[0]);
      setEndDate(e.toISOString().split('T')[0]);
    } else if (datePreset === 'ytd') {
      const s = new Date(now.getFullYear(), 0, 1);
      const e = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      setStartDate(s.toISOString().split('T')[0]);
      setEndDate(e.toISOString().split('T')[0]);
    } else if (datePreset === 'all') {
      setStartDate('');
      setEndDate('');
    }
  }, [datePreset]);

  // Load preview data
  const fetchPreview = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (category !== 'All') params.category = category;
      if (vendor) params.vendor = vendor;

      const [sumRes, catRes, expRes] = await Promise.all([
        axios.get('/api/analytics/summary', { params }),
        axios.get('/api/analytics/categories', { params }),
        axios.get('/api/expenses', { params: { ...params, limit: 15 } })
      ]);

      setPreviewData({
        summary: sumRes.data.data,
        categories: catRes.data.data,
        expenses: expRes.data.data
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load report preview');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPreview();
  }, [startDate, endDate, category]);

  const handleDownloadPdf = async () => {
    setDownloadingPdf(true);
    setError('');
    try {
      const response = await axios.post(
        '/api/reports/pdf',
        { startDate, endDate, category, vendor },
        { responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Smart_Expense_Report_${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Failed to generate PDF report. Please try again.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleDownloadExcel = async () => {
    setDownloadingExcel(true);
    setError('');
    try {
      const response = await axios.post(
        '/api/reports/excel',
        { startDate, endDate, category, vendor },
        {
          responseType: 'blob'
        }
      );

      const url = window.URL.createObjectURL(
        new Blob([response.data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        })
      );
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Smart_Expense_Report_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Failed to generate Excel report. Please try again.');
    } finally {
      setDownloadingExcel(false);
    }
  };

  const currencySymbol = user?.currencyPreference === 'USD' ? '$' : user?.currencyPreference === 'EUR' ? '€' : '₹';

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
            <AssessmentIcon sx={{ color: '#0284c7', fontSize: 32 }} />
            <Typography variant="h4" fontWeight="700" color="#0f172a">
              Financial Reports
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary">
            Generate and export audit-ready PDF and Excel reports with customizable period filters.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5}>
          <Button
            variant="contained"
            color="error"
            startIcon={downloadingPdf ? <CircularProgress size={20} color="inherit" /> : <PictureAsPdfIcon />}
            onClick={handleDownloadPdf}
            disabled={downloadingPdf || loading}
            sx={{ fontWeight: 600 }}
          >
            {downloadingPdf ? 'Generating PDF...' : 'Export PDF'}
          </Button>

          <Button
            variant="contained"
            color="success"
            startIcon={downloadingExcel ? <CircularProgress size={20} color="inherit" /> : <TableChartIcon />}
            onClick={handleDownloadExcel}
            disabled={downloadingExcel || loading}
            sx={{ fontWeight: 600 }}
          >
            {downloadingExcel ? 'Generating Excel...' : 'Export Excel (.xlsx)'}
          </Button>
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Filter Card */}
      <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', mb: 3 }}>
        <CardContent sx={{ p: 2.5 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <TextField
                label="Period Preset"
                select
                fullWidth
                size="small"
                value={datePreset}
                onChange={(e) => setDatePreset(e.target.value)}
              >
                <MenuItem value="current_month">Current Month</MenuItem>
                <MenuItem value="previous_month">Previous Month</MenuItem>
                <MenuItem value="ytd">Year to Date (YTD)</MenuItem>
                <MenuItem value="all">All Time</MenuItem>
                <MenuItem value="custom">Custom Range</MenuItem>
              </TextField>
            </Grid>

            {datePreset === 'custom' && (
              <>
                <Grid item xs={6} sm={2}>
                  <TextField
                    label="Start Date"
                    type="date"
                    fullWidth
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </Grid>
                <Grid item xs={6} sm={2}>
                  <TextField
                    label="End Date"
                    type="date"
                    fullWidth
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </Grid>
              </>
            )}

            <Grid item xs={12} sm={3}>
              <TextField
                label="Category Filter"
                select
                fullWidth
                size="small"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={2}>
              <TextField
                label="Vendor Filter"
                fullWidth
                size="small"
                placeholder="Optional"
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={datePreset === 'custom' ? 2 : 2}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<FilterAltIcon />}
                onClick={fetchPreview}
                sx={{ backgroundColor: '#0284c7' }}
              >
                Update
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Report Preview */}
      <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', p: 3 }}>
        <Typography variant="h6" fontWeight="700" sx={{ mb: 2 }}>
          Report Preview
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : previewData ? (
          <>
            {/* Key Metrics */}
            <Grid container spacing={2.5} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={4}>
                <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                  <Typography variant="caption" color="text.secondary" fontWeight="700">
                    TOTAL EXPENDITURE
                  </Typography>
                  <Typography variant="h5" fontWeight="700" color="#0f172a">
                    {currencySymbol} {previewData.summary?.totalAmount?.toLocaleString() || 0}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                  <Typography variant="caption" color="text.secondary" fontWeight="700">
                    RECORD COUNT
                  </Typography>
                  <Typography variant="h5" fontWeight="700" color="#0284c7">
                    {previewData.summary?.count || 0} Transactions
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                  <Typography variant="caption" color="text.secondary" fontWeight="700">
                    AVERAGE TICKET SIZE
                  </Typography>
                  <Typography variant="h5" fontWeight="700" color="#16a34a">
                    {currencySymbol} {previewData.summary?.avgAmount?.toFixed(2) || 0}
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {/* Category Breakdown Table */}
            <Typography variant="subtitle1" fontWeight="700" sx={{ mb: 1.5 }}>
              Category Breakdown
            </Typography>
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #f1f5f9', mb: 3 }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Transactions</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Share (%)</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Total Spent</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {previewData.categories?.map((c) => (
                    <TableRow key={c.category} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{c.category}</TableCell>
                      <TableCell>{c.count}</TableCell>
                      <TableCell>{c.percentageOfTotal}%</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        {currencySymbol} {c.totalAmount.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Detailed Transactions Sample */}
            <Typography variant="subtitle1" fontWeight="700" sx={{ mb: 1.5 }}>
              Detailed Transactions (Previewing First 15 Records)
            </Typography>
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #f1f5f9' }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Vendor / Merchant</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Payment Method</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Source</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {previewData.expenses?.map((e) => (
                    <TableRow key={e._id} hover>
                      <TableCell>{new Date(e.date).toLocaleDateString()}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{e.vendor}</TableCell>
                      <TableCell>
                        <Chip label={e.category} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>{e.paymentMethod}</TableCell>
                      <TableCell>
                        <Chip
                          label={e.source}
                          size="small"
                          sx={{
                            backgroundColor: e.source === 'OCR' ? '#e0f2fe' : '#f1f5f9',
                            color: e.source === 'OCR' ? '#0369a1' : '#475569',
                            fontWeight: 600
                          }}
                        />
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        {currencySymbol} {e.amount.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        ) : (
          <Box sx={{ py: 6, textAlign: 'center', color: '#94a3b8' }}>
            <Typography variant="body1">No records match the report parameters.</Typography>
          </Box>
        )}
      </Card>
    </Box>
  );
};

export default Reports;
