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
  Chip,
  CircularProgress,
  Alert,
  Pagination
} from '@mui/material';
import axios from 'axios';

const ACTION_COLORS = {
  EXPENSE_CREATED: 'primary',
  EXPENSE_UPDATED: 'info',
  EXPENSE_DELETED: 'error',
  OCR_VERIFIED: 'success',
  USER_CORRECTION: 'warning',
  EXPENSE_SUBMITTED: 'secondary',
  EXPENSE_APPROVED: 'success',
  EXPENSE_REJECTED: 'error'
};

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchAuditLogs = async (pageNum = 1) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/approvals/audit-logs?page=${pageNum}&limit=20`);
      setLogs(res.data.data);
      setTotalPages(res.data.pagination.pages || 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs(page);
  }, [page]);

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight="700">
            Enterprise Audit Trail
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Immutable system activity log recording all creation, edits, approvals, and OCR corrections
          </Typography>
        </Box>
        <Chip label="Gap 5: Auditability" color="primary" variant="outlined" size="small" />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', mb: 3 }}>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          ) : logs.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography color="text.secondary">No audit logs recorded yet.</Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} elevation={0}>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Timestamp</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>User / Actor</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Event Details</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>IP Address</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log._id} hover>
                      <TableCell sx={{ whiteSpace: 'nowrap', fontSize: '0.8rem', color: 'text.secondary' }}>
                        {new Date(log.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={log.action}
                          size="small"
                          color={ACTION_COLORS[log.action] || 'default'}
                          sx={{ fontSize: '0.72rem', height: 22 }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{log.userName}</TableCell>
                      <TableCell>
                        <Chip label={log.userRole} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />
                      </TableCell>
                      <TableCell sx={{ maxWidth: 400 }}>
                        <Typography variant="body2">{log.details}</Typography>
                        {log.changes && log.changes.length > 0 && (
                          <Box sx={{ mt: 0.5 }}>
                            {log.changes.map((c, i) => (
                              <Typography key={i} variant="caption" display="block" color="#0369a1">
                                <strong>{c.field}:</strong> {String(c.oldValue)} ➔ {String(c.newValue)}
                              </Typography>
                            ))}
                          </Box>
                        )}
                      </TableCell>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'text.secondary' }}>
                        {log.ipAddress}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(e, val) => setPage(val)}
                color="primary"
              />
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default AuditLogs;
