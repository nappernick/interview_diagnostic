// src/theme/index.ts
import { extendTheme } from '@chakra-ui/react'

export const theme = extendTheme({
  styles: {
    global: {
      body: {
        bg: 'gray.50',
      }
    }
  },
  colors: {
    yelp: {
      red: '#FF1A1A',
      darkRed: '#AF0606',
      gray: '#666666',
    }
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'red',
      },
      variants: {
        solid: {
          bg: 'yelp.red',
          _hover: { bg: 'yelp.darkRed' }
        }
      }
    }
  }
})