import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Pagination,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import ClearIcon from '@mui/icons-material/Clear';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { useNavigate } from 'react-router-dom';
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

const ExpenseList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [source, setSource] = useState('All');
  const [paymentMethod, setPaymentMethod] = useState('All');
  const [verificationStatus, setVerificationStatus] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [order, setOrder] = useState('desc');

  // Delete confirmation dialog
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Edit dialog state
  const [editExpense, setEditExpense] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  const fetchExpenses = async (page = currentPage) => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page,
        limit: 10,
        sortBy,
        order
      };
      if (search) params.search = search;
      if (category !== 'All') params.category = category;
      if (source !== 'All') params.source = source;
      if (paymentMethod !== 'All') params.paymentMethod = paymentMethod;
      if (verificationStatus !== 'All') params.verificationStatus = verificationStatus;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (minAmount) params.minAmount = minAmount;
      if (maxAmount) params.maxAmount = maxAmount;

      const res = await axios.get('/api/expenses', { params });
      setExpenses(res.data.data);
      setTotalPages(res.data.totalPages || 1);
      setTotalCount(res.data.total || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses(1);
    setCurrentPage(1);
  }, [category, source, paymentMethod, verificationStatus, sortBy, order]);

  const handleApplyFilter = () => {
    fetchExpenses(1);
    setCurrentPage(1);
  };

  const handleResetFilter = () => {
    setSearch('');
    setCategory('All');
    setSource('All');
    setPaymentMethod('All');
    setVerificationStatus('All');
    setStartDate('');
    setEndDate('');
    setMinAmount('');
    setMaxAmount('');
    setSortBy('date');
    setOrder('desc');
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await axios.delete(`/api/expenses/${deleteId}`);
      setDeleteId(null);
      fetchExpenses(currentPage);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete expense');
    } finally {
      setDeleting(false);
    }
  };

  const handleEditSubmit = async () => {
    if (!editExpense) return;
    setEditLoading(true);
    try {
      await axios.put(`/api/expenses/${editExpense._id}`, editExpense);
      setEditExpense(null);
      fetchExpenses(currentPage);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update expense');
    } finally {
      setEditLoading(false);
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
          <Typography variant="h4" fontWeight="700" color="#0f172a">
            Expense Management & History
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Filter, search, audit, and manage your manual and OCR-extracted expenses ({totalCount} total).
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddCircleOutlineIcon />}
          onClick={() => navigate('/add-expense')}
          sx={{ backgroundColor: '#0284c7', '&:hover': { backgroundColor: '#0369a1' }, fontWeight: 600 }}
        >
          Add Expense
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Filter Card */}
      <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <TextField
                label="Search Vendor / Description"
                fullWidth
                size="small"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyFilter()}
              />
            </Grid>

            <Grid item xs={6} sm={2}>
              <TextField
                label="Category"
                select
                fullWidth
                size="small"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={6} sm={2}>
              <TextField
                label="Source"
                select
                fullWidth
                size="small"
                value={source}
                onChange={(e) => setSource(e.target.value)}
              >
                <MenuItem value="All">All Sources</MenuItem>
                <MenuItem value="MANUAL">Manual</MenuItem>
                <MenuItem value="OCR">OCR</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={6} sm={2}>
              <TextField
                label="Payment Method"
                select
                fullWidth
                size="small"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <MenuItem value="All">All Payments</MenuItem>
                <MenuItem value="Cash">Cash</MenuItem>
                <MenuItem value="Credit Card">Credit Card</MenuItem>
                <MenuItem value="Debit Card">Debit Card</MenuItem>
                <MenuItem value="UPI">UPI</MenuItem>
                <MenuItem value="Net Banking">Net Banking</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={6} sm={2}>
              <TextField
                label="Verification"
                select
                fullWidth
                size="small"
                value={verificationStatus}
                onChange={(e) => setVerificationStatus(e.target.value)}
              >
                <MenuItem value="All">All Statuses</MenuItem>
                <MenuItem value="VERIFIED">Verified</MenuItem>
                <MenuItem value="CORRECTED">Corrected</MenuItem>
                <MenuItem value="WARNING">Warning</MenuItem>
                <MenuItem value="INVALID">Invalid</MenuItem>
              </TextField>
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

            <Grid item xs={6} sm={2}>
              <TextField
                label="Min Amount"
                type="number"
                fullWidth
                size="small"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
              />
            </Grid>

            <Grid item xs={6} sm={2}>
              <TextField
                label="Max Amount"
                type="number"
                fullWidth
                size="small"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
              />
            </Grid>

            <Grid item xs={6} sm={2}>
              <TextField
                label="Sort By"
                select
                fullWidth
                size="small"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <MenuItem value="date">Date</MenuItem>
                <MenuItem value="amount">Amount</MenuItem>
                <MenuItem value="vendor">Vendor</MenuItem>
                <MenuItem value="createdAt">Date Added</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={6} sm={2}>
              <TextField
                label="Order"
                select
                fullWidth
                size="small"
                value={order}
                onChange={(e) => setOrder(e.target.value)}
              >
                <MenuItem value="desc">Descending</MenuItem>
                <MenuItem value="asc">Ascending</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={4} sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                startIcon={<FilterAltIcon />}
                onClick={handleApplyFilter}
                sx={{ backgroundColor: '#0284c7', flexGrow: 1 }}
              >
                Apply
              </Button>
              <Button
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={handleResetFilter}
                sx={{ color: '#64748b' }}
              >
                Reset
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Table */}
      <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Vendor / Merchant</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Source</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Verification</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : expenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6, color: '#94a3b8' }}>
                    <Typography variant="body1">No expenses match your search or filters.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                expenses.map((exp) => (
                  <TableRow key={exp._id} hover>
                    <TableCell>{new Date(exp.date).toLocaleDateString()}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{exp.vendor}</TableCell>
                    <TableCell>
                      <Chip label={exp.category} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>
                      {exp.currency || currencySymbol} {exp.amount?.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={exp.source}
                        size="small"
                        sx={{
                          backgroundColor: exp.source === 'OCR' ? '#e0f2fe' : '#f1f5f9',
                          color: exp.source === 'OCR' ? '#0369a1' : '#475569',
                          fontWeight: 600
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={exp.isManuallyCorrected ? 'Corrected' : exp.validationStatus || 'Verified'}
                        size="small"
                        color={
                          exp.validationStatus === 'WARNING'
                            ? 'warning'
                            : exp.isManuallyCorrected
                            ? 'info'
                            : 'success'
                        }
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => navigate(`/expenses/${exp._id}`)}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Expense">
                        <IconButton
                          size="small"
                          color="default"
                          onClick={() => setEditExpense(exp)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Expense">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => setDeleteId(exp._id)}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(e, page) => {
              setCurrentPage(page);
              fetchExpenses(page);
            }}
            color="primary"
          />
        </Box>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={Boolean(deleteId)} onClose={() => setDeleteId(null)}>
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Expense</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this expense record? If a receipt was attached, it will also be removed from server storage.
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

      {/* Edit Dialog */}
      {editExpense && (
        <Dialog open={Boolean(editExpense)} onClose={() => setEditExpense(null)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 700 }}>Edit Expense</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Vendor"
                fullWidth
                value={editExpense.vendor}
                onChange={(e) => setEditExpense({ ...editExpense, vendor: e.target.value })}
              />
              <TextField
                label="Amount"
                type="number"
                fullWidth
                value={editExpense.amount}
                onChange={(e) => setEditExpense({ ...editExpense, amount: parseFloat(e.target.value) })}
              />
              <TextField
                label="Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={editExpense.date ? editExpense.date.split('T')[0] : ''}
                onChange={(e) => setEditExpense({ ...editExpense, date: e.target.value })}
              />
              <TextField
                label="Category"
                select
                fullWidth
                value={editExpense.category}
                onChange={(e) => setEditExpense({ ...editExpense, category: e.target.value })}
              >
                {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={2}
                value={editExpense.description || ''}
                onChange={(e) => setEditExpense({ ...editExpense, description: e.target.value })}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setEditExpense(null)} color="inherit">
              Cancel
            </Button>
            <Button
              onClick={handleEditSubmit}
              variant="contained"
              disabled={editLoading}
              sx={{ backgroundColor: '#0284c7' }}
            >
              {editLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default ExpenseList;
