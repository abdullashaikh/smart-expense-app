import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Button,
  Menu,
  MenuItem,
  Avatar,
  Chip,
  Badge,
  Popover,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import LogoutIcon from '@mui/icons-material/Logout';
import NotificationsIcon from '@mui/icons-material/Notifications';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // User menu state
  const [anchorEl, setAnchorEl] = useState(null);

  // Notification menu state
  const [notifAnchorEl, setNotifAnchorEl] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchAlerts = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await axios.get('/api/alerts');
      setAlerts(res.data.data.slice(0, 5));
      setUnreadCount(res.data.unreadCount || 0);
    } catch (e) {
      // Ignore background notification fetch errors
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000); // Poll alerts every 30s
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleNotifClick = (event) => {
    setNotifAnchorEl(event.currentTarget);
    fetchAlerts();
  };
  const handleNotifClose = () => setNotifAnchorEl(null);

  const handleMarkAllRead = async () => {
    try {
      await axios.put('/api/alerts/read-all');
      setUnreadCount(0);
      setAlerts((prev) => prev.map((a) => ({ ...a, isRead: true })));
    } catch (e) {
      // ignore
    }
  };

  const handleLogout = () => {
    handleClose();
    logout();
    navigate('/login');
  };

  const handleProfile = () => {
    handleClose();
    navigate('/profile');
  };

  return (
    <AppBar
      position="sticky"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: '#1e293b',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}
    >
      <Toolbar>
        {isAuthenticated && (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={onToggleSidebar}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}

        <ReceiptLongIcon sx={{ mr: 1, color: '#38bdf8' }} />
        <Typography
          variant="h6"
          component="div"
          sx={{
            flexGrow: 1,
            fontWeight: 700,
            letterSpacing: 0.5,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
          onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
        >
          Smart Expense
          <Chip
            label="AI & OCR"
            size="small"
            sx={{
              backgroundColor: '#0284c7',
              color: '#fff',
              fontWeight: 600,
              fontSize: '0.7rem'
            }}
          />
        </Typography>

        {isAuthenticated ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Notification Bell */}
            <IconButton
              color="inherit"
              onClick={handleNotifClick}
              size="large"
              aria-label="notifications"
              sx={{ mr: 1 }}
            >
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            {/* Notifications Popover */}
            <Popover
              open={Boolean(notifAnchorEl)}
              anchorEl={notifAnchorEl}
              onClose={handleNotifClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              PaperProps={{ sx: { width: 340, maxHeight: 420, borderRadius: 2, p: 1 } }}
            >
              <Box sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2" fontWeight="700">
                  Notifications ({unreadCount} unread)
                </Typography>
                {unreadCount > 0 && (
                  <Button
                    size="small"
                    startIcon={<DoneAllIcon />}
                    onClick={handleMarkAllRead}
                    sx={{ fontSize: '0.75rem' }}
                  >
                    Mark read
                  </Button>
                )}
              </Box>
              <Divider />
              {alerts.length === 0 ? (
                <Box sx={{ p: 3, textAlign: 'center', color: '#94a3b8' }}>
                  <Typography variant="body2">No recent notifications</Typography>
                </Box>
              ) : (
                <List dense sx={{ p: 0 }}>
                  {alerts.map((alt) => (
                    <ListItem
                      key={alt._id}
                      sx={{
                        bgcolor: alt.isRead ? 'transparent' : '#f0f9ff',
                        borderRadius: 1,
                        mb: 0.5,
                        cursor: 'pointer'
                      }}
                      onClick={() => {
                        handleNotifClose();
                        navigate('/alerts');
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        {alt.severity === 'critical' ? (
                          <ErrorOutlineIcon color="error" fontSize="small" />
                        ) : alt.severity === 'warning' ? (
                          <WarningAmberIcon color="warning" fontSize="small" />
                        ) : (
                          <InfoOutlinedIcon color="primary" fontSize="small" />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={alt.title}
                        secondary={alt.message}
                        primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 600 }}
                        secondaryTypographyProps={{ fontSize: '0.75rem', noWrap: true }}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
              <Divider />
              <Box sx={{ p: 1, textAlign: 'center' }}>
                <Button
                  fullWidth
                  size="small"
                  onClick={() => {
                    handleNotifClose();
                    navigate('/alerts');
                  }}
                  sx={{ fontWeight: 600 }}
                >
                  View All Notifications
                </Button>
              </Box>
            </Popover>

            <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' }, color: '#94a3b8' }}>
              Welcome, <strong style={{ color: '#f8fafc' }}>{user?.name}</strong>
            </Typography>

            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: '#0284c7',
                  fontSize: '0.9rem',
                  fontWeight: 600
                }}
              >
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </Avatar>
            </IconButton>

            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              keepMounted
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleProfile}>
                <AccountCircle sx={{ mr: 1, fontSize: 20 }} /> Profile & Settings
              </MenuItem>
              <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                <LogoutIcon sx={{ mr: 1, fontSize: 20 }} /> Logout
              </MenuItem>
            </Menu>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button color="inherit" onClick={() => navigate('/login')}>
              Login
            </Button>
            <Button
              variant="contained"
              sx={{ backgroundColor: '#0284c7', '&:hover': { backgroundColor: '#0369a1' } }}
              onClick={() => navigate('/register')}
            >
              Register
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
