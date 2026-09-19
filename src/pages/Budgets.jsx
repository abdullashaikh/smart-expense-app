import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  MenuItem,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Divider,
  Stack
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = [
  'Overall',
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

const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' }
];

const Budgets = () => {
  const { user } = useAuth();
  const now = new Date();

  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Dialog State
  const [openDialog, setOpenDialog] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [formData, setFormData] = useState({
    category: 'Overall',
    amount: '',
    month: now.getMonth() + 1,
    year: now.getFullYear()
  });
  const [dialogError, setDialogError] = useState('');
  const [dialogLoading, setDialogLoading] = useState(false);

  // Delete Dialog
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchBudgets = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/api/budgets', {
        params: { month, year }
      });
      setBudgets(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch budgets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [month, year]);

  const handleOpenCreate = () => {
    setEditingBudget(null);
    setFormData({
      category: 'Overall',
      amount: '',
      month,
      year
    });
    setDialogError('');
    setOpenDialog(true);
  };

  const handleOpenEdit = (b) => {
    setEditingBudget(b);
    setFormData({
      category: b.category,
      amount: b.amount,
      month: b.month,
      year: b.year
    });
    setDialogError('');
    setOpenDialog(true);
  };

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    setDialogError('');

    if (!formData.amount || formData.amount <= 0) {
      setDialogError('Please enter a valid budget amount greater than zero.');
      return;
    }

    setDialogLoading(true);
    try {
      if (editingBudget) {
        await axios.put(`/api/budgets/${editingBudget._id}`, {
          amount: parseFloat(formData.amount)
        });
      } else {
        await axios.post('/api/budgets', {
          ...formData,
          amount: parseFloat(formData.amount)
        });
      }
      setOpenDialog(false);
      fetchBudgets();
    } catch (err) {
      setDialogError(err.response?.data?.message || 'Failed to save budget.');
    } finally {
      setDialogLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await axios.delete(`/api/budgets/${deleteId}`);
      setDeleteId(null);
      fetchBudgets();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete budget.');
    } finally {
      setDeleting(false);
    }
  };

  const currencySymbol = user?.currencyPreference === 'USD' ? '$' : user?.currencyPreference === 'EUR' ? '€' : '₹';

  // Separate overall vs category budgets
  const overallBudget = budgets.find((b) => b.category === 'Overall');
  const categoryBudgets = budgets.filter((b) => b.category !== 'Overall');

  const getStatusColor = (status) => {
    switch (status) {
      case 'Exceeded':
        return '#ef4444'; // Red
      case 'Critical':
        return '#f97316'; // Orange-red
      case 'Warning':
        return '#f59e0b'; // Amber
      default:
        return '#10b981'; // Green
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Exceeded':
        return <ErrorOutlineIcon sx={{ color: '#ef4444' }} />;
      case 'Critical':
      case 'Warning':
        return <WarningAmberIcon sx={{ color: '#f59e0b' }} />;
      default:
        return <CheckCircleOutlineIcon sx={{ color: '#10b981' }} />;
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
          <Typography variant="h4" fontWeight="700" color="#0f172a">
            Budget Management & Tracking
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Set and track monthly spending targets across overall and category-specific budgets.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddCircleOutlineIcon />}
          onClick={handleOpenCreate}
          sx={{ backgroundColor: '#0284c7', '&:hover': { backgroundColor: '#0369a1' }, fontWeight: 600 }}
        >
          Create Budget
        </Button>
      </Box>

      {/* Month & Year Selector */}
      <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', mb: 3, p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Typography variant="subtitle2" fontWeight="600" color="text.secondary">
            Select Billing Cycle:
          </Typography>
          <TextField
            select
            size="small"
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            sx={{ minWidth: 140 }}
          >
            {MONTHS.map((m) => (
              <MenuItem key={m.value} value={m.value}>
                {m.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            type="number"
            size="small"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            sx={{ width: 110 }}
          />
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
          {/* Section 1: Overall Monthly Budget */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" fontWeight="700" sx={{ mb: 2 }}>
              Overall Monthly Budget
            </Typography>
            {overallBudget ? (
              <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', p: 1 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{ p: 1, bgcolor: '#e0f2fe', color: '#0284c7', borderRadius: 2 }}>
                        <AccountBalanceWalletIcon />
                      </Box>
                      <Box>
                        <Typography variant="h6" fontWeight="700">
                          Total Budget: {currencySymbol} {overallBudget.amount?.toLocaleString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          All categories combined for {MONTHS.find((m) => m.value === month)?.label} {year}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        icon={getStatusIcon(overallBudget.trackingStatus)}
                        label={`${overallBudget.trackingStatus} (${overallBudget.percentageUsed}%)`}
                        sx={{
                          borderColor: getStatusColor(overallBudget.trackingStatus),
                          color: getStatusColor(overallBudget.trackingStatus),
                          fontWeight: 700
                        }}
                        variant="outlined"
                      />
                      <IconButton size="small" onClick={() => handleOpenEdit(overallBudget)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => setDeleteId(overallBudget._id)}>
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>

                  {/* Progress Bar */}
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" fontWeight="600">
                        Spent: {currencySymbol} {overallBudget.actualSpent?.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Remaining: {currencySymbol} {overallBudget.remainingAmount?.toLocaleString()}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(100, overallBudget.percentageUsed)}
                      sx={{
                        height: 10,
                        borderRadius: 5,
                        bgcolor: '#e2e8f0',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: getStatusColor(overallBudget.trackingStatus)
                        }
                      }}
                    />
                  </Box>

                  {overallBudget.trackingMessage && (
                    <Typography
                      variant="caption"
                      sx={{ color: getStatusColor(overallBudget.trackingStatus), fontWeight: 600 }}
                    >
                      {overallBudget.trackingMessage}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card sx={{ borderRadius: 3, border: '1px dashed #cbd5e1', bgcolor: '#f8fafc', p: 3, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  No overall monthly budget set for {MONTHS.find((m) => m.value === month)?.label} {year}.
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleOpenCreate}
                  sx={{ mt: 1.5, fontWeight: 600, color: '#0284c7', borderColor: '#0284c7' }}
                >
                  Set Overall Budget
                </Button>
              </Card>
            )}
          </Box>

          {/* Section 2: Category-Wise Budgets */}
          <Box>
            <Typography variant="h6" fontWeight="700" sx={{ mb: 2 }}>
              Category-Wise Budgets ({categoryBudgets.length})
            </Typography>

            {categoryBudgets.length === 0 ? (
              <Card sx={{ borderRadius: 3, border: '1px dashed #cbd5e1', bgcolor: '#f8fafc', p: 4, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  No category-specific budgets configured for this month.
                </Typography>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleOpenCreate}
                  sx={{ mt: 1.5, backgroundColor: '#0284c7', fontWeight: 600 }}
                >
                  Add Category Budget
                </Button>
              </Card>
            ) : (
              <Grid container spacing={3}>
                {categoryBudgets.map((b) => (
                  <Grid item xs={12} sm={6} md={4} key={b._id}>
                    <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', height: '100%' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                          <Typography variant="subtitle1" fontWeight="700">
                            {b.category}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <IconButton size="small" onClick={() => handleOpenEdit(b)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" color="error" onClick={() => setDeleteId(b._id)}>
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>

                        <Box sx={{ mb: 2 }}>
                          <Typography variant="h5" fontWeight="700" color="#0f172a">
                            {currencySymbol} {b.actualSpent?.toLocaleString()}{' '}
                            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>
                              / {currencySymbol} {b.amount?.toLocaleString()}
                            </span>
                          </Typography>
                        </Box>

                        <Box sx={{ mb: 1.5 }}>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min(100, b.percentageUsed)}
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              bgcolor: '#e2e8f0',
                              '& .MuiLinearProgress-bar': {
                                bgcolor: getStatusColor(b.trackingStatus)
                              }
                            }}
                          />
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Chip
                            label={`${b.trackingStatus} (${b.percentageUsed}%)`}
                            size="small"
                            sx={{
                              borderColor: getStatusColor(b.trackingStatus),
                              color: getStatusColor(b.trackingStatus),
                              fontWeight: 700
                            }}
                            variant="outlined"
                          />
                          <Typography variant="caption" color="text.secondary">
                            Remaining: {currencySymbol} {b.remainingAmount?.toLocaleString()}
                          </Typography>
                        </Box>

                        {b.trackingMessage && (
                          <Typography
                            variant="caption"
                            display="block"
                            sx={{ mt: 1, color: getStatusColor(b.trackingStatus), fontWeight: 500 }}
                          >
                            {b.trackingMessage}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editingBudget ? 'Edit Budget' : 'Create New Monthly Budget'}
        </DialogTitle>
        <Box component="form" onSubmit={handleSaveBudget}>
          <DialogContent>
            {dialogError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {dialogError}
              </Alert>
            )}

            <Stack spacing={2.5}>
              <TextField
                label="Category"
                select
                fullWidth
                disabled={Boolean(editingBudget)}
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {CATEGORIES.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c === 'Overall' ? '⭐ Overall Monthly Budget' : c}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Budget Limit Amount"
                type="number"
                required
                fullWidth
                inputProps={{ step: '1', min: '1' }}
                placeholder="e.g. 10000"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />

              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Month"
                  select
                  fullWidth
                  disabled={Boolean(editingBudget)}
                  value={formData.month}
                  onChange={(e) => setFormData({ ...formData, month: Number(e.target.value) })}
                >
                  {MONTHS.map((m) => (
                    <MenuItem key={m.value} value={m.value}>
                      {m.label}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  label="Year"
                  type="number"
                  fullWidth
                  disabled={Boolean(editingBudget)}
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                />
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenDialog(false)} color="inherit">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={dialogLoading}
              sx={{ backgroundColor: '#0284c7' }}
            >
              {dialogLoading ? 'Saving...' : 'Save Budget'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={Boolean(deleteId)} onClose={() => setDeleteId(null)}>
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Budget</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this budget? Past expenses will not be affected.
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteId(null)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Budgets;
