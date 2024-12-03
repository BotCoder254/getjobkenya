import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  useToast,
  Card,
  CardHeader,
  CardBody,
  SimpleGrid,
  Switch,
  Select,
  Textarea,
  Divider,
  Text,
  HStack,
  Icon,
  useColorModeValue,
  Badge,
} from '@chakra-ui/react';
import {
  FiSettings,
  FiMail,
  FiDollarSign,
  FiTruck,
  FiGlobe,
  FiLock,
} from 'react-icons/fi';

const Settings = () => {
  const [settings, setSettings] = useState({
    siteName: '',
    siteDescription: '',
    contactEmail: '',
    supportEmail: '',
    currency: 'USD',
    currencySymbol: '$',
    timezone: 'UTC',
    orderPrefix: 'ORD-',
    enableRegistration: true,
    enableGuestCheckout: true,
    enableReviews: true,
    enableWishlist: true,
    minOrderAmount: 0,
    maxOrderAmount: 10000,
    shippingMethods: ['Standard', 'Express', 'Next Day'],
    paymentMethods: ['Credit Card', 'PayPal', 'Bank Transfer'],
    maintenanceMode: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      toast({
        title: 'Error fetching settings',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) throw new Error('Failed to update settings');

      toast({
        title: 'Settings updated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error updating settings',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between">
          <Heading size="lg">System Settings</Heading>
          {settings.maintenanceMode && (
            <Badge colorScheme="orange" p={2} borderRadius="md">
              Maintenance Mode Active
            </Badge>
          )}
        </HStack>

        <form onSubmit={handleSubmit}>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            {/* General Settings */}
            <Card bg={bgColor} borderColor={borderColor}>
              <CardHeader>
                <HStack>
                  <Icon as={FiSettings} />
                  <Heading size="md">General Settings</Heading>
                </HStack>
              </CardHeader>
              <CardBody>
                <VStack spacing={4}>
                  <FormControl>
                    <FormLabel>Site Name</FormLabel>
                    <Input
                      value={settings.siteName}
                      onChange={(e) => handleChange('siteName', e.target.value)}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Site Description</FormLabel>
                    <Textarea
                      value={settings.siteDescription}
                      onChange={(e) =>
                        handleChange('siteDescription', e.target.value)
                      }
                    />
                  </FormControl>
                  <FormControl display="flex" alignItems="center">
                    <FormLabel mb="0">Maintenance Mode</FormLabel>
                    <Switch
                      isChecked={settings.maintenanceMode}
                      onChange={(e) =>
                        handleChange('maintenanceMode', e.target.checked)
                      }
                    />
                  </FormControl>
                </VStack>
              </CardBody>
            </Card>

            {/* Contact Settings */}
            <Card bg={bgColor} borderColor={borderColor}>
              <CardHeader>
                <HStack>
                  <Icon as={FiMail} />
                  <Heading size="md">Contact Information</Heading>
                </HStack>
              </CardHeader>
              <CardBody>
                <VStack spacing={4}>
                  <FormControl>
                    <FormLabel>Contact Email</FormLabel>
                    <Input
                      type="email"
                      value={settings.contactEmail}
                      onChange={(e) => handleChange('contactEmail', e.target.value)}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Support Email</FormLabel>
                    <Input
                      type="email"
                      value={settings.supportEmail}
                      onChange={(e) => handleChange('supportEmail', e.target.value)}
                    />
                  </FormControl>
                </VStack>
              </CardBody>
            </Card>

            {/* Order Settings */}
            <Card bg={bgColor} borderColor={borderColor}>
              <CardHeader>
                <HStack>
                  <Icon as={FiDollarSign} />
                  <Heading size="md">Order Settings</Heading>
                </HStack>
              </CardHeader>
              <CardBody>
                <VStack spacing={4}>
                  <FormControl>
                    <FormLabel>Order Prefix</FormLabel>
                    <Input
                      value={settings.orderPrefix}
                      onChange={(e) => handleChange('orderPrefix', e.target.value)}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Minimum Order Amount</FormLabel>
                    <Input
                      type="number"
                      value={settings.minOrderAmount}
                      onChange={(e) =>
                        handleChange('minOrderAmount', Number(e.target.value))
                      }
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Maximum Order Amount</FormLabel>
                    <Input
                      type="number"
                      value={settings.maxOrderAmount}
                      onChange={(e) =>
                        handleChange('maxOrderAmount', Number(e.target.value))
                      }
                    />
                  </FormControl>
                </VStack>
              </CardBody>
            </Card>

            {/* Shipping & Payment */}
            <Card bg={bgColor} borderColor={borderColor}>
              <CardHeader>
                <HStack>
                  <Icon as={FiTruck} />
                  <Heading size="md">Shipping & Payment</Heading>
                </HStack>
              </CardHeader>
              <CardBody>
                <VStack spacing={4}>
                  <FormControl>
                    <FormLabel>Shipping Methods</FormLabel>
                    <Select
                      value={settings.shippingMethods}
                      onChange={(e) =>
                        handleChange(
                          'shippingMethods',
                          Array.from(
                            e.target.selectedOptions,
                            (option) => option.value
                          )
                        )
                      }
                      multiple
                    >
                      <option value="Standard">Standard Shipping</option>
                      <option value="Express">Express Shipping</option>
                      <option value="Next Day">Next Day Delivery</option>
                    </Select>
                  </FormControl>
                  <FormControl>
                    <FormLabel>Payment Methods</FormLabel>
                    <Select
                      value={settings.paymentMethods}
                      onChange={(e) =>
                        handleChange(
                          'paymentMethods',
                          Array.from(
                            e.target.selectedOptions,
                            (option) => option.value
                          )
                        )
                      }
                      multiple
                    >
                      <option value="Credit Card">Credit Card</option>
                      <option value="PayPal">PayPal</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                    </Select>
                  </FormControl>
                </VStack>
              </CardBody>
            </Card>

            {/* Feature Toggles */}
            <Card bg={bgColor} borderColor={borderColor}>
              <CardHeader>
                <HStack>
                  <Icon as={FiGlobe} />
                  <Heading size="md">Feature Toggles</Heading>
                </HStack>
              </CardHeader>
              <CardBody>
                <VStack spacing={4}>
                  <FormControl display="flex" alignItems="center">
                    <FormLabel mb="0">Enable Registration</FormLabel>
                    <Switch
                      isChecked={settings.enableRegistration}
                      onChange={(e) =>
                        handleChange('enableRegistration', e.target.checked)
                      }
                    />
                  </FormControl>
                  <FormControl display="flex" alignItems="center">
                    <FormLabel mb="0">Enable Guest Checkout</FormLabel>
                    <Switch
                      isChecked={settings.enableGuestCheckout}
                      onChange={(e) =>
                        handleChange('enableGuestCheckout', e.target.checked)
                      }
                    />
                  </FormControl>
                  <FormControl display="flex" alignItems="center">
                    <FormLabel mb="0">Enable Reviews</FormLabel>
                    <Switch
                      isChecked={settings.enableReviews}
                      onChange={(e) =>
                        handleChange('enableReviews', e.target.checked)
                      }
                    />
                  </FormControl>
                  <FormControl display="flex" alignItems="center">
                    <FormLabel mb="0">Enable Wishlist</FormLabel>
                    <Switch
                      isChecked={settings.enableWishlist}
                      onChange={(e) =>
                        handleChange('enableWishlist', e.target.checked)
                      }
                    />
                  </FormControl>
                </VStack>
              </CardBody>
            </Card>

            {/* Regional Settings */}
            <Card bg={bgColor} borderColor={borderColor}>
              <CardHeader>
                <HStack>
                  <Icon as={FiGlobe} />
                  <Heading size="md">Regional Settings</Heading>
                </HStack>
              </CardHeader>
              <CardBody>
                <VStack spacing={4}>
                  <FormControl>
                    <FormLabel>Currency</FormLabel>
                    <Select
                      value={settings.currency}
                      onChange={(e) => handleChange('currency', e.target.value)}
                    >
                      <option value="USD">US Dollar (USD)</option>
                      <option value="EUR">Euro (EUR)</option>
                      <option value="GBP">British Pound (GBP)</option>
                      <option value="JPY">Japanese Yen (JPY)</option>
                    </Select>
                  </FormControl>
                  <FormControl>
                    <FormLabel>Currency Symbol</FormLabel>
                    <Input
                      value={settings.currencySymbol}
                      onChange={(e) =>
                        handleChange('currencySymbol', e.target.value)
                      }
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Timezone</FormLabel>
                    <Select
                      value={settings.timezone}
                      onChange={(e) => handleChange('timezone', e.target.value)}
                    >
                      <option value="UTC">UTC</option>
                      <option value="EST">Eastern Time (EST)</option>
                      <option value="CST">Central Time (CST)</option>
                      <option value="PST">Pacific Time (PST)</option>
                    </Select>
                  </FormControl>
                </VStack>
              </CardBody>
            </Card>
          </SimpleGrid>

          <Box mt={6}>
            <Button
              type="submit"
              colorScheme="brand"
              size="lg"
              isLoading={isLoading}
              loadingText="Saving..."
            >
              Save Settings
            </Button>
          </Box>
        </form>
      </VStack>
    </Box>
  );
};

export default Settings; 