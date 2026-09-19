import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Divider,
  Stack
} from '@mui/material';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import CheckIcon from '@mui/icons-material/Check';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import axios from 'axios';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabIndex, setTabIndex] = useState(0); // 0: All, 1: Unread

  const fetchAlerts = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/api/alerts');
      setAlerts(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch alerts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await axios.put(`/api/alerts/${id}/read`);
      setAlerts((prev) =>
        prev.map((a) => (a._id === id ? { ...a, isRead: true } : a))
      );
    } catch (err) {
      // ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await axios.put('/api/alerts/read-all');
      setAlerts((prev) => prev.map((a) => ({ ...a, isRead: true })));
    } catch (err) {
      // ignore
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/alerts/${id}`);
      setAlerts((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      // ignore
    }
  };

  const displayedAlerts =
    tabIndex === 1 ? alerts.filter((a) => !a.isRead) : alerts;

  const unreadCount = alerts.filter((a) => !a.isRead).length;

  return (
    <Box sx={{ maxWidth: 850, mx: 'auto' }}>
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
            Notifications & Alerts
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Automated spending notices, budget threshold warnings, and anomaly advisories.
          </Typography>
        </Box>

        {unreadCount > 0 && (
          <Button
            variant="contained"
            startIcon={<DoneAllIcon />}
            onClick={handleMarkAllRead}
            sx={{ backgroundColor: '#0284c7', fontWeight: 600 }}
          >
            Mark All as Read
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabIndex} onChange={(e, val) => setTabIndex(val)}>
          <Tab label={`All Notices (${alerts.length})`} sx={{ fontWeight: 600 }} />
          <Tab label={`Unread (${unreadCount})`} sx={{ fontWeight: 600 }} />
        </Tabs>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : displayedAlerts.length === 0 ? (
        <Card sx={{ borderRadius: 3, border: '1px dashed #cbd5e1', bgcolor: '#f8fafc', p: 5, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            {tabIndex === 1 ? 'No unread notifications.' : 'No alerts logged yet.'}
          </Typography>
        </Card>
      ) : (
        <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
          <List sx={{ p: 0 }}>
            {displayedAlerts.map((alt, index) => (
              <React.Fragment key={alt._id}>
                {index > 0 && <Divider />}
                <ListItem
                  sx={{
                    p: 2.5,
                    bgcolor: alt.isRead ? 'transparent' : '#f0f9ff',
                    transition: 'background-color 0.2s'
                  }}
                  secondaryAction={
                    <Stack direction="row" spacing={1}>
                      {!alt.isRead && (
                        <IconButton
                          size="small"
                          color="primary"
                          title="Mark as Read"
                          onClick={() => handleMarkRead(alt._id)}
                        >
                          <CheckIcon fontSize="small" />
                        </IconButton>
                      )}
                      <IconButton
                        size="small"
                        color="error"
                        title="Delete Alert"
                        onClick={() => handleDelete(alt._id)}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  }
                >
                  <ListItemIcon sx={{ minWidth: 42 }}>
                    {alt.severity === 'critical' ? (
                      <ErrorOutlineIcon sx={{ color: '#ef4444', fontSize: 26 }} />
                    ) : alt.severity === 'warning' ? (
                      <WarningAmberIcon sx={{ color: '#f59e0b', fontSize: 26 }} />
                    ) : (
                      <InfoOutlinedIcon sx={{ color: '#0284c7', fontSize: 26 }} />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="subtitle1" fontWeight={alt.isRead ? 600 : 700}>
                          {alt.title}
                        </Typography>
                        {!alt.isRead && (
                          <Chip label="NEW" size="small" color="primary" sx={{ height: 18, fontSize: '0.65rem' }} />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="#334155" sx={{ mb: 0.5 }}>
                          {alt.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(alt.createdAt).toLocaleString()}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        </Card>
      )}
    </Box>
  );
};

export default Alerts;
