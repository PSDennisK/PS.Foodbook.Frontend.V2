import { ProductCard } from '@/components/product/product-card';
import { Culture } from '@/types/enums';
import { mockSearchProduct } from '@tests/utils/mock-data';
import { render, screen } from '@tests/utils/test-utils';
import { describe, expect, it } from 'vitest';

describe('ProductCard', () => {
  const defaultProps = {
    product: mockSearchProduct,
    locale: Culture.NL,
  };

  it('renders product name', () => {
    render(<ProductCard {...defaultProps} />);
    expect(screen.getByText('Test Product')).toBeInTheDocument();
  });

  it('renders product brand', () => {
    render(<ProductCard {...defaultProps} />);
    expect(screen.getByText('Test Brand')).toBeInTheDocument();
  });

  it('renders product EAN', () => {
    render(<ProductCard {...defaultProps} />);
    expect(screen.getByText(/1234567890123/)).toBeInTheDocument();
  });

  it('renders product image with correct alt text', () => {
    render(<ProductCard {...defaultProps} />);
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('alt', expect.stringContaining('Test Product'));
  });

  it('links to product detail page', () => {
    render(<ProductCard {...defaultProps} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', expect.stringContaining('/product/'));
    expect(link).toHaveAttribute('href', expect.stringContaining('123'));
  });

  it('has descriptive aria-label on link', () => {
    render(<ProductCard {...defaultProps} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('aria-label', expect.stringContaining('Test Product'));
    expect(link).toHaveAttribute('aria-label', expect.stringContaining('Test Brand'));
  });

  it('renders with no image fallback', () => {
    const productWithoutImage = {
      ...mockSearchProduct,
      image: null,
    };
    render(<ProductCard product={productWithoutImage} locale={Culture.NL} />);
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', expect.stringContaining('no-image'));
  });

  it('renders without brand', () => {
    const productWithoutBrand = {
      ...mockSearchProduct,
      brand: undefined,
    };
    render(<ProductCard product={productWithoutBrand} locale={Culture.NL} />);
    expect(screen.queryByText('Test Brand')).not.toBeInTheDocument();
  });

  it('has focus ring class', () => {
    render(<ProductCard {...defaultProps} />);
    const card = screen.getByRole('link').closest('.focus-within\\:ring-2');
    expect(card).toBeInTheDocument();
  });
});
