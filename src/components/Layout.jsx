import React, { useState } from 'react';
import { Box, Container } from '@mui/material';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
      <Navbar onToggleSidebar={handleDrawerToggle} />
      <Box sx={{ display: 'flex', flexGrow: 1 }}>
        {isAuthenticated && (
          <Sidebar
            open={mobileOpen}
            onClose={handleDrawerToggle}
            variant="temporary"
          />
        )}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, sm: 3 },
            backgroundColor: '#f8fafc',
            minHeight: 'calc(100vh - 64px)'
          }}
        >
          <Container maxWidth="xl">{children}</Container>
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
