import React, { useState } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepIndicator,
  StepStatus,
  StepIcon,
  StepNumber,
  StepTitle,
  StepDescription,
  StepSeparator,
  useSteps,
  VStack,
  Button,
  useToast,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { orderService } from '../../services/orderService';
import ShippingForm from './ShippingForm';
import PaymentForm from './PaymentForm';
import OrderSummary from './OrderSummary';

const steps = [
  { title: 'Shipping', description: 'Delivery address' },
  { title: 'Payment', description: 'Payment method' },
  { title: 'Review', description: 'Order summary' },
];

const Checkout = () => {
  const { activeStep, setActiveStep } = useSteps({ index: 0, count: steps.length });
  const [shippingData, setShippingData] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const { items, loading, error, clearCart, getTotal } = useCart();
  const navigate = useNavigate();
  const toast = useToast();

  if (loading) {
    return <Box p={5}>Loading...</Box>;
  }

  if (error) {
    return <Box p={5} color="red.500">Error: {error}</Box>;
  }

  if (!items.length) {
    navigate('/cart');
    return null;
  }

  const handleShippingSubmit = async (data) => {
    try {
      await orderService.validateShipping(data);
      setShippingData(data);
      setActiveStep(1);
    } catch (err) {
      toast({
        title: 'Validation Error',
        description: err.message,
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handlePaymentSubmit = async (data) => {
    try {
      await orderService.processPayment(data);
      setPaymentData(data);
      setActiveStep(2);
    } catch (err) {
      toast({
        title: 'Payment Error',
        description: err.message,
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handlePlaceOrder = async () => {
    try {
      const orderData = {
        items,
        shipping: shippingData,
        payment: paymentData,
        total: getTotal(),
      };

      const order = await orderService.createOrder(orderData);
      await clearCart();
      
      toast({
        title: 'Order Placed',
        description: 'Your order has been successfully placed',
        status: 'success',
        duration: 3000,
      });

      navigate(`/orders/${order._id}`);
    } catch (err) {
      toast({
        title: 'Order Error',
        description: err.message,
        status: 'error',
        duration: 3000,
      });
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return <ShippingForm onSubmit={handleShippingSubmit} initialData={shippingData} />;
      case 1:
        return <PaymentForm onSubmit={handlePaymentSubmit} initialData={paymentData} />;
      case 2:
        return (
          <OrderSummary
            items={items}
            shipping={shippingData}
            payment={paymentData}
            total={getTotal()}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box p={5}>
      <VStack spacing={8}>
        <Stepper index={activeStep} width="100%">
          {steps.map((step, index) => (
            <Step key={index}>
              <StepIndicator>
                <StepStatus
                  complete={<StepIcon />}
                  incomplete={<StepNumber />}
                  active={<StepNumber />}
                />
              </StepIndicator>
              <Box flexShrink="0">
                <StepTitle>{step.title}</StepTitle>
                <StepDescription>{step.description}</StepDescription>
              </Box>
              <StepSeparator />
            </Step>
          ))}
        </Stepper>

        {renderStepContent()}

        <Box width="100%" pt={4}>
          {activeStep > 0 && (
            <Button
              mr={4}
              onClick={() => setActiveStep(activeStep - 1)}
            >
              Previous
            </Button>
          )}
          {activeStep === 2 ? (
            <Button
              colorScheme="blue"
              onClick={handlePlaceOrder}
            >
              Place Order
            </Button>
          ) : null}
        </Box>
      </VStack>
    </Box>
  );
};

export default Checkout; 