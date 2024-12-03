import React, { useState } from 'react';
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  useToast,
  Input,
  FormControl,
  FormLabel,
  Progress,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Heading,
  Divider,
  useColorModeValue,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Icon,
  Tooltip,
} from '@chakra-ui/react';
import {
  FiUpload,
  FiDownload,
  FiFile,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
} from 'react-icons/fi';
import * as XLSX from 'xlsx';

const BulkOperations = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [importing, setImporting] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      parseExcelFile(file);
    }
  };

  const parseExcelFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
        
        // Remove header row and validate data
        const headers = jsonData[0];
        const rows = jsonData.slice(1);
        const validatedData = validateData(headers, rows);
        setPreviewData(validatedData);
      } catch (error) {
        toast({
          title: 'Error parsing file',
          description: error.message,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const validateData = (headers, rows) => {
    const requiredColumns = ['name', 'price', 'category', 'stock'];
    const errors = [];
    const validData = [];

    // Validate headers
    const headerValidation = requiredColumns.every((col) =>
      headers.map((h) => h.toLowerCase()).includes(col)
    );

    if (!headerValidation) {
      errors.push({
        row: 0,
        message: `Missing required columns: ${requiredColumns.join(', ')}`,
      });
    }

    // Validate rows
    rows.forEach((row, index) => {
      const rowData = {};
      let isValid = true;
      const rowErrors = [];

      headers.forEach((header, colIndex) => {
        const value = row[colIndex];
        const headerLower = header.toLowerCase();

        if (requiredColumns.includes(headerLower) && !value) {
          isValid = false;
          rowErrors.push(`Missing ${header}`);
        }

        if (headerLower === 'price' && (isNaN(value) || value <= 0)) {
          isValid = false;
          rowErrors.push('Invalid price');
        }

        if (headerLower === 'stock' && (isNaN(value) || value < 0)) {
          isValid = false;
          rowErrors.push('Invalid stock');
        }

        rowData[headerLower] = value;
      });

      if (!isValid) {
        errors.push({
          row: index + 1,
          message: rowErrors.join(', '),
        });
      }

      rowData.isValid = isValid;
      validData.push(rowData);
    });

    setValidationErrors(errors);
    return validData;
  };

  const handleImport = async () => {
    if (!selectedFile || validationErrors.length > 0) {
      toast({
        title: 'Cannot import',
        description: 'Please fix validation errors before importing',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setImporting(true);
    setUploadProgress(0);

    try {
      const validProducts = previewData.filter((product) => product.isValid);
      const totalProducts = validProducts.length;
      
      for (let i = 0; i < totalProducts; i++) {
        const product = validProducts[i];
        await importProduct(product);
        setUploadProgress(((i + 1) / totalProducts) * 100);
      }

      toast({
        title: 'Import successful',
        description: `Successfully imported ${totalProducts} products`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Reset state
      setSelectedFile(null);
      setPreviewData([]);
      setValidationErrors([]);
    } catch (error) {
      toast({
        title: 'Import failed',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setImporting(false);
      setUploadProgress(0);
    }
  };

  const importProduct = async (product) => {
    const response = await fetch('/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(product),
    });

    if (!response.ok) {
      throw new Error('Failed to import product');
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch('/api/products');
      const products = await response.json();

      const worksheet = XLSX.utils.json_to_sheet(products);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
      XLSX.writeFile(workbook, 'products_export.xlsx');

      toast({
        title: 'Export successful',
        description: 'Products exported to Excel file',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Export failed',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        <HStack spacing={4} justify="space-between">
          <Heading size="lg">Bulk Operations</Heading>
          <Button
            leftIcon={<FiDownload />}
            colorScheme="brand"
            variant="outline"
            onClick={handleExport}
          >
            Export Products
          </Button>
        </HStack>

        <Card bg={bgColor} borderColor={borderColor}>
          <CardHeader>
            <Heading size="md">Import Products</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel>Select Excel File</FormLabel>
                <Input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileSelect}
                  disabled={importing}
                />
              </FormControl>

              {selectedFile && (
                <>
                  <HStack>
                    <Icon as={FiFile} />
                    <Text>{selectedFile.name}</Text>
                    {validationErrors.length === 0 ? (
                      <Badge colorScheme="green">Valid</Badge>
                    ) : (
                      <Badge colorScheme="red">
                        {validationErrors.length} errors
                      </Badge>
                    )}
                  </HStack>

                  {validationErrors.length > 0 && (
                    <Alert status="error">
                      <AlertIcon />
                      <Box>
                        <AlertTitle>Validation Errors</AlertTitle>
                        <AlertDescription>
                          <VStack align="stretch" mt={2}>
                            {validationErrors.map((error, index) => (
                              <Text key={index}>
                                Row {error.row}: {error.message}
                              </Text>
                            ))}
                          </VStack>
                        </AlertDescription>
                      </Box>
                    </Alert>
                  )}

                  {importing && (
                    <Box>
                      <Text mb={2}>Importing products...</Text>
                      <Progress
                        value={uploadProgress}
                        size="sm"
                        colorScheme="brand"
                        hasStripe
                        isAnimated
                      />
                    </Box>
                  )}
                </>
              )}
            </VStack>
          </CardBody>
          <CardFooter>
            <Button
              leftIcon={<FiUpload />}
              colorScheme="brand"
              onClick={handleImport}
              isLoading={importing}
              loadingText="Importing..."
              isDisabled={!selectedFile || validationErrors.length > 0}
            >
              Import Products
            </Button>
          </CardFooter>
        </Card>

        {previewData.length > 0 && (
          <Card bg={bgColor} borderColor={borderColor}>
            <CardHeader>
              <Heading size="md">Preview</Heading>
            </CardHeader>
            <CardBody>
              <Box overflowX="auto">
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Status</Th>
                      <Th>Name</Th>
                      <Th>Category</Th>
                      <Th>Price</Th>
                      <Th>Stock</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {previewData.map((row, index) => (
                      <Tr key={index}>
                        <Td>
                          <Tooltip
                            label={row.isValid ? 'Valid' : 'Invalid'}
                            placement="top"
                          >
                            <span>
                              <Icon
                                as={row.isValid ? FiCheckCircle : FiXCircle}
                                color={row.isValid ? 'green.500' : 'red.500'}
                              />
                            </span>
                          </Tooltip>
                        </Td>
                        <Td>{row.name}</Td>
                        <Td>{row.category}</Td>
                        <Td>${row.price}</Td>
                        <Td>{row.stock}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </CardBody>
          </Card>
        )}
      </VStack>
    </Box>
  );
};

export default BulkOperations; 