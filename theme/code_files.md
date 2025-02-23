# theme Code Files

## /theme/index.ts

```typescript
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
})```


## /theme/theme.ts

```typescript
// theme.ts
import { extendTheme, HStack } from "@chakra-ui/react"

export const theme = extendTheme({
  colors: {
    brand: {
      50: '#ffe5e5',
      100: '#ffb8b8',
      200: '#ff8a8a',
      300: '#ff5c5c',
      400: '#ff2e2e',
      500: '#ff0000', // Yelp-inspired red
      600: '#cc0000',
      700: '#990000',
      800: '#660000',
      900: '#330000',
    }
  },
  components: {
    Button: {
      variants: {
        solid: {
          bg: 'brand.500',
          color: 'white',
          _hover: { bg: 'brand.600' },
          borderRadius: 'xl',
        }
      }
    },
    Card: {
      baseStyle: {
        p: 6,
        borderRadius: 'xl',
        boxShadow: 'lg',
        bg: 'white',
      }
    }
  }
})
```

