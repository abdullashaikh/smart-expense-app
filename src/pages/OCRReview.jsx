import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Chip,
  Alert,
  AlertTitle,
  MenuItem,
  CircularProgress,
  Divider,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShieldIcon from '@mui/icons-material/Shield';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

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

const OCRReview = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const ocrData = location.state?.ocrData;

  // If no OCR data was passed, redirect to upload
  useEffect(() => {
    if (!ocrData) {
      navigate('/upload-receipt');
    }
  }, [ocrData, navigate]);

  if (!ocrData) return null;

  const { receipt, rawOcrText, ocrConfidence, extracted, ai, validation, duplicate, qualityAdvisory, piiMasked } = ocrData;

  // State for editable fields
  const [formData, setFormData] = useState({
    vendor: extracted?.vendor || '',
    amount: extracted?.amount || '',
    date: extracted?.date || new Date().toISOString().split('T')[0],
    category: ai?.predictedCategory || 'Other',
    currency: extracted?.currency || 'INR',
    subtotal: extracted?.subtotal || '',
    tax: extracted?.tax || '',
    paymentMethod: 'Credit Card',
    description: extracted?.description || `Receipt from ${extracted?.vendor || 'Merchant'}`
  });

  const [submitForApproval, setSubmitForApproval] = useState(false);

  // Track original values to compute user-corrected fields diff
  const originalValues = {
    vendor: extracted?.vendor || '',
    amount: extracted?.amount || '',
    date: extracted?.date || '',
    category: ai?.predictedCategory || '',
    currency: extracted?.currency || 'INR',
    subtotal: extracted?.subtotal || '',
    tax: extracted?.tax || ''
  };

  const [correctedFields, setCorrectedFields] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [showPreprocessed, setShowPreprocessed] = useState(false);

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Check if value differs from original extracted value
    const isDifferent = String(value) !== String(originalValues[field]);
    setCorrectedFields((prev) => {
      if (isDifferent && !prev.includes(field)) {
        return [...prev, field];
      } else if (!isDifferent && prev.includes(field)) {
        return prev.filter((f) => f !== field);
      }
      return prev;
    });
  };

  const handleSave = async (ignoreDuplicate = false) => {
    setError('');
    setLoading(true);

    try {
      const isManuallyCorrected = correctedFields.length > 0;

      const payload = {
        source: 'OCR',
        vendor: formData.vendor,
        amount: parseFloat(formData.amount),
        date: formData.date,
        category: formData.category,
        currency: formData.currency,
        subtotal: formData.subtotal ? parseFloat(formData.subtotal) : 0,
        tax: formData.tax ? parseFloat(formData.tax) : 0,
        paymentMethod: formData.paymentMethod,
        description: formData.description,
        items: extracted?.items || [],
        receipt: receipt,
        rawOcrText: rawOcrText,
        ocrExtractedData: extracted,
        aiPredictedCategory: ai?.predictedCategory,
        aiConfidence: ai?.confidence,
        validationStatus: isManuallyCorrected ? 'VERIFIED' : validation?.status,
        validationIssues: validation?.issues || [],
        duplicateStatus: duplicate,
        userCorrectedFields: correctedFields,
        isManuallyCorrected: isManuallyCorrected,
        ignoreDuplicateWarning: ignoreDuplicate,
        submitForApproval: submitForApproval
      };

      await axios.post('/api/expenses', payload);
      navigate('/expenses');
    } catch (err) {
      if (err.response?.status === 409 && err.response?.data?.isDuplicateWarning) {
        setShowDuplicateDialog(true);
      } else {
        setError(err.response?.data?.message || 'Failed to save verified expense.');
      }
    } finally {
      setLoading(false);
    }
  };

  const receiptImageUrl = `/uploads/receipts/${receipt?.filename}`;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/upload-receipt')} sx={{ color: '#64748b' }}>
          Back to Upload
        </Button>
        <Typography variant="h5" fontWeight="700">
          OCR Review & Validation
        </Typography>
        <Chip
          label="Human-in-the-loop Verification"
          size="small"
          color="primary"
          variant="outlined"
          sx={{ ml: 'auto' }}
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Quality Advisory Banner (Gap 1: Blurry/Faded receipts) */}
      {qualityAdvisory && (
        <Alert severity="info" icon={<WarningAmberIcon />} sx={{ mb: 3 }}>
          <AlertTitle sx={{ fontWeight: 700 }}>Image Quality Advisory</AlertTitle>
          {qualityAdvisory}
        </Alert>
      )}

      {/* PII Protection Banner (Gap 3: Financial data security) */}
      {piiMasked && (
        <Alert severity="success" icon={<ShieldIcon />} sx={{ mb: 3 }}>
          <AlertTitle sx={{ fontWeight: 700 }}>PII Data Protection Active</AlertTitle>
          Sensitive payment card numbers were detected and automatically masked to protect your financial privacy.
        </Alert>
      )}

      {/* Validation & Duplicate Banners */}
      {duplicate?.isDuplicate && (
        <Alert severity="warning" icon={<WarningAmberIcon />} sx={{ mb: 3 }}>
          <AlertTitle sx={{ fontWeight: 700 }}>Duplicate Expense Warning</AlertTitle>
          {duplicate.reason}
        </Alert>
      )}

      {validation?.issues && validation.issues.length > 0 && (
        <Alert
          severity={validation.status === 'INVALID' ? 'error' : 'warning'}
          icon={validation.status === 'INVALID' ? <ErrorOutlineIcon /> : <WarningAmberIcon />}
          sx={{ mb: 3 }}
        >
          <AlertTitle sx={{ fontWeight: 700 }}>
            {validation.status === 'INVALID' ? 'Validation Errors Detected' : 'Validation Advisory / Discrepancies'}
          </AlertTitle>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {validation.issues.map((issue, idx) => (
              <li key={idx}>
                <Typography variant="body2">{issue}</Typography>
              </li>
            ))}
          </ul>
        </Alert>
      )}

      {validation?.status === 'VALID' && !duplicate?.isDuplicate && (
        <Alert severity="success" icon={<CheckCircleOutlineIcon />} sx={{ mb: 3 }}>
          All automated validation checks passed successfully. Mathematical consistency verified.
        </Alert>
      )}

      {/* Main Split Grid */}
      <Grid container spacing={3}>
        {/* Left Column: Receipt Viewer & OCR Text */}
        <Grid item xs={12} md={5}>
          <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="700">
                  Receipt Image
                </Typography>
                <Chip
                  label={`OCR Confidence: ${Math.round(ocrConfidence)}%`}
                  size="small"
                  color={ocrConfidence > 70 ? 'success' : 'default'}
                />
              </Box>

              <Box sx={{ textAlign: 'center', bgcolor: '#f1f5f9', p: 1, borderRadius: 2, mb: 2 }}>
                <img
                  src={receiptImageUrl}
                  alt="Scanned Receipt"
                  style={{
                    maxWidth: '100%',
                    maxHeight: 450,
                    objectFit: 'contain',
                    borderRadius: 4
                  }}
                />
              </Box>

              {/* Raw OCR Text Accordion */}
              <Accordion sx={{ boxShadow: 'none', border: '1px solid #e2e8f0', borderRadius: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle2" fontWeight="600">
                    View Raw OCR Text (Tesseract.js Output)
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ bgcolor: '#f8fafc' }}>
                  <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.8rem', margin: 0, fontFamily: 'monospace' }}>
                    {rawOcrText || 'No text extracted.'}
                  </pre>
                </AccordionDetails>
              </Accordion>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column: Editable Fields & AI Suggestions */}
        <Grid item xs={12} md={7}>
          <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
            <CardContent>
              {/* AI Prediction Header */}
              <Box
                sx={{
                  p: 2,
                  bgcolor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: 2,
                  mb: 3
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <AutoAwesomeIcon sx={{ color: '#16a34a' }} />
                  <Typography variant="subtitle1" fontWeight="700" color="#166534">
                    AI Predicted Category: {ai?.predictedCategory || 'Other'}
                  </Typography>
                  <Chip
                    label={`${Math.round((ai?.confidence || 0) * 100)}% Confidence`}
                    size="small"
                    sx={{ bgcolor: '#dcfce7', color: '#15803d', fontWeight: 600 }}
                  />
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={Math.round((ai?.confidence || 0) * 100)}
                  sx={{ height: 6, borderRadius: 3, bgcolor: '#bbf7d0', '& .MuiLinearProgress-bar': { bgcolor: '#16a34a' } }}
                />
                <Typography variant="caption" color="#166534" sx={{ mt: 0.5, display: 'block' }}>
                  Classified using Scikit-learn multi-class model on receipt text & merchant patterns.
                </Typography>
              </Box>

              {/* Editable Fields Form */}
              <Typography variant="h6" fontWeight="700" sx={{ mb: 2 }}>
                Verify & Correct Extracted Fields
              </Typography>

              {correctedFields.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="primary" fontWeight="600">
                    Fields modified by you: {correctedFields.join(', ')}
                  </Typography>
                </Box>
              )}

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Vendor / Merchant"
                    fullWidth
                    required
                    value={formData.vendor}
                    onChange={(e) => handleFieldChange('vendor', e.target.value)}
                    helperText={correctedFields.includes('vendor') ? 'Modified from OCR' : 'Extracted by OCR'}
                    color={correctedFields.includes('vendor') ? 'secondary' : 'primary'}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Total Amount"
                    type="number"
                    fullWidth
                    required
                    inputProps={{ step: '0.01' }}
                    value={formData.amount}
                    onChange={(e) => handleFieldChange('amount', e.target.value)}
                    helperText={correctedFields.includes('amount') ? 'Modified from OCR' : 'Extracted by OCR'}
                    color={correctedFields.includes('amount') ? 'secondary' : 'primary'}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Date"
                    type="date"
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                    value={formData.date}
                    onChange={(e) => handleFieldChange('date', e.target.value)}
                    helperText={correctedFields.includes('date') ? 'Modified from OCR' : 'Extracted by OCR'}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Category"
                    select
                    fullWidth
                    required
                    value={formData.category}
                    onChange={(e) => handleFieldChange('category', e.target.value)}
                    helperText={correctedFields.includes('category') ? 'Manually changed' : 'AI Suggested'}
                  >
                    {CATEGORIES.map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Currency"
                    select
                    fullWidth
                    value={formData.currency}
                    onChange={(e) => handleFieldChange('currency', e.target.value)}
                  >
                    {CURRENCIES.map((c) => (
                      <MenuItem key={c} value={c}>
                        {c}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Subtotal"
                    type="number"
                    fullWidth
                    inputProps={{ step: '0.01' }}
                    value={formData.subtotal}
                    onChange={(e) => handleFieldChange('subtotal', e.target.value)}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Tax / GST"
                    type="number"
                    fullWidth
                    inputProps={{ step: '0.01' }}
                    value={formData.tax}
                    onChange={(e) => handleFieldChange('tax', e.target.value)}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Payment Method"
                    select
                    fullWidth
                    value={formData.paymentMethod}
                    onChange={(e) => handleFieldChange('paymentMethod', e.target.value)}
                  >
                    {PAYMENT_METHODS.map((pm) => (
                      <MenuItem key={pm} value={pm}>
                        {pm}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Description"
                    fullWidth
                    value={formData.description}
                    onChange={(e) => handleFieldChange('description', e.target.value)}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              {/* Enterprise Approval Workflow Toggle (Gap 5) */}
              <Box sx={{ mb: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={submitForApproval}
                      onChange={(e) => setSubmitForApproval(e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2" fontWeight="600" color="#0f172a">
                      Submit for Manager Approval (Enterprise Workflow)
                    </Typography>
                  }
                />
                <Typography variant="caption" color="text.secondary" display="block" sx={{ pl: 4 }}>
                  If checked, this expense will enter the organizational approval pipeline with pending status.
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/upload-receipt')}
                  disabled={loading}
                >
                  Discard
                </Button>
                <Button
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                  onClick={() => handleSave(false)}
                  disabled={loading}
                  sx={{
                    backgroundColor: '#0284c7',
                    '&:hover': { backgroundColor: '#0369a1' },
                    px: 4,
                    fontWeight: 600
                  }}
                >
                  {loading ? 'Saving...' : 'Confirm & Save Expense'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Duplicate Override Dialog */}
      <Dialog open={showDuplicateDialog} onClose={() => setShowDuplicateDialog(false)}>
        <DialogTitle sx={{ fontWeight: 700, color: '#d97706' }}>
          Duplicate Expense Warning
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {duplicate?.reason || 'A similar expense or identical receipt already exists in your account.'}
          </DialogContentText>
          <DialogContentText sx={{ mt: 2, fontWeight: 500 }}>
            Do you wish to bypass this warning and save the expense anyway?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setShowDuplicateDialog(false)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={() => {
              setShowDuplicateDialog(false);
              handleSave(true);
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

export default OCRReview;
