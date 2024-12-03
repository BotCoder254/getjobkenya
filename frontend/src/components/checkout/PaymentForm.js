import React, { useState } from 'react';
import {
  Box,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  RadioGroup,
  Radio,
  Stack,
  HStack,
  Text,
  useToast,
  FormErrorMessage,
  Divider,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';

const PaymentForm = ({ onSubmit, initialData }) => {
  const [paymentMethod, setPaymentMethod] = useState(initialData?.method || 'card');
  const [isProcessing, setIsProcessing] = useState(false);
  const toast = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: initialData || {},
  });

  const handleFormSubmit = async (data) => {
    setIsProcessing(true);
    try {
      const paymentData = {
        ...data,
        method: paymentMethod,
      };

      await onSubmit(paymentData);
    } catch (err) {
      toast({
        title: 'Payment Error',
        description: err.message,
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const renderPaymentFields = () => {
    switch (paymentMethod) {
      case 'card':
        return (
          <>
            <FormControl isInvalid={errors.cardNumber}>
              <FormLabel>Card Number</FormLabel>
              <Input
                {...register('cardNumber', {
                  required: 'Card number is required',
                  pattern: {
                    value: /^[0-9]{16}$/,
                    message: 'Invalid card number',
                  },
                })}
                placeholder="1234 5678 9012 3456"
                maxLength={16}
              />
              <FormErrorMessage>
                {errors.cardNumber && errors.cardNumber.message}
              </FormErrorMessage>
            </FormControl>

            <HStack spacing={4}>
              <FormControl isInvalid={errors.expiryDate}>
                <FormLabel>Expiry Date</FormLabel>
                <Input
                  {...register('expiryDate', {
                    required: 'Expiry date is required',
                    pattern: {
                      value: /^(0[1-9]|1[0-2])\/([0-9]{2})$/,
                      message: 'Invalid expiry date (MM/YY)',
                    },
                  })}
                  placeholder="MM/YY"
                  maxLength={5}
                />
                <FormErrorMessage>
                  {errors.expiryDate && errors.expiryDate.message}
                </FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={errors.cvv}>
                <FormLabel>CVV</FormLabel>
                <Input
                  {...register('cvv', {
                    required: 'CVV is required',
                    pattern: {
                      value: /^[0-9]{3,4}$/,
                      message: 'Invalid CVV',
                    },
                  })}
                  type="password"
                  maxLength={4}
                  placeholder="123"
                />
                <FormErrorMessage>
                  {errors.cvv && errors.cvv.message}
                </FormErrorMessage>
              </FormControl>
            </HStack>

            <FormControl isInvalid={errors.cardholderName}>
              <FormLabel>Cardholder Name</FormLabel>
              <Input
                {...register('cardholderName', {
                  required: 'Cardholder name is required',
                })}
                placeholder="John Doe"
              />
              <FormErrorMessage>
                {errors.cardholderName && errors.cardholderName.message}
              </FormErrorMessage>
            </FormControl>
          </>
        );

      case 'mpesa':
        return (
          <FormControl isInvalid={errors.phoneNumber}>
            <FormLabel>M-PESA Phone Number</FormLabel>
            <Input
              {...register('phoneNumber', {
                required: 'Phone number is required',
                pattern: {
                  value: /^254[0-9]{9}$/,
                  message: 'Invalid phone number format (254XXXXXXXXX)',
                },
              })}
              placeholder="254XXXXXXXXX"
            />
            <FormErrorMessage>
              {errors.phoneNumber && errors.phoneNumber.message}
            </FormErrorMessage>
          </FormControl>
        );

      case 'bank':
        return (
          <>
            <FormControl isInvalid={errors.accountNumber}>
              <FormLabel>Account Number</FormLabel>
              <Input
                {...register('accountNumber', {
                  required: 'Account number is required',
                })}
                placeholder="Enter your account number"
              />
              <FormErrorMessage>
                {errors.accountNumber && errors.accountNumber.message}
              </FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={errors.bankCode}>
              <FormLabel>Bank Code</FormLabel>
              <Input
                {...register('bankCode', {
                  required: 'Bank code is required',
                })}
                placeholder="Enter bank code"
              />
              <FormErrorMessage>
                {errors.bankCode && errors.bankCode.message}
              </FormErrorMessage>
            </FormControl>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Box p={5} borderWidth={1} borderRadius="lg">
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <VStack spacing={6} align="stretch">
          <Text fontSize="xl" fontWeight="bold">
            Payment Method
          </Text>

          <RadioGroup
            value={paymentMethod}
            onChange={setPaymentMethod}
          >
            <Stack direction="row" spacing={4}>
              <Radio value="card">Credit Card</Radio>
              <Radio value="mpesa">M-PESA</Radio>
              <Radio value="bank">Bank Transfer</Radio>
            </Stack>
          </RadioGroup>

          <Divider />

          {renderPaymentFields()}

          <Button
            type="submit"
            colorScheme="blue"
            size="lg"
            isLoading={isProcessing}
            loadingText="Processing Payment"
          >
            Continue
          </Button>
        </VStack>
      </form>
    </Box>
  );
};

export default PaymentForm; 