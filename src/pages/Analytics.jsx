import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  TextField,
  MenuItem,
  Button,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip
} from '@mui/material';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import ClearIcon from '@mui/icons-material/Clear';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line
} from 'recharts';

const COLORS = [
  '#0284c7', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#06b6d4', '#84cc16', '#64748b', '#d97706'
];

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

const Analytics = () => {
  const { user } = useAuth();
  const [tabIndex, setTabIndex] = useState(0);

  // Global filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [category, setCategory] = useState('All');
  const [vendor, setVendor] = useState('');

  // Analytics State
  const [summary, setSummary] = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [categories, setCategories] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (category !== 'All') params.category = category;
      if (vendor) params.vendor = vendor;

      const [sumRes, monthRes, catRes, vendRes, trendRes] = await Promise.all([
        axios.get('/api/analytics/summary', { params }),
        axios.get('/api/analytics/monthly', { params }),
        axios.get('/api/analytics/categories', { params }),
        axios.get('/api/analytics/vendors', { params }),
        axios.get('/api/analytics/trends', { params })
      ]);

      setSummary(sumRes.data.data);
      setMonthly(monthRes.data.data);
      setCategories(catRes.data.data);
      setVendors(vendRes.data.data);
      setTrends(trendRes.data.data?.daily || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load spending analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [category]);

  const handleReset = () => {
    setStartDate('');
    setEndDate('');
    setCategory('All');
    setVendor('');
    fetchAnalytics();
  };

  const currencySymbol = user?.currencyPreference === 'USD' ? '$' : user?.currencyPreference === 'EUR' ? '€' : '₹';

  return (
    <Box>
      {/* Page Title */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="700" color="#0f172a">
          Spending Analytics
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Deep-dive statistical analysis, month-over-month trajectory, and merchant breakdown.
        </Typography>
      </Box>

      {/* Filter Card */}
      <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', mb: 3 }}>
        <CardContent sx={{ p: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <TextField
                label="Category"
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

            <Grid item xs={12} sm={3}>
              <TextField
                label="Merchant / Vendor"
                fullWidth
                size="small"
                placeholder="Search vendor"
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
              />
            </Grid>

            <Grid item xs={6} sm={2}>
              <TextField
                label="From Date"
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
                label="To Date"
                type="date"
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={2} sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                startIcon={<FilterAltIcon />}
                onClick={fetchAnalytics}
                sx={{ backgroundColor: '#0284c7', flexGrow: 1 }}
              >
                Filter
              </Button>
              <Button variant="outlined" onClick={handleReset} sx={{ color: '#64748b' }}>
                <ClearIcon fontSize="small" />
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={tabIndex}
          onChange={(e, val) => setTabIndex(val)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="1. Overview & Stats" sx={{ fontWeight: 600 }} />
          <Tab label="2. Monthly Trajectory" sx={{ fontWeight: 600 }} />
          <Tab label="3. Category Breakdown" sx={{ fontWeight: 600 }} />
          <Tab label="4. Merchant Analysis" sx={{ fontWeight: 600 }} />
          <Tab label="5. Daily Time-Series" sx={{ fontWeight: 600 }} />
        </Tabs>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* TAB 0: Overview & Statistics */}
          {tabIndex === 0 && (
            <Box>
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
                    <CardContent>
                      <Typography variant="caption" color="text.secondary" fontWeight="700">
                        TOTAL EXPENDITURE
                      </Typography>
                      <Typography variant="h5" fontWeight="700" color="#0f172a">
                        {currencySymbol} {summary?.totalAmount?.toLocaleString() || 0}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Across {summary?.count || 0} transactions
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
                    <CardContent>
                      <Typography variant="caption" color="text.secondary" fontWeight="700">
                        AVERAGE TRANSACTION
                      </Typography>
                      <Typography variant="h5" fontWeight="700" color="#0284c7">
                        {currencySymbol} {summary?.avgAmount?.toFixed(2) || 0}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Mean expense size
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
                    <CardContent>
                      <Typography variant="caption" color="text.secondary" fontWeight="700">
                        TRANSACTION RANGE
                      </Typography>
                      <Typography variant="h5" fontWeight="700" color="#334155">
                        {currencySymbol} {summary?.minAmount?.toFixed(2) || 0} - {summary?.maxAmount?.toFixed(2) || 0}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Min and max logged expense
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
                    <CardContent>
                      <Typography variant="caption" color="text.secondary" fontWeight="700">
                        MONTH-OVER-MONTH CHANGE
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography
                          variant="h5"
                          fontWeight="700"
                          color={summary?.comparison?.isIncrease ? '#ef4444' : '#10b981'}
                        >
                          {summary?.comparison?.percentageChange > 0 ? '+' : ''}
                          {summary?.comparison?.percentageChange || 0}%
                        </Typography>
                        {summary?.comparison?.isIncrease ? (
                          <TrendingUpIcon color="error" />
                        ) : (
                          <TrendingDownIcon color="success" />
                        )}
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        Diff: {currencySymbol} {summary?.comparison?.difference?.toLocaleString() || 0}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Summary Highlights */}
              <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', p: 3 }}>
                <Typography variant="h6" fontWeight="700" sx={{ mb: 2 }}>
                  Monthly Comparative Snapshot
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Current Month Spending
                      </Typography>
                      <Typography variant="h4" fontWeight="700" color="#0f172a" sx={{ my: 1 }}>
                        {currencySymbol} {summary?.currentMonth?.total?.toLocaleString() || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total transactions: {summary?.currentMonth?.count || 0}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Previous Month Spending
                      </Typography>
                      <Typography variant="h4" fontWeight="700" color="#64748b" sx={{ my: 1 }}>
                        {currencySymbol} {summary?.previousMonth?.total?.toLocaleString() || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total transactions: {summary?.previousMonth?.count || 0}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Card>
            </Box>
          )}

          {/* TAB 1: Monthly Trajectory */}
          {tabIndex === 1 && (
            <Box>
              <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="700" sx={{ mb: 2 }}>
                    Monthly Spending History & Growth Rate
                  </Typography>
                  {monthly.length > 0 ? (
                    <Box sx={{ height: 320, width: '100%' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={monthly}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="label" />
                          <YAxis />
                          <Tooltip formatter={(v) => `${currencySymbol} ${v}`} />
                          <Bar dataKey="totalAmount" fill="#0284c7" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  ) : (
                    <Box sx={{ py: 6, textAlign: 'center', color: '#94a3b8' }}>
                      <Typography variant="body2">No monthly history available.</Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>

              {/* Monthly Table */}
              <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
                <TableContainer component={Paper} elevation={0}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: '#f8fafc' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Period</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Transactions</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Average Txn</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Growth Rate</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>Total Spent</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {monthly.map((m) => (
                        <TableRow key={m.label} hover>
                          <TableCell sx={{ fontWeight: 600 }}>{m.label}</TableCell>
                          <TableCell>{m.count}</TableCell>
                          <TableCell>{currencySymbol} {m.avgAmount?.toFixed(2)}</TableCell>
                          <TableCell>
                            <Chip
                              label={`${m.growthRate > 0 ? '+' : ''}${m.growthRate}%`}
                              size="small"
                              color={m.growthRate > 0 ? 'warning' : 'success'}
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>
                            {currencySymbol} {m.totalAmount?.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>
            </Box>
          )}

          {/* TAB 2: Category Breakdown */}
          {tabIndex === 2 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={5}>
                <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="700" sx={{ mb: 2 }}>
                      Category Share (% Contribution)
                    </Typography>
                    {categories.length > 0 ? (
                      <Box sx={{ height: 320, width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={categories}
                              dataKey="totalAmount"
                              nameKey="category"
                              cx="50%"
                              cy="50%"
                              outerRadius={85}
                              innerRadius={45}
                              paddingAngle={3}
                            >
                              {categories.map((_, idx) => (
                                <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(v) => `${currencySymbol} ${v}`} />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </Box>
                    ) : (
                      <Box sx={{ py: 6, textAlign: 'center', color: '#94a3b8' }}>
                        <Typography variant="body2">No category records found.</Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={7}>
                <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
                  <TableContainer component={Paper} elevation={0}>
                    <Table size="small">
                      <TableHead sx={{ bgcolor: '#f8fafc' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Transactions</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Share</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>Total Spent</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {categories.map((c) => (
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
                </Card>
              </Grid>
            </Grid>
          )}

          {/* TAB 3: Merchant Analysis */}
          {tabIndex === 3 && (
            <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
              <CardContent>
                <Typography variant="h6" fontWeight="700" sx={{ mb: 2 }}>
                  Top Merchants by Total Expenditure
                </Typography>
                {vendors.length > 0 ? (
                  <TableContainer component={Paper} elevation={0}>
                    <Table size="small">
                      <TableHead sx={{ bgcolor: '#f8fafc' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Merchant / Vendor</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Total Spent</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Txn Count</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Average Expense</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Associated Categories</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {vendors.map((v) => (
                          <TableRow key={v.vendor} hover>
                            <TableCell sx={{ fontWeight: 700 }}>{v.vendor}</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: '#0369a1' }}>
                              {currencySymbol} {v.totalAmount.toLocaleString()}
                            </TableCell>
                            <TableCell>{v.count}</TableCell>
                            <TableCell>{currencySymbol} {v.avgAmount?.toFixed(2)}</TableCell>
                            <TableCell>
                              {v.categories?.map((cat) => (
                                <Chip key={cat} label={cat} size="small" sx={{ mr: 0.5 }} />
                              ))}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Box sx={{ py: 6, textAlign: 'center', color: '#94a3b8' }}>
                    <Typography variant="body2">No merchant records match the criteria.</Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          )}

          {/* TAB 4: Daily Time-Series */}
          {tabIndex === 4 && (
            <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
              <CardContent>
                <Typography variant="h6" fontWeight="700" sx={{ mb: 2 }}>
                  Daily Spending Trajectory
                </Typography>
                {trends.length > 0 ? (
                  <Box sx={{ height: 340, width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trends}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip formatter={(v) => `${currencySymbol} ${v}`} />
                        <Line
                          type="monotone"
                          dataKey="totalAmount"
                          stroke="#0284c7"
                          strokeWidth={2.5}
                          dot={{ r: 3 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                ) : (
                  <Box sx={{ py: 6, textAlign: 'center', color: '#94a3b8' }}>
                    <Typography variant="body2">No daily records for the selected period.</Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </Box>
  );
};

export default Analytics;
