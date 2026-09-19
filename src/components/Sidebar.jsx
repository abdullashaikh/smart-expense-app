import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DocumentScannerIcon from '@mui/icons-material/DocumentScanner';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import InsightsIcon from '@mui/icons-material/Insights';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AssessmentIcon from '@mui/icons-material/Assessment';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import CategoryIcon from '@mui/icons-material/Category';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import HistoryIcon from '@mui/icons-material/History';
import SecurityIcon from '@mui/icons-material/Security';
import { useLocation, useNavigate } from 'react-router-dom';

const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Add Expense', icon: <AddCircleOutlineIcon />, path: '/add-expense' },
  { text: 'Upload Receipt (OCR)', icon: <DocumentScannerIcon />, path: '/upload-receipt' },
  { text: 'Expense History', icon: <FormatListBulletedIcon />, path: '/expenses' },
  { text: 'Budgets & Limits', icon: <AccountBalanceWalletIcon />, path: '/budgets' },
  { text: 'Spending Analytics', icon: <InsightsIcon />, path: '/analytics' },
  { text: 'AI Insights', icon: <AutoAwesomeIcon />, path: '/insights' },
  { text: 'Approvals & Governance', icon: <AssignmentTurnedInIcon />, path: '/approvals' },
  { text: 'Audit Trail', icon: <HistoryIcon />, path: '/audit-logs' },
  { text: 'Reports (PDF/Excel)', icon: <AssessmentIcon />, path: '/reports' },
  { text: 'Alerts & Notices', icon: <NotificationsActiveIcon />, path: '/alerts' },
  { text: 'Categories', icon: <CategoryIcon />, path: '/categories' },
  { text: 'Privacy & Security', icon: <SecurityIcon />, path: '/privacy' },
  { text: 'Profile & Settings', icon: <PersonOutlineIcon />, path: '/profile' }
];

const Sidebar = ({ open, onClose, variant = 'permanent' }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
    if (variant === 'temporary') {
      onClose();
    }
  };

  const drawerContent = (
    <Box sx={{ overflow: 'auto', mt: 2 }}>
      <Box sx={{ px: 2, mb: 1.5 }}>
        <Typography variant="overline" sx={{ color: '#64748b', fontWeight: 700, letterSpacing: 1 }}>
          RESEARCH PROJECT
        </Typography>
        <Typography variant="caption" display="block" sx={{ color: '#94a3b8' }}>
          MCA Phase 2 • Advanced AI & Analytics
        </Typography>
      </Box>
      <Divider sx={{ mb: 1 }} />
      <List dense>
        {menuItems.map((item) => {
          const isSelected = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.3 }}>
              <ListItemButton
                selected={isSelected}
                onClick={() => handleNavigation(item.path)}
                sx={{
                  mx: 1,
                  py: 0.8,
                  borderRadius: 1.5,
                  '&.Mui-selected': {
                    backgroundColor: '#e0f2fe',
                    color: '#0369a1',
                    '& .MuiListItemIcon-root': {
                      color: '#0284c7'
                    },
                    fontWeight: 600
                  },
                  '&:hover': {
                    backgroundColor: '#f1f5f9'
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: isSelected ? '#0284c7' : '#64748b' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: '0.85rem',
                    fontWeight: isSelected ? 600 : 500
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <>
      {/* Mobile temporary drawer */}
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth }
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop permanent drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderRight: '1px solid #e2e8f0',
            backgroundColor: '#ffffff'
          }
        }}
        open
      >
        <Box sx={{ height: 64 }} /> {/* Offset for AppBar */}
        {drawerContent}
      </Drawer>
    </>
  );
};

export default Sidebar;
