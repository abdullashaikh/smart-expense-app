import React, { useState, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  CircularProgress,
  LinearProgress,
  Stack,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DocumentScannerIcon from '@mui/icons-material/DocumentScanner';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const steps = [
  'Upload Receipt',
  'Image Pre-processing',
  'Tesseract OCR Extraction',
  'AI Categorization',
  'Validation & Error Checks'
];

const UploadReceipt = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(selectedFile.type)) {
      setError('Invalid file type. Please upload a JPG, PNG, or WEBP image.');
      return;
    }

    // Validate size (5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size exceeds 5MB limit. Please upload a smaller image.');
      return;
    }

    setError('');
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  };

  const handleRemove = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleProcess = async () => {
    if (!file) {
      setError('Please select a receipt image to upload.');
      return;
    }

    setLoading(true);
    setError('');
    setActiveStep(1);
    setStatusMessage('Uploading and pre-processing image with Sharp (denoise, deskew, contrast normalization)...');

    // Simulate progress updates across pipeline phases
    const timer1 = setTimeout(() => {
      setActiveStep(2);
      setStatusMessage('Extracting text and tabular data using Tesseract.js OCR engine...');
    }, 1200);

    const timer2 = setTimeout(() => {
      setActiveStep(3);
      setStatusMessage('Classifying expense category with Scikit-learn AI model...');
    }, 2800);

    const timer3 = setTimeout(() => {
      setActiveStep(4);
      setStatusMessage('Validating mathematical consistency and checking for duplicates...');
    }, 4200);

    try {
      const formData = new FormData();
      formData.append('receipt', file);

      const res = await axios.post('/api/ocr/process-receipt', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      setActiveStep(5);

      // Navigate to OCR review screen with the extracted data
      navigate('/ocr-review', { state: { ocrData: res.data.data } });
    } catch (err) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      setActiveStep(0);
      setError(
        err.response?.data?.message ||
        'Failed to process receipt image. Please ensure the image is clear and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 850, mx: 'auto' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="700" color="#0f172a">
          Receipt OCR & AI Categorization
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Upload an image of your bill or receipt. The system will preprocess the image, extract text using Tesseract.js, categorize it using Scikit-learn, and check for mathematical errors.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Stepper showing research pipeline */}
      {loading && (
        <Card sx={{ mb: 3, p: 2, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}>
          <Typography variant="subtitle2" fontWeight="700" sx={{ mb: 2, color: '#0284c7' }}>
            Pipeline Status: {statusMessage}
          </Typography>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          <Box sx={{ width: '100%', mt: 3 }}>
            <LinearProgress sx={{ borderRadius: 2, height: 6 }} />
          </Box>
        </Card>
      )}

      <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <CardContent sx={{ p: 4 }}>
          {!preview ? (
            <Box
              sx={{
                border: '2px dashed #cbd5e1',
                borderRadius: 3,
                p: 5,
                textAlign: 'center',
                bgcolor: '#f8fafc',
                cursor: 'pointer',
                transition: 'border .24s ease-in-out',
                '&:hover': {
                  borderColor: '#0284c7',
                  bgcolor: '#f0f9ff'
                }
              }}
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/webp"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <CloudUploadIcon sx={{ fontSize: 56, color: '#0284c7', mb: 1 }} />
              <Typography variant="h6" fontWeight="600" color="#1e293b">
                Click or Drag & Drop receipt image here
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Supports JPG, PNG, WEBP (Max 5MB)
              </Typography>
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 2 }}>
                Selected Receipt Preview
              </Typography>
              <Box
                component="img"
                src={preview}
                alt="Receipt preview"
                sx={{
                  maxHeight: 400,
                  maxWidth: '100%',
                  borderRadius: 2,
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  border: '1px solid #e2e8f0',
                  mb: 3
                }}
              />
              <Stack direction="row" spacing={2} justifyContent="center">
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteOutlineIcon />}
                  onClick={handleRemove}
                  disabled={loading}
                >
                  Remove & Choose Another
                </Button>
                <Button
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <DocumentScannerIcon />}
                  onClick={handleProcess}
                  disabled={loading}
                  sx={{
                    backgroundColor: '#0284c7',
                    '&:hover': { backgroundColor: '#0369a1' },
                    px: 4,
                    fontWeight: 600
                  }}
                >
                  {loading ? 'Processing Receipt...' : 'Run OCR & AI Pipeline'}
                </Button>
              </Stack>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default UploadReceipt;
