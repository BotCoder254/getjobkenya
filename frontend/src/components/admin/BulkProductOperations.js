import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  LinearProgress,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  CloudUpload,
  CloudDownload,
  Delete,
  Edit,
  Save,
  Cancel,
  CheckCircle,
  Error,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import axios from 'axios';

const BulkProductOperations = () => {
  const [uploadedData, setUploadedData] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [bulkEditData, setBulkEditData] = useState({});
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  const { getRootProps, getInputProps } = useDropzone({
    accept: '.csv',
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      Papa.parse(file, {
        complete: (results) => {
          setUploadedData(results.data.slice(1)); // Remove header row
        },
        header: true,
      });
    },
  });

  const handleExportCSV = async () => {
    try {
      const { data } = await axios.get('/api/products/export');
      const csv = Papa.unparse(data);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'products.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      setError(error.response?.data?.message || 'Error exporting products');
    }
  };

  const handleBulkUpload = async () => {
    try {
      setProgress(0);
      const total = uploadedData.length;
      let processed = 0;

      for (const row of uploadedData) {
        await axios.post('/api/products', row);
        processed++;
        setProgress((processed / total) * 100);
      }

      setSuccess('Products uploaded successfully');
      setUploadedData([]);
      setProgress(0);
    } catch (error) {
      setError(error.response?.data?.message || 'Error uploading products');
    }
  };

  const handleBulkEdit = () => {
    if (selectedProducts.length === 0) {
      setError('Please select products to edit');
      return;
    }
    setOpenDialog(true);
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) {
      setError('Please select products to delete');
      return;
    }

    if (window.confirm('Are you sure you want to delete selected products?')) {
      try {
        await axios.post('/api/products/bulk-delete', {
          productIds: selectedProducts,
        });
        setSuccess('Products deleted successfully');
        setSelectedProducts([]);
      } catch (error) {
        setError(error.response?.data?.message || 'Error deleting products');
      }
    }
  };

  const handleBulkUpdate = async () => {
    try {
      await axios.post('/api/products/bulk-update', {
        productIds: selectedProducts,
        updates: bulkEditData,
      });
      setSuccess('Products updated successfully');
      setOpenDialog(false);
      setBulkEditData({});
      setSelectedProducts([]);
    } catch (error) {
      setError(error.response?.data?.message || 'Error updating products');
    }
  };

  const validateData = () => {
    const errors = {};
    uploadedData.forEach((row, index) => {
      if (!row.name) errors[index] = { ...errors[index], name: 'Name is required' };
      if (!row.price) errors[index] = { ...errors[index], price: 'Price is required' };
      // Add more validation rules as needed
    });
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Bulk Product Operations
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper
            {...getRootProps()}
            sx={{
              p: 3,
              textAlign: 'center',
              cursor: 'pointer',
              border: '2px dashed #ccc',
            }}
          >
            <input {...getInputProps()} />
            <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography>
              Drag and drop a CSV file here, or click to select a file
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <CloudDownload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography gutterBottom>Download Product Template</Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleExportCSV}
            >
              Export CSV
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {uploadedData.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleBulkUpload}
              disabled={progress > 0}
            >
              Upload {uploadedData.length} Products
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => setUploadedData([])}
            >
              Clear
            </Button>
          </Box>

          {progress > 0 && (
            <Box sx={{ mb: 2 }}>
              <LinearProgress variant="determinate" value={progress} />
              <Typography variant="body2" color="textSecondary">
                Uploading... {Math.round(progress)}%
              </Typography>
            </Box>
          )}

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Stock</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {uploadedData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      {row.name}
                      {validationErrors[index]?.name && (
                        <Chip
                          label="Error"
                          color="error"
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </TableCell>
                    <TableCell>{row.price}</TableCell>
                    <TableCell>{row.category}</TableCell>
                    <TableCell>{row.stock}</TableCell>
                    <TableCell>
                      {validationErrors[index] ? (
                        <Error color="error" />
                      ) : (
                        <CheckCircle color="success" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Bulk Edit Products</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Price Adjustment (%)"
                type="number"
                value={bulkEditData.priceAdjustment || ''}
                onChange={(e) =>
                  setBulkEditData({
                    ...bulkEditData,
                    priceAdjustment: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Stock Adjustment"
                type="number"
                value={bulkEditData.stockAdjustment || ''}
                onChange={(e) =>
                  setBulkEditData({
                    ...bulkEditData,
                    stockAdjustment: e.target.value,
                  })
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleBulkUpdate} variant="contained" color="primary">
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BulkProductOperations; 