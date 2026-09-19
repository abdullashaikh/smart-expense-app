import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import EditNoteIcon from '@mui/icons-material/EditNote';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ExpenseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchExpense = async () => {
      try {
        const res = await axios.get(`/api/expenses/${id}`);
        setExpense(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load expense details');
      } finally {
        setLoading(false);
      }
    };
    fetchExpense();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !expense) {
    return (
      <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
        <Alert severity="error">{error || 'Expense not found'}</Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/expenses')} sx={{ mt: 2 }}>
          Back to Expenses
        </Button>
      </Box>
    );
  }

  const receiptUrl = expense.receipt?.filename ? `/uploads/receipts/${expense.receipt.filename}` : null;

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/expenses')} sx={{ color: '#64748b' }}>
          Back to List
        </Button>
        <Typography variant="h5" fontWeight="700">
          Expense Details & Audit Trail
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Main Details Card */}
        <Grid item xs={12} md={receiptUrl ? 7 : 12}>
          <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Typography variant="h4" fontWeight="700" color="#0f172a">
                    {expense.currency} {expense.amount?.toFixed(2)}
                  </Typography>
                  <Typography variant="h6" color="#334155" fontWeight="600">
                    {expense.vendor}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column', alignItems: 'flex-end' }}>
                  <Chip
                    label={expense.source}
                    sx={{
                      backgroundColor: expense.source === 'OCR' ? '#e0f2fe' : '#f1f5f9',
                      color: expense.source === 'OCR' ? '#0369a1' : '#475569',
                      fontWeight: 600
                    }}
                  />
                  {expense.isManuallyCorrected ? (
                    <Chip
                      icon={<EditNoteIcon />}
                      label="Manually Corrected"
                      color="info"
                      size="small"
                    />
                  ) : (
                    <Chip
                      icon={<CheckCircleOutlineIcon />}
                      label="Automated Verified"
                      color="success"
                      size="small"
                    />
                  )}
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    CATEGORY
                  </Typography>
                  <Typography variant="body1" fontWeight="600">
                    {expense.category}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    DATE
                  </Typography>
                  <Typography variant="body1" fontWeight="600">
                    {new Date(expense.date).toLocaleDateString()}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    PAYMENT METHOD
                  </Typography>
                  <Typography variant="body1" fontWeight="600">
                    {expense.paymentMethod}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    SUBTOTAL / TAX
                  </Typography>
                  <Typography variant="body1" fontWeight="600">
                    {expense.subtotal ? `${expense.currency} ${expense.subtotal}` : 'N/A'} / {expense.tax ? `${expense.currency} ${expense.tax}` : 'N/A'}
                  </Typography>
                </Grid>
                {expense.description && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">
                      DESCRIPTION
                    </Typography>
                    <Typography variant="body2">{expense.description}</Typography>
                  </Grid>
                )}
              </Grid>

              {/* Research Audit Trail & OCR Comparison */}
              {expense.source === 'OCR' && (
                <Box sx={{ mt: 3, p: 2.5, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle1" fontWeight="700" color="#0f172a">
                      OCR Extracted vs Final Saved Comparison
                    </Typography>
                    <Chip
                      size="small"
                      label={expense.isManuallyCorrected ? 'User Modified' : 'Auto Accepted'}
                      color={expense.isManuallyCorrected ? 'warning' : 'success'}
                      variant="outlined"
                    />
                  </Box>

                  <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 1.5, mb: 2 }}>
                    <Table size="small">
                      <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700 }}>Field</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Original OCR / AI Value</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Final Saved Value</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Match Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {[
                          {
                            label: 'Vendor / Merchant',
                            ocrVal: expense.ocrExtractedData?.vendor || 'Not detected',
                            savedVal: expense.vendor,
                            isModified: expense.userCorrectedFields?.includes('vendor') || (expense.ocrExtractedData?.vendor && expense.ocrExtractedData?.vendor !== expense.vendor)
                          },
                          {
                            label: 'Amount',
                            ocrVal: expense.ocrExtractedData?.amount ? `${expense.currency} ${expense.ocrExtractedData.amount}` : 'Not detected',
                            savedVal: `${expense.currency} ${expense.amount}`,
                            isModified: expense.userCorrectedFields?.includes('amount') || (expense.ocrExtractedData?.amount && Number(expense.ocrExtractedData?.amount) !== Number(expense.amount))
                          },
                          {
                            label: 'Date',
                            ocrVal: expense.ocrExtractedData?.date ? new Date(expense.ocrExtractedData.date).toLocaleDateString() : 'Not detected',
                            savedVal: new Date(expense.date).toLocaleDateString(),
                            isModified: expense.userCorrectedFields?.includes('date')
                          },
                          {
                            label: 'Category',
                            ocrVal: expense.aiPredictedCategory || expense.ocrExtractedData?.category || 'Other',
                            savedVal: expense.category,
                            isModified: expense.userCorrectedFields?.includes('category') || (expense.aiPredictedCategory && expense.aiPredictedCategory !== expense.category)
                          },
                          {
                            label: 'Subtotal',
                            ocrVal: expense.ocrExtractedData?.subtotal ? `${expense.currency} ${expense.ocrExtractedData.subtotal}` : 'N/A',
                            savedVal: expense.subtotal ? `${expense.currency} ${expense.subtotal}` : 'N/A',
                            isModified: expense.userCorrectedFields?.includes('subtotal')
                          },
                          {
                            label: 'Tax / GST',
                            ocrVal: expense.ocrExtractedData?.tax ? `${expense.currency} ${expense.ocrExtractedData.tax}` : 'N/A',
                            savedVal: expense.tax ? `${expense.currency} ${expense.tax}` : 'N/A',
                            isModified: expense.userCorrectedFields?.includes('tax')
                          }
                        ].map((row, idx) => (
                          <TableRow key={idx} sx={{ bgcolor: row.isModified ? '#fffbeb' : 'inherit' }}>
                            <TableCell sx={{ fontWeight: 600 }}>{row.label}</TableCell>
                            <TableCell sx={{ color: row.ocrVal === 'Not detected' ? 'text.secondary' : 'inherit' }}>
                              {row.ocrVal}
                            </TableCell>
                            <TableCell sx={{ fontWeight: row.isModified ? 700 : 400, color: row.isModified ? '#b45309' : 'inherit' }}>
                              {row.savedVal}
                            </TableCell>
                            <TableCell>
                              {row.isModified ? (
                                <Chip label="Modified" size="small" color="warning" sx={{ height: 22, fontSize: '0.72rem' }} />
                              ) : (
                                <Chip label="Exact Match" size="small" color="success" variant="outlined" sx={{ height: 22, fontSize: '0.72rem' }} />
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <Typography variant="body2" color="text.secondary">
                    AI Predicted: <strong>{expense.aiPredictedCategory || 'N/A'}</strong> (Confidence: {Math.round((expense.aiConfidence || 0) * 100)}%)
                  </Typography>
                  {expense.isManuallyCorrected && expense.userCorrectedFields?.length > 0 && (
                    <Typography variant="body2" color="#0369a1" sx={{ mt: 0.5 }}>
                      User corrected the following fields: <strong>{expense.userCorrectedFields.join(', ')}</strong>
                    </Typography>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Extracted Items (if any) */}
          {expense.items && expense.items.length > 0 && (
            <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', mb: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="700" sx={{ mb: 2 }}>
                  Purchased Items
                </Typography>
                <TableContainer component={Paper} elevation={0}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: '#f8fafc' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Item Name</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Qty</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Price</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {expense.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{expense.currency} {item.price}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          )}

          {/* Raw OCR Text Accordion */}
          {expense.rawOcrText && (
            <Accordion sx={{ boxShadow: 'none', border: '1px solid #e2e8f0', borderRadius: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2" fontWeight="600">
                  Raw Tesseract.js Extracted Text
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ bgcolor: '#f8fafc' }}>
                <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.8rem', fontFamily: 'monospace', margin: 0 }}>
                  {expense.rawOcrText}
                </pre>
              </AccordionDetails>
            </Accordion>
          )}
        </Grid>

        {/* Right Column: Receipt Image */}
        {receiptUrl && (
          <Grid item xs={12} md={5}>
            <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', position: 'sticky', top: 80 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="700" sx={{ mb: 2 }}>
                  Receipt Document
                </Typography>
                <Box sx={{ bgcolor: '#f1f5f9', p: 1, borderRadius: 2, textAlign: 'center' }}>
                  <img
                    src={receiptUrl}
                    alt="Receipt"
                    style={{
                      maxWidth: '100%',
                      maxHeight: 500,
                      objectFit: 'contain',
                      borderRadius: 4
                    }}
                  />
                </Box>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1, textAlign: 'center' }}>
                  Original Name: {expense.receipt.originalName} ({Math.round(expense.receipt.size / 1024)} KB)
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default ExpenseDetails;
