import { Culture } from '@/types/enums';
import type { Product, ProductSummary } from '@/types/product';

export const mockProductSummary: ProductSummary = {
  id: '123',
  name: {
    value: 'Test Product',
    translation: [
      { value: 'Test Product', culture: Culture.EN },
      { value: 'Test Produkt', culture: Culture.DE },
    ],
  },
  ean: '1234567890123',
  brandname: 'Test Brand',
  packshot: 'https://example.com/image.jpg',
  publiclyvisible: 'true',
  lastupdatedon: new Date('2024-01-01'),
};

export const mockProduct: Product = {
  product: {
    mongoDbId: 'abc123',
    hasImpactScore: false,
    summary: mockProductSummary,
    productinfolist: {
      productinfo: {
        qualitymarkinfolist: undefined,
        fishingredientinfolist: undefined,
        characteristicinfolist: undefined,
      },
    },
    specificationinfolist: {
      specificationinfo: {
        ingredientset: undefined,
        allergenset: undefined,
        nutrientset: undefined,
      },
    },
  },
};
