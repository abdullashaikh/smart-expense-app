import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Alert,
  CircularProgress,
  Avatar,
  Divider
} from '@mui/material';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import SaveIcon from '@mui/icons-material/Save';
import { useAuth } from '../context/AuthContext';

const currencies = [
  { value: 'INR', label: 'INR (₹) - Indian Rupee' },
  { value: 'USD', label: 'USD ($) - US Dollar' },
  { value: 'EUR', label: 'EUR (€) - Euro' },
  { value: 'GBP', label: 'GBP (£) - British Pound' }
];

const Profile = () => {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [currency, setCurrency] = useState(user?.currencyPreference || 'INR');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    setLoading(true);

    try {
      const payload = { name, currencyPreference: currency };
      if (newPassword) {
        if (newPassword.length < 6) {
          setError('New password must be at least 6 characters.');
          setLoading(false);
          return;
        }
        payload.password = newPassword;
      }

      await updateProfile(payload);
      setSuccess('Profile updated successfully!');
      setNewPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="700" color="#0f172a">
          User Profile & Preferences
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your account credentials and default currency preferences.
        </Typography>
      </Box>

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Avatar
              sx={{
                width: 64,
                height: 64,
                bgcolor: '#0284c7',
                fontSize: '1.5rem',
                fontWeight: 700
              }}
            >
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="700">
                {user?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.email}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Full Name"
                  fullWidth
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Email Address"
                  fullWidth
                  disabled
                  value={user?.email || ''}
                  helperText="Email cannot be changed"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Preferred Currency"
                  select
                  fullWidth
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  {currencies.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="New Password (optional)"
                  type="password"
                  fullWidth
                  placeholder="Leave blank to keep current"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  startIcon={<SaveIcon />}
                  sx={{
                    backgroundColor: '#0284c7',
                    '&:hover': { backgroundColor: '#0369a1' },
                    px: 3,
                    py: 1,
                    fontWeight: 600
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Profile;
