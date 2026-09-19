import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Typography,
  MenuItem,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = [
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

const PAYMENT_METHODS = [
  'Cash',
  'Credit Card',
  'Debit Card',
  'UPI',
  'Net Banking',
  'Other'
];

const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP'];

const AddExpense = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    vendor: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: 'Food',
    currency: user?.currencyPreference || 'INR',
    paymentMethod: 'UPI',
    description: '',
    subtotal: '',
    tax: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e, ignoreDuplicate = false) => {
    if (e) e.preventDefault();
    setError('');

    if (!formData.vendor || !formData.amount || !formData.category) {
      setError('Please fill in Vendor, Amount, and Category.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount),
        subtotal: formData.subtotal ? parseFloat(formData.subtotal) : undefined,
        tax: formData.tax ? parseFloat(formData.tax) : 0,
        source: 'MANUAL',
        ignoreDuplicateWarning: ignoreDuplicate
      };

      await axios.post('/api/expenses', payload);
      navigate('/expenses');
    } catch (err) {
      if (err.response?.status === 409 && err.response?.data?.isDuplicateWarning) {
        setDuplicateWarning(err.response.data.message);
        setShowDuplicateDialog(true);
      } else {
        setError(err.response?.data?.message || 'Failed to save expense. Please check your inputs.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ color: '#64748b' }}
        >
          Back
        </Button>
        <Typography variant="h5" fontWeight="700">
          Add Manual Expense
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', p: 1 }}>
        <CardContent>
          <Box component="form" onSubmit={(e) => handleSubmit(e, false)}>
            <Grid container spacing={2.5}>
              {/* Vendor */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Vendor / Merchant Name"
                  name="vendor"
                  fullWidth
                  required
                  placeholder="e.g. Starbucks, Amazon, Shell"
                  value={formData.vendor}
                  onChange={handleChange}
                />
              </Grid>

              {/* Amount */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Total Amount"
                  name="amount"
                  type="number"
                  inputProps={{ step: '0.01', min: '0.01' }}
                  fullWidth
                  required
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={handleChange}
                />
              </Grid>

              {/* Date */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Expense Date"
                  name="date"
                  type="date"
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                  value={formData.date}
                  onChange={handleChange}
                />
              </Grid>

              {/* Category */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Category"
                  name="category"
                  select
                  fullWidth
                  required
                  value={formData.category}
                  onChange={handleChange}
                >
                  {CATEGORIES.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Currency */}
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Currency"
                  name="currency"
                  select
                  fullWidth
                  value={formData.currency}
                  onChange={handleChange}
                >
                  {CURRENCIES.map((c) => (
                    <MenuItem key={c} value={c}>
                      {c}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Payment Method */}
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Payment Method"
                  name="paymentMethod"
                  select
                  fullWidth
                  value={formData.paymentMethod}
                  onChange={handleChange}
                >
                  {PAYMENT_METHODS.map((pm) => (
                    <MenuItem key={pm} value={pm}>
                      {pm}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Subtotal (Optional) */}
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Subtotal (Optional)"
                  name="subtotal"
                  type="number"
                  inputProps={{ step: '0.01', min: '0' }}
                  fullWidth
                  placeholder="0.00"
                  value={formData.subtotal}
                  onChange={handleChange}
                />
              </Grid>

              {/* Tax (Optional) */}
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Tax / GST (Optional)"
                  name="tax"
                  type="number"
                  inputProps={{ step: '0.01', min: '0' }}
                  fullWidth
                  placeholder="0.00"
                  value={formData.tax}
                  onChange={handleChange}
                />
              </Grid>

              {/* Description / Notes */}
              <Grid item xs={12} sm={8}>
                <TextField
                  label="Description / Notes"
                  name="description"
                  fullWidth
                  multiline
                  rows={2}
                  placeholder="Additional context about this expense..."
                  value={formData.description}
                  onChange={handleChange}
                />
              </Grid>

              {/* Submit Button */}
              <Grid item xs={12} sx={{ mt: 1 }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  startIcon={<SaveIcon />}
                  sx={{
                    backgroundColor: '#0284c7',
                    '&:hover': { backgroundColor: '#0369a1' },
                    px: 4,
                    py: 1.2,
                    fontWeight: 600
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Save Expense'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>

      {/* Duplicate Warning Dialog */}
      <Dialog open={showDuplicateDialog} onClose={() => setShowDuplicateDialog(false)}>
        <DialogTitle sx={{ fontWeight: 700, color: '#d97706' }}>
          Possible Duplicate Expense Detected
        </DialogTitle>
        <DialogContent>
          <DialogContentText>{duplicateWarning}</DialogContentText>
          <DialogContentText sx={{ mt: 2, fontWeight: 500 }}>
            Do you want to continue and save this expense anyway, or cancel?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setShowDuplicateDialog(false)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={() => {
              setShowDuplicateDialog(false);
              handleSubmit(null, true);
            }}
            variant="contained"
            color="warning"
            sx={{ fontWeight: 600 }}
          >
            Save Anyway
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AddExpense;
