import { EmptyState } from '@/components/ui/empty-state';
import { render, screen } from '@tests/utils/test-utils';
import { describe, expect, it } from 'vitest';

describe('EmptyState', () => {
  it('renders title and description', () => {
    render(<EmptyState title="No Results" description="Try adjusting your search" />);

    expect(screen.getByText('No Results')).toBeInTheDocument();
    expect(screen.getByText('Try adjusting your search')).toBeInTheDocument();
  });

  it('renders default SearchX icon', () => {
    render(<EmptyState title="No Results" description="Try adjusting your search" />);

    // Check for svg element
    const icon = screen.getByRole('status').querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('renders custom icon', () => {
    const customIcon = <div data-testid="custom-icon">Custom Icon</div>;
    render(
      <EmptyState title="No Results" description="Try adjusting your search" icon={customIcon} />
    );

    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('renders action button', () => {
    const action = <button type="button">Clear Filters</button>;
    render(
      <EmptyState title="No Results" description="Try adjusting your search" action={action} />
    );

    expect(screen.getByRole('button', { name: 'Clear Filters' })).toBeInTheDocument();
  });

  it('has status role for accessibility', () => {
    render(<EmptyState title="No Results" description="Try adjusting your search" />);

    const element = screen.getByRole('status');
    expect(element).toBeInTheDocument();
  });

  it('centers content', () => {
    render(<EmptyState title="No Results" description="Try adjusting your search" />);

    const element = screen.getByRole('status');
    expect(element).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center');
  });
});
