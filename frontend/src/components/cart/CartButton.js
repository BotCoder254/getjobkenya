import React from 'react';
import {
  IconButton,
  Button,
  Badge,
  Tooltip,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiShoppingCart } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const CartButton = ({ variant = 'icon', size = 'md' }) => {
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/cart');
  };

  if (variant === 'icon') {
    return (
      <Tooltip label="View Cart" placement="bottom">
        <IconButton
          icon={
            <>
              <FiShoppingCart />
              {itemCount > 0 && (
                <Badge
                  colorScheme="brand"
                  position="absolute"
                  top={0}
                  right={0}
                  transform="translate(25%, -25%)"
                  borderRadius="full"
                  fontSize="xs"
                >
                  {itemCount}
                </Badge>
              )}
            </>
          }
          aria-label="Shopping cart"
          variant="ghost"
          size={size}
          onClick={handleClick}
          position="relative"
        />
      </Tooltip>
    );
  }

  return (
    <Button
      leftIcon={<FiShoppingCart />}
      onClick={handleClick}
      size={size}
      variant={variant}
      position="relative"
    >
      Cart
      {itemCount > 0 && (
        <Badge
          colorScheme="brand"
          position="absolute"
          top={0}
          right={0}
          transform="translate(50%, -50%)"
          borderRadius="full"
          fontSize="xs"
        >
          {itemCount}
        </Badge>
      )}
    </Button>
  );
};

export default CartButton; 