import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Divider,
  Stack
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import LockIcon from '@mui/icons-material/Lock';
import CategoryIcon from '@mui/icons-material/Category';
import axios from 'axios';

const COLOR_PALETTE = [
  '#0284c7', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#06b6d4', '#84cc16', '#64748b', '#d97706'
];

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Dialog State
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#0284c7');
  const [dialogError, setDialogError] = useState('');
  const [dialogLoading, setDialogLoading] = useState(false);

  // Delete State
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/api/categories');
      setCategories(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setName('');
    setColor('#0284c7');
    setDialogError('');
    setOpenDialog(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setName(cat.name);
    setColor(cat.color || '#0284c7');
    setDialogError('');
    setOpenDialog(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    setDialogError('');

    if (!name.trim()) {
      setDialogError('Please enter a category name');
      return;
    }

    setDialogLoading(true);
    try {
      if (editingCategory) {
        await axios.put(`/api/categories/${editingCategory._id}`, { name: name.trim(), color });
      } else {
        await axios.post('/api/categories', { name: name.trim(), color });
      }
      setOpenDialog(false);
      fetchCategories();
    } catch (err) {
      setDialogError(err.response?.data?.message || 'Failed to save category');
    } finally {
      setDialogLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await axios.delete(`/api/categories/${deleteId}`);
      setDeleteId(null);
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete category');
    } finally {
      setDeleting(false);
    }
  };

  const systemCategories = categories.filter((c) => c.isSystem);
  const customCategories = categories.filter((c) => !c.isSystem);

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      {/* Header */}
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CategoryIcon sx={{ color: '#0284c7', fontSize: 32 }} />
            <Typography variant="h4" fontWeight="700" color="#0f172a">
              Category Management
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary">
            System categories are protected. You can create, edit, or remove custom categories.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddCircleOutlineIcon />}
          onClick={handleOpenCreate}
          sx={{ backgroundColor: '#0284c7', fontWeight: 600 }}
        >
          Add Custom Category
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Section 1: Protected System Categories */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" fontWeight="700" sx={{ mb: 1.5 }}>
              Standard System Categories (10)
            </Typography>
            <Grid container spacing={2}>
              {systemCategories.map((cat) => (
                <Grid item xs={12} sm={6} md={4} key={cat.name}>
                  <Card sx={{ borderRadius: 2.5, border: '1px solid #e2e8f0' }}>
                    <CardContent sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box
                          sx={{
                            width: 14,
                            height: 14,
                            borderRadius: '50%',
                            bgcolor: cat.color || '#0284c7'
                          }}
                        />
                        <Typography variant="subtitle1" fontWeight="600">
                          {cat.name}
                        </Typography>
                      </Box>
                      <Chip
                        icon={<LockIcon sx={{ fontSize: 14 }} />}
                        label="System"
                        size="small"
                        sx={{ bgcolor: '#f1f5f9', fontSize: '0.7rem', fontWeight: 600 }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Section 2: Custom User Categories */}
          <Box>
            <Typography variant="h6" fontWeight="700" sx={{ mb: 1.5 }}>
              Custom User Categories ({customCategories.length})
            </Typography>

            {customCategories.length === 0 ? (
              <Card sx={{ borderRadius: 3, border: '1px dashed #cbd5e1', bgcolor: '#f8fafc', p: 4, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  You have not created any custom categories yet.
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleOpenCreate}
                  sx={{ mt: 1.5, color: '#0284c7', borderColor: '#0284c7', fontWeight: 600 }}
                >
                  Create Your First Custom Category
                </Button>
              </Card>
            ) : (
              <Grid container spacing={2}>
                {customCategories.map((cat) => (
                  <Grid item xs={12} sm={6} md={4} key={cat._id}>
                    <Card sx={{ borderRadius: 2.5, border: '1px solid #e2e8f0' }}>
                      <CardContent sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box
                            sx={{
                              width: 14,
                              height: 14,
                              borderRadius: '50%',
                              bgcolor: cat.color || '#0284c7'
                            }}
                          />
                          <Typography variant="subtitle1" fontWeight="600">
                            {cat.name}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <IconButton size="small" onClick={() => handleOpenEdit(cat)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => setDeleteId(cat._id)}>
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editingCategory ? 'Edit Custom Category' : 'Create Custom Category'}
        </DialogTitle>
        <Box component="form" onSubmit={handleSaveCategory}>
          <DialogContent>
            {dialogError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {dialogError}
              </Alert>
            )}
            <Stack spacing={2.5}>
              <TextField
                label="Category Name"
                fullWidth
                required
                placeholder="e.g. Subscriptions, Pet Care"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                  Select Badge Color:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {COLOR_PALETTE.map((c) => (
                    <Box
                      key={c}
                      onClick={() => setColor(c)}
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        bgcolor: c,
                        cursor: 'pointer',
                        border: color === c ? '3px solid #0f172a' : '2px solid transparent',
                        transition: 'transform 0.1s',
                        '&:hover': { transform: 'scale(1.15)' }
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenDialog(false)} color="inherit">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={dialogLoading}
              sx={{ backgroundColor: '#0284c7' }}
            >
              {dialogLoading ? 'Saving...' : 'Save Category'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={Boolean(deleteId)} onClose={() => setDeleteId(null)}>
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Custom Category</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this custom category? Existing expenses under this category will retain their category name.
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteId(null)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Categories;
