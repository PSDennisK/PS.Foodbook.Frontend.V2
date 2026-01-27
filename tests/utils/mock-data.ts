import { Culture, FilterType } from '@/types/enums';
import type { Filter, SearchProduct, SearchResults } from '@/types/filter';
import type { Product, ProductSummary } from '@/types/product';

export const mockProductSummary: ProductSummary = {
  id: '123',
  name: {
    value: 'Test Product',
    translation: [
      { value: 'Test Product', culture: Culture.EN },
      { value: 'Test Produkt', culture: Culture.DE },
      { value: 'Test Product', culture: Culture.NL },
      { value: 'Produit de Test', culture: Culture.FR },
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
    logisticinfolist: undefined,
  },
};

export const mockSearchProduct: SearchProduct = {
  id: 123,
  name: 'Test Product',
  brand: 'Test Brand',
  gtin: '1234567890123',
  image: 'https://example.com/image.jpg',
  artikelnummer: 'ART-123',
};

export const mockFilters: Filter[] = [
  {
    key: 'brand',
    label: 'Merk',
    type: FilterType.CHECKBOX,
    options: [
      { id: 'brand1', label: 'Test Brand', count: 10 },
      { id: 'brand2', label: 'Another Brand', count: 5 },
    ],
  },
  {
    key: 'category',
    label: 'Categorie',
    type: FilterType.SELECT,
    options: [
      { id: 'cat1', label: 'Category 1', count: 15 },
      { id: 'cat2', label: 'Category 2', count: 8 },
    ],
  },
  {
    key: 'price',
    label: 'Prijs',
    type: FilterType.RANGE,
    min: 0,
    max: 100,
  },
];

export const mockSearchResults: SearchResults = {
  products: [
    mockSearchProduct,
    {
      ...mockSearchProduct,
      id: 124,
      name: 'Test Product 2',
    },
    {
      ...mockSearchProduct,
      id: 125,
      name: 'Test Product 3',
    },
  ],
  pagination: {
    page: 0,
    pageSize: 20,
    total: 3,
    totalPages: 1,
  },
  filters: mockFilters,
};
