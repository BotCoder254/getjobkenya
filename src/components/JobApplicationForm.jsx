import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  VStack,
  FormControl,
  FormLabel,
  Textarea,
  Input,
  Progress,
  Text,
  useToast,
  Box,
  Divider,
  HStack,
  Icon,
  Badge,
} from '@chakra-ui/react';
import { FaUpload, FaFile, FaCheck } from 'react-icons/fa';
import { useJobApplicationProcess } from '../hooks/useJobApplicationProcess';
import { useAuth } from '../contexts/AuthContext';
import { useDocumentManagement } from '../hooks/useDocumentManagement';

const JobApplicationForm = ({ isOpen, onClose, job }) => {
  const { user } = useAuth();
  const toast = useToast();
  const { submitApplication, submitting } = useJobApplicationProcess(job?.id, user?.uid);
  const { uploadDocument, validateDocument } = useDocumentManagement(user?.uid);

  const [formData, setFormData] = useState({
    coverLetter: '',
    answers: job?.screeningQuestions?.map(q => ({ question: q, response: '' })) || [],
    documents: {},
    additionalInfo: '',
  });

  const [uploadedFiles, setUploadedFiles] = useState({});
  const [uploadProgress, setUploadProgress] = useState({});

  const handleFileUpload = async (event, documentType) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!validateDocument(file, allowedTypes, maxSize)) return;

    try {
      setUploadProgress(prev => ({ ...prev, [documentType]: 0 }));
      
      const downloadURL = await uploadDocument(file, documentType, {
        jobId: job.id,
        documentType,
        uploadedAt: new Date().toISOString(),
      });

      if (downloadURL) {
        setUploadedFiles(prev => ({
          ...prev,
          [documentType]: { name: file.name, url: downloadURL }
        }));
        setFormData(prev => ({
          ...prev,
          documents: {
            ...prev.documents,
            [documentType]: downloadURL
          }
        }));
      }
    } catch (error) {
      toast({
        title: 'Upload Failed',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    } finally {
      setUploadProgress(prev => ({ ...prev, [documentType]: 100 }));
    }
  };

  const handleSubmit = async () => {
    // Validate required documents
    const missingDocs = job.requiredDocuments.filter(
      doc => !formData.documents[doc]
    );

    if (missingDocs.length > 0) {
      toast({
        title: 'Missing Documents',
        description: `Please upload: ${missingDocs.join(', ')}`,
        status: 'error',
        duration: 5000,
      });
      return;
    }

    // Validate screening questions
    const unansweredQuestions = formData.answers.filter(a => !a.response);
    if (unansweredQuestions.length > 0) {
      toast({
        title: 'Incomplete Application',
        description: 'Please answer all screening questions',
        status: 'error',
        duration: 5000,
      });
      return;
    }

    try {
      await submitApplication({
        ...formData,
        jobId: job.id,
        jobTitle: job.title,
        companyId: job.companyId,
        companyName: job.companyName,
        appliedAt: new Date(),
      });

      toast({
        title: 'Application Submitted',
        description: 'Your application has been successfully submitted.',
        status: 'success',
        duration: 5000,
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Apply for {job?.title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={6}>
            <FormControl isRequired>
              <FormLabel>Cover Letter</FormLabel>
              <Textarea
                value={formData.coverLetter}
                onChange={(e) => setFormData({
                  ...formData,
                  coverLetter: e.target.value
                })}
                placeholder="Tell us why you're a great fit for this role..."
                rows={6}
              />
            </FormControl>

            {job?.screeningQuestions?.length > 0 && (
              <Box width="100%">
                <Text fontWeight="bold" mb={4}>Screening Questions</Text>
                <VStack spacing={4} align="stretch">
                  {formData.answers.map((answer, index) => (
                    <FormControl key={index} isRequired>
                      <FormLabel>{answer.question}</FormLabel>
                      <Textarea
                        value={answer.response}
                        onChange={(e) => {
                          const newAnswers = [...formData.answers];
                          newAnswers[index].response = e.target.value;
                          setFormData({ ...formData, answers: newAnswers });
                        }}
                        placeholder="Your answer..."
                        rows={3}
                      />
                    </FormControl>
                  ))}
                </VStack>
              </Box>
            )}

            <Box width="100%">
              <Text fontWeight="bold" mb={4}>Required Documents</Text>
              <VStack spacing={4} align="stretch">
                {job?.requiredDocuments?.map((docType) => (
                  <FormControl key={docType} isRequired>
                    <FormLabel>{docType}</FormLabel>
                    <HStack>
                      <Input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => handleFileUpload(e, docType)}
                        display="none"
                        id={`file-${docType}`}
                      />
                      <Button
                        as="label"
                        htmlFor={`file-${docType}`}
                        leftIcon={<Icon as={FaUpload} />}
                        isLoading={uploadProgress[docType] > 0 && uploadProgress[docType] < 100}
                      >
                        Upload {docType}
                      </Button>
                      {uploadedFiles[docType] && (
                        <HStack>
                          <Icon as={FaFile} />
                          <Text>{uploadedFiles[docType].name}</Text>
                          <Icon as={FaCheck} color="green.500" />
                        </HStack>
                      )}
                    </HStack>
                    {uploadProgress[docType] > 0 && (
                      <Progress value={uploadProgress[docType]} size="sm" mt={2} />
                    )}
                  </FormControl>
                ))}
              </VStack>
            </Box>

            <FormControl>
              <FormLabel>Additional Information</FormLabel>
              <Textarea
                value={formData.additionalInfo}
                onChange={(e) => setFormData({
                  ...formData,
                  additionalInfo: e.target.value
                })}
                placeholder="Any additional information you'd like to share..."
                rows={4}
              />
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleSubmit}
            isLoading={submitting}
          >
            Submit Application
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default JobApplicationForm; 