import React, { createContext, useContext } from 'react';
import {
  useColorMode,
  useColorModeValue,
  theme as defaultTheme,
  extendTheme,
} from '@chakra-ui/react';

const theme = extendTheme({
  colors: {
    brand: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
    },
  },
  fonts: {
    heading: 'Inter, sans-serif',
    body: 'Inter, sans-serif',
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'brand',
      },
      variants: {
        solid: (props) => ({
          bg: props.colorScheme === 'brand' ? 'brand.500' : undefined,
          color: 'white',
          _hover: {
            bg: props.colorScheme === 'brand' ? 'brand.600' : undefined,
            _disabled: {
              bg: props.colorScheme === 'brand' ? 'brand.500' : undefined,
            },
          },
        }),
        outline: (props) => ({
          borderColor: 'brand.500',
          color: 'brand.500',
          _hover: {
            bg: 'brand.50',
          },
        }),
      },
    },
    Card: {
      baseStyle: {
        container: {
          borderRadius: 'lg',
          overflow: 'hidden',
          transition: 'all 0.2s',
          _hover: {
            transform: 'translateY(-2px)',
            boxShadow: 'lg',
          },
        },
      },
    },
    Input: {
      variants: {
        filled: {
          field: {
            bg: 'gray.50',
            _hover: {
              bg: 'gray.100',
            },
            _focus: {
              bg: 'white',
              borderColor: 'brand.500',
            },
          },
        },
      },
      defaultProps: {
        variant: 'filled',
      },
    },
    Select: {
      variants: {
        filled: {
          field: {
            bg: 'gray.50',
            _hover: {
              bg: 'gray.100',
            },
            _focus: {
              bg: 'white',
              borderColor: 'brand.500',
            },
          },
        },
      },
      defaultProps: {
        variant: 'filled',
      },
    },
    Badge: {
      baseStyle: {
        borderRadius: 'full',
        px: 3,
        py: 1,
      },
    },
  },
  styles: {
    global: (props) => ({
      body: {
        bg: props.colorMode === 'dark' ? 'gray.900' : 'white',
        color: props.colorMode === 'dark' ? 'white' : 'gray.800',
      },
    }),
  },
  config: {
    initialColorMode: 'light',
    useSystemColorMode: true,
  },
});

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const { colorMode, toggleColorMode } = useColorMode();

  const value = {
    theme,
    colorMode,
    toggleColorMode,
    isDark: colorMode === 'dark',
    colors: {
      bg: useColorModeValue('white', 'gray.800'),
      text: useColorModeValue('gray.800', 'white'),
      muted: useColorModeValue('gray.600', 'gray.400'),
      border: useColorModeValue('gray.200', 'gray.700'),
      primary: useColorModeValue('brand.600', 'brand.400'),
      secondary: useColorModeValue('brand.500', 'brand.300'),
      accent: useColorModeValue('brand.400', 'brand.200'),
    },
    shadows: {
      sm: useColorModeValue('sm', 'dark-sm'),
      md: useColorModeValue('md', 'dark-md'),
      lg: useColorModeValue('lg', 'dark-lg'),
    },
    transitions: {
      fast: '0.1s',
      normal: '0.2s',
      slow: '0.3s',
    },
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 