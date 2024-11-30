import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Icon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Badge,
  Progress,
  useToast,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import {
  FaFile,
  FaDownload,
  FaTrash,
  FaEye,
  FaEdit,
  FaHistory,
  FaShare,
} from 'react-icons/fa';
import { useDocumentManagement } from '../hooks/useDocumentManagement';

const DocumentViewer = ({ userId, documentType, allowedTypes, maxSize }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedDoc, setSelectedDoc] = useState(null);
  const {
    documents,
    uploading,
    progress,
    uploadDocument,
    deleteDocument,
    updateDocumentMetadata,
    validateDocument,
  } = useDocumentManagement(userId);
  const toast = useToast();

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!validateDocument(file, allowedTypes, maxSize)) return;

    try {
      const metadata = {
        type: documentType,
        uploadedBy: userId,
        originalName: file.name,
        size: file.size,
        uploadedAt: new Date().toISOString(),
      };

      await uploadDocument(file, documentType, metadata);
      toast({
        title: 'Document Uploaded',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Upload Failed',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleDelete = async (doc) => {
    try {
      await deleteDocument(doc.path, doc);
      toast({
        title: 'Document Deleted',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Delete Failed',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleView = (doc) => {
    setSelectedDoc(doc);
    onOpen();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType) => {
    // Add more file type icons as needed
    switch (fileType) {
      case 'application/pdf':
        return 'FaFilePdf';
      case 'image/jpeg':
      case 'image/png':
        return 'FaFileImage';
      default:
        return 'FaFile';
    }
  };

  return (
    <Box>
      <VStack spacing={4} align="stretch">
        <HStack justify="space-between">
          <Text fontWeight="bold">Documents</Text>
          <Button
            as="label"
            htmlFor="file-upload"
            cursor="pointer"
            colorScheme="blue"
            size="sm"
          >
            Upload New
            <input
              id="file-upload"
              type="file"
              accept={allowedTypes?.join(',')}
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </Button>
        </HStack>

        {uploading && (
          <Progress
            value={progress}
            size="sm"
            colorScheme="blue"
            hasStripe
            isAnimated
          />
        )}

        {documents.map((doc) => (
          <Box
            key={doc.path}
            p={4}
            borderWidth={1}
            borderRadius="md"
            _hover={{ bg: 'gray.50' }}
          >
            <HStack justify="space-between">
              <HStack>
                <Icon as={getFileIcon(doc.fileType)} boxSize={6} />
                <VStack align="start" spacing={0}>
                  <Text fontWeight="medium">{doc.name}</Text>
                  <Text fontSize="sm" color="gray.500">
                    {formatFileSize(doc.size)}
                  </Text>
                </VStack>
              </HStack>

              <HStack>
                <Tooltip label="View">
                  <IconButton
                    icon={<FaEye />}
                    size="sm"
                    variant="ghost"
                    onClick={() => handleView(doc)}
                  />
                </Tooltip>
                <Tooltip label="Download">
                  <IconButton
                    icon={<FaDownload />}
                    size="sm"
                    variant="ghost"
                    onClick={() => window.open(doc.url)}
                  />
                </Tooltip>
                <Tooltip label="Delete">
                  <IconButton
                    icon={<FaTrash />}
                    size="sm"
                    variant="ghost"
                    colorScheme="red"
                    onClick={() => handleDelete(doc)}
                  />
                </Tooltip>
              </HStack>
            </HStack>
          </Box>
        ))}

        {documents.length === 0 && (
          <Text color="gray.500" textAlign="center" py={4}>
            No documents uploaded yet
          </Text>
        )}
      </VStack>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{selectedDoc?.name}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <iframe
                src={selectedDoc?.url}
                style={{ width: '100%', height: '500px', border: 'none' }}
                title={selectedDoc?.name}
              />
              <HStack justify="space-between">
                <Text fontSize="sm" color="gray.500">
                  Uploaded: {new Date(selectedDoc?.uploadedAt).toLocaleString()}
                </Text>
                <Button
                  leftIcon={<FaDownload />}
                  onClick={() => window.open(selectedDoc?.url)}
                >
                  Download
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default DocumentViewer; 