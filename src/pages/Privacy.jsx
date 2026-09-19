import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Alert,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Chip,
  CircularProgress
} from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import LockIcon from '@mui/icons-material/Lock';
import ShieldIcon from '@mui/icons-material/Shield';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Privacy = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [exporting, setExporting] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleExportData = async () => {
    setExporting(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await axios.get('/api/privacy/export-data', { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `expense_data_${user?._id || 'user'}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setMessage({ type: 'success', text: 'Personal data archive exported successfully.' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to export personal data.' });
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await axios.delete('/api/privacy/delete-account');
      setDeleteDialog(false);
      logout();
      navigate('/login');
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete account. Please try again.' });
      setDeleting(false);
      setDeleteDialog(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight="700">
            Privacy & Data Protection Center
          </Typography>
          <Typography variant="body2" color="text.secondary">
            User financial privacy, automated PII redaction, and GDPR / DPDP compliance
          </Typography>
        </Box>
        <Chip label="Gap 3: Financial Data Protection" color="primary" variant="outlined" size="small" />
      </Box>

      {message.text && (
        <Alert severity={message.type} sx={{ mb: 3 }} onClose={() => setMessage({ type: '', text: '' })}>
          {message.text}
        </Alert>
      )}

      {/* Security Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <ShieldIcon sx={{ color: '#0284c7' }} />
                <Typography variant="subtitle1" fontWeight="700">
                  PII Masking
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                13-16 digit credit/debit card numbers on scanned receipts are automatically masked (e.g. **** **** **** 4444) before database storage.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <LockIcon sx={{ color: '#16a34a' }} />
                <Typography variant="subtitle1" fontWeight="700">
                  Encrypted Storage
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                User passwords hashed using bcrypt (10 rounds). Passwords and sensitive tokens are strictly excluded from default queries.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <SecurityIcon sx={{ color: '#6366f1' }} />
                <Typography variant="subtitle1" fontWeight="700">
                  Data Sovereignty
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Full compliance with Data Portability (JSON export) and Right to be Forgotten (complete account & physical file erasure).
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Data Management Card */}
      <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight="700" sx={{ mb: 1 }}>
            Data Portability & Export
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Download a complete, machine-readable JSON archive containing your user profile, all recorded expenses, line items, budgets, alerts, and category classifications.
          </Typography>
          <Button
            variant="contained"
            startIcon={exporting ? <CircularProgress size={18} color="inherit" /> : <DownloadIcon />}
            onClick={handleExportData}
            disabled={exporting}
            sx={{ bgcolor: '#0284c7', '&:hover': { bgcolor: '#0369a1' }, fontWeight: 600 }}
          >
            {exporting ? 'Generating Archive...' : 'Export My Financial Data (JSON)'}
          </Button>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" fontWeight="700" color="error" sx={{ mb: 1 }}>
            Danger Zone: Right to be Forgotten
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Permanently delete your account, all associated expense records, and physical receipt images stored on the server. This action is immediate and irreversible.
          </Typography>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteForeverIcon />}
            onClick={() => setDeleteDialog(true)}
            sx={{ fontWeight: 600 }}
          >
            Delete Account & All Receipts Permanently
          </Button>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle sx={{ fontWeight: 700, color: '#dc2626' }}>
          Confirm Permanent Data Deletion
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to permanently delete your account? All your recorded expenses, uploaded receipts on disk, monthly budgets, and alert logs will be permanently deleted and cannot be recovered.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteDialog(false)} color="inherit" disabled={deleting}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteAccount}
            disabled={deleting}
            sx={{ fontWeight: 600 }}
          >
            {deleting ? 'Deleting...' : 'Yes, Delete Everything'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Privacy;
