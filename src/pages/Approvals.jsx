import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  IconButton,
  Tooltip
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Approvals = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('PENDING');
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Dialog state
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [actionDialog, setActionDialog] = useState({ open: false, type: '', comment: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchApprovals = async (status) => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`/api/approvals?status=${status}`);
      setExpenses(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch approval list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals(tab);
  }, [tab]);

  const handleAction = async () => {
    if (!selectedExpense || !actionDialog.type) return;

    if (actionDialog.type === 'REJECT' && !actionDialog.comment.trim()) {
      setError('Please provide a reason / comment when rejecting an expense.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await axios.patch(`/api/approvals/${selectedExpense._id}/action`, {
        action: actionDialog.type,
        comment: actionDialog.comment
      });

      setActionSuccess(`Expense ${actionDialog.type === 'APPROVE' ? 'approved' : 'rejected'} successfully.`);
      setActionDialog({ open: false, type: '', comment: '' });
      setSelectedExpense(null);
      fetchApprovals(tab);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process approval action');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight="700">
            Expense Approval Workflow
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Enterprise multi-user governance: Review, verify, and approve organizational expenses
          </Typography>
        </Box>
        <Chip label="Gap 5: Enterprise Governance" color="primary" variant="outlined" size="small" />
      </Box>

      {actionSuccess && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setActionSuccess('')}>
          {actionSuccess}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', mb: 3 }}>
        <Tabs
          value={tab}
          onChange={(e, val) => setTab(val)}
          sx={{ px: 2, borderBottom: '1px solid #e2e8f0' }}
        >
          <Tab label="Pending Review" value="PENDING" />
          <Tab label="Approved Expenses" value="APPROVED" />
          <Tab label="Rejected Expenses" value="REJECTED" />
        </Tabs>

        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          ) : expenses.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography color="text.secondary">
                No {tab.toLowerCase()} expenses found.
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Employee</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Vendor</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Amount</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Source</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {expenses.map((exp) => (
                    <TableRow key={exp._id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="600">
                          {exp.userId?.name || 'Employee'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {exp.userId?.email}
                        </Typography>
                      </TableCell>
                      <TableCell>{exp.vendor}</TableCell>
                      <TableCell>
                        <Chip label={exp.category} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>{new Date(exp.date).toLocaleDateString()}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>
                        {exp.currency} {exp.amount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={exp.source}
                          size="small"
                          sx={{
                            bgcolor: exp.source === 'OCR' ? '#e0f2fe' : '#f1f5f9',
                            color: exp.source === 'OCR' ? '#0369a1' : '#475569'
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={exp.approvalStatus}
                          size="small"
                          color={
                            exp.approvalStatus === 'APPROVED'
                              ? 'success'
                              : exp.approvalStatus === 'REJECTED'
                              ? 'error'
                              : 'warning'
                          }
                        />
                      </TableCell>
                      <TableCell sx={{ textAlign: 'right' }}>
                        <Tooltip title="View Details & Audit Trail">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/expenses/${exp._id}`)}
                            sx={{ color: '#0284c7' }}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {exp.approvalStatus === 'PENDING' && (
                          <>
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              startIcon={<CheckCircleOutlineIcon />}
                              onClick={() => {
                                setSelectedExpense(exp);
                                setActionDialog({ open: true, type: 'APPROVE', comment: '' });
                              }}
                              sx={{ ml: 1 }}
                            >
                              Approve
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              startIcon={<HighlightOffIcon />}
                              onClick={() => {
                                setSelectedExpense(exp);
                                setActionDialog({ open: true, type: 'REJECT', comment: '' });
                              }}
                              sx={{ ml: 1 }}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Approve / Reject Dialog */}
      <Dialog
        open={actionDialog.open}
        onClose={() => setActionDialog({ open: false, type: '', comment: '' })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          {actionDialog.type === 'APPROVE' ? 'Approve Expense' : 'Reject Expense'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {actionDialog.type === 'APPROVE'
              ? `Are you sure you want to approve this expense of ${selectedExpense?.currency} ${selectedExpense?.amount} for ${selectedExpense?.vendor}?`
              : `Please specify the reason for rejecting this expense:`}
          </Typography>
          <TextField
            label={actionDialog.type === 'APPROVE' ? 'Approval Remark (Optional)' : 'Rejection Reason (Required)'}
            fullWidth
            multiline
            rows={3}
            value={actionDialog.comment}
            onChange={(e) => setActionDialog((prev) => ({ ...prev, comment: e.target.value }))}
            required={actionDialog.type === 'REJECT'}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setActionDialog({ open: false, type: '', comment: '' })}
            color="inherit"
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color={actionDialog.type === 'APPROVE' ? 'success' : 'error'}
            onClick={handleAction}
            disabled={submitting}
          >
            {submitting ? 'Processing...' : actionDialog.type === 'APPROVE' ? 'Confirm Approval' : 'Confirm Rejection'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Approvals;
