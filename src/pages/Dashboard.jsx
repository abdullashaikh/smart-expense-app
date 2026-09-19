import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  MenuItem,
  TextField,
  LinearProgress,
  Stack
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ReceiptIcon from '@mui/icons-material/Receipt';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DocumentScannerIcon from '@mui/icons-material/DocumentScanner';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import HistoryToggleOffIcon from '@mui/icons-material/HistoryToggleOff';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';

const COLORS = [
  '#0284c7', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#06b6d4', '#84cc16', '#64748b', '#d97706'
];

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState('current_month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const params = { period };
      if (period === 'custom') {
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
      }
      const res = await axios.get('/api/dashboard', { params });
      setData(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [period]);

  const currencySymbol = user?.currencyPreference === 'USD' ? '$' : user?.currencyPreference === 'EUR' ? '€' : '₹';

  return (
    <Box>
      {/* Header & Quick Actions */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          mb: 3,
          gap: 2
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight="700" color="#0f172a">
            Executive Financial Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Advanced real-time analytics, OCR verification status, and budget utilization overview.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<AddCircleOutlineIcon />}
            onClick={() => navigate('/add-expense')}
            sx={{ borderColor: '#0284c7', color: '#0284c7', fontWeight: 600 }}
          >
            Add Expense
          </Button>
          <Button
            variant="contained"
            startIcon={<DocumentScannerIcon />}
            onClick={() => navigate('/upload-receipt')}
            sx={{ backgroundColor: '#0284c7', '&:hover': { backgroundColor: '#0369a1' }, fontWeight: 600 }}
          >
            Scan Receipt (OCR)
          </Button>
        </Box>
      </Box>

      {/* Period Filter Bar */}
      <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', mb: 3, p: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Typography variant="subtitle2" fontWeight="600" color="text.secondary">
            Analysis Period:
          </Typography>
          <TextField
            select
            size="small"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="current_month">Current Month</MenuItem>
            <MenuItem value="previous_month">Previous Month</MenuItem>
            <MenuItem value="custom">Custom Date Range</MenuItem>
          </TextField>

          {period === 'custom' && (
            <>
              <TextField
                type="date"
                size="small"
                label="From"
                InputLabelProps={{ shrink: true }}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <TextField
                type="date"
                size="small"
                label="To"
                InputLabelProps={{ shrink: true }}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
              <Button variant="contained" size="small" onClick={fetchDashboard} sx={{ backgroundColor: '#0284c7' }}>
                Apply
              </Button>
            </>
          )}
        </Box>
      </Card>

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
        <>
          {/* Metrics Row (7 Key Metrics) */}
          <Grid container spacing={2.5} sx={{ mb: 4 }}>
            {/* Total Spending */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight="700">
                      TOTAL SPENDING
                    </Typography>
                    <Box sx={{ p: 0.8, bgcolor: '#e0f2fe', color: '#0284c7', borderRadius: 2 }}>
                      <AccountBalanceWalletIcon fontSize="small" />
                    </Box>
                  </Box>
                  <Typography variant="h5" fontWeight="700" color="#0f172a">
                    {currencySymbol} {data?.totalExpenses?.toLocaleString() || 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {data?.totalCount || 0} total transactions
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Current Month Spending */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight="700">
                      CURRENT MONTH
                    </Typography>
                    <Box sx={{ p: 0.8, bgcolor: '#dcfce7', color: '#16a34a', borderRadius: 2 }}>
                      <CalendarMonthIcon fontSize="small" />
                    </Box>
                  </Box>
                  <Typography variant="h5" fontWeight="700" color="#0f172a">
                    {currencySymbol} {data?.currentMonthExpenses?.toLocaleString() || 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {data?.currentMonthCount || 0} expenses this cycle
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Previous Month Spending */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight="700">
                      PREVIOUS MONTH
                    </Typography>
                    <Box sx={{ p: 0.8, bgcolor: '#fef3c7', color: '#d97706', borderRadius: 2 }}>
                      <HistoryToggleOffIcon fontSize="small" />
                    </Box>
                  </Box>
                  <Typography variant="h5" fontWeight="700" color="#0f172a">
                    {currencySymbol} {data?.previousMonthExpenses?.toLocaleString() || 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Prior billing cycle total
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Budget Used % */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight="700">
                      BUDGET UTILIZATION
                    </Typography>
                    <Box
                      sx={{
                        p: 0.8,
                        bgcolor:
                          data?.budgetUsedPercentage > 100
                            ? '#fee2e2'
                            : data?.budgetUsedPercentage > 85
                            ? '#fef3c7'
                            : '#dcfce7',
                        color:
                          data?.budgetUsedPercentage > 100
                            ? '#dc2626'
                            : data?.budgetUsedPercentage > 85
                            ? '#d97706'
                            : '#16a34a',
                        borderRadius: 2
                      }}
                    >
                      <PriorityHighIcon fontSize="small" />
                    </Box>
                  </Box>
                  <Typography variant="h5" fontWeight="700" color="#0f172a">
                    {data?.budgetUsedPercentage || 0}%
                  </Typography>
                  <Box sx={{ width: '100%', mt: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(100, data?.budgetUsedPercentage || 0)}
                      color={
                        data?.budgetUsedPercentage > 100
                          ? 'error'
                          : data?.budgetUsedPercentage > 85
                          ? 'warning'
                          : 'success'
                      }
                      sx={{ height: 6, borderRadius: 2 }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Average Monthly Spending */}
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
                <CardContent sx={{ py: 1.8 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight="700">
                    AVERAGE MONTHLY SPEND
                  </Typography>
                  <Typography variant="h6" fontWeight="700">
                    {currencySymbol} {data?.avgMonthlyExpenses?.toLocaleString() || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Highest Single Expense */}
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
                <CardContent sx={{ py: 1.8 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight="700">
                    HIGHEST SINGLE EXPENSE
                  </Typography>
                  <Typography variant="h6" fontWeight="700" color="#b91c1c">
                    {currencySymbol} {data?.highestExpense?.toLocaleString() || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Total Expense Count */}
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
                <CardContent sx={{ py: 1.8 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight="700">
                    TOTAL TRANSACTIONS LOGGED
                  </Typography>
                  <Typography variant="h6" fontWeight="700" color="#0369a1">
                    {data?.totalCount || 0} Records
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Charts Row 1: Monthly Trends & Category Breakdown */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Monthly Trend */}
            <Grid item xs={12} md={7}>
              <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="700" sx={{ mb: 2 }}>
                    Monthly Spending Trend
                  </Typography>
                  {data?.monthlySpendingTrend && data.monthlySpendingTrend.length > 0 ? (
                    <Box sx={{ height: 280, width: '100%' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.monthlySpendingTrend}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                          <YAxis tick={{ fontSize: 12 }} />
                          <Tooltip formatter={(v) => `${currencySymbol} ${v}`} />
                          <Bar dataKey="totalAmount" fill="#0284c7" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  ) : (
                    <Box sx={{ py: 8, textAlign: 'center', color: '#94a3b8' }}>
                      <Typography variant="body2">No trend data available yet.</Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Category Breakdown */}
            <Grid item xs={12} md={5}>
              <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="700" sx={{ mb: 2 }}>
                    Category-Wise Spending
                  </Typography>
                  {data?.categorySummary && data.categorySummary.length > 0 ? (
                    <Box sx={{ height: 280, width: '100%' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={data.categorySummary}
                            dataKey="totalAmount"
                            nameKey="category"
                            cx="50%"
                            cy="50%"
                            outerRadius={85}
                            innerRadius={45}
                            paddingAngle={3}
                          >
                            {data.categorySummary.map((_, idx) => (
                              <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(v) => `${currencySymbol} ${v}`} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                  ) : (
                    <Box sx={{ py: 8, textAlign: 'center', color: '#94a3b8' }}>
                      <Typography variant="body2">No category data for selected period.</Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Charts Row 2: Daily Spending & Budget vs Actual */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Daily Spending Line Chart */}
            <Grid item xs={12} md={7}>
              <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="700" sx={{ mb: 2 }}>
                    Daily Spending Profile
                  </Typography>
                  {data?.dailySpending && data.dailySpending.length > 0 ? (
                    <Box sx={{ height: 260, width: '100%' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data.dailySpending}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                          <YAxis tick={{ fontSize: 11 }} />
                          <Tooltip formatter={(v) => `${currencySymbol} ${v}`} />
                          <Line type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </Box>
                  ) : (
                    <Box sx={{ py: 6, textAlign: 'center', color: '#94a3b8' }}>
                      <Typography variant="body2">No daily transactions in this period.</Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Budget vs Actual */}
            <Grid item xs={12} md={5}>
              <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="700" sx={{ mb: 2 }}>
                    Budget vs. Actual Spending
                  </Typography>
                  {data?.budgetVsActual && data.budgetVsActual.length > 0 ? (
                    <Box sx={{ height: 260, width: '100%' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.budgetVsActual}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                          <YAxis tick={{ fontSize: 11 }} />
                          <Tooltip formatter={(v) => `${currencySymbol} ${v}`} />
                          <Legend />
                          <Bar dataKey="budget" name="Budget Limit" fill="#cbd5e1" radius={[3, 3, 0, 0]} />
                          <Bar dataKey="actual" name="Actual Spent" fill="#0284c7" radius={[3, 3, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  ) : (
                    <Box sx={{ py: 6, textAlign: 'center', color: '#94a3b8' }}>
                      <Typography variant="body2">No active budgets configured for this month.</Typography>
                      <Button
                        size="small"
                        onClick={() => navigate('/budgets')}
                        sx={{ mt: 1, fontWeight: 600 }}
                      >
                        Create a Budget
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Top Vendors & Recent Expenses */}
          <Grid container spacing={3}>
            {/* Top Vendors */}
            <Grid item xs={12} md={5}>
              <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="700" sx={{ mb: 2 }}>
                    Top Spending Merchants
                  </Typography>
                  {data?.topVendors && data.topVendors.length > 0 ? (
                    <TableContainer component={Paper} elevation={0}>
                      <Table size="small">
                        <TableHead sx={{ bgcolor: '#f8fafc' }}>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>Vendor</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Txns</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600 }}>
                              Total
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {data.topVendors.map((v) => (
                            <TableRow key={v.vendor} hover>
                              <TableCell sx={{ fontWeight: 600 }}>{v.vendor}</TableCell>
                              <TableCell>{v.count}</TableCell>
                              <TableCell align="right" sx={{ fontWeight: 700 }}>
                                {currencySymbol} {v.totalAmount.toLocaleString()}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Box sx={{ py: 4, textAlign: 'center', color: '#94a3b8' }}>
                      <Typography variant="body2">No merchant records found.</Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Recent Expenses Table */}
            <Grid item xs={12} md={7}>
              <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" fontWeight="700">
                      Recent Expenses
                    </Typography>
                    <Button
                      endIcon={<ArrowForwardIcon />}
                      onClick={() => navigate('/expenses')}
                      size="small"
                      sx={{ fontWeight: 600 }}
                    >
                      View All
                    </Button>
                  </Box>

                  {data?.recentExpenses && data.recentExpenses.length > 0 ? (
                    <TableContainer component={Paper} elevation={0}>
                      <Table size="small">
                        <TableHead sx={{ bgcolor: '#f8fafc' }}>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Vendor</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600 }}>
                              Amount
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {data.recentExpenses.map((exp) => (
                            <TableRow
                              key={exp._id}
                              hover
                              sx={{ cursor: 'pointer' }}
                              onClick={() => navigate(`/expenses/${exp._id}`)}
                            >
                              <TableCell>{new Date(exp.date).toLocaleDateString()}</TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>{exp.vendor}</TableCell>
                              <TableCell>
                                <Chip label={exp.category} size="small" variant="outlined" />
                              </TableCell>
                              <TableCell align="right" sx={{ fontWeight: 700 }}>
                                {currencySymbol} {exp.amount.toFixed(2)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Box sx={{ py: 4, textAlign: 'center', color: '#94a3b8' }}>
                      <Typography variant="body2">No recent expenses.</Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
};

export default Dashboard;
