import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import LoadingSpinner, { AssetGridSkeleton } from '../LoadingSpinner'

describe('LoadingSpinner', () => {
  it('renders default loading spinner', () => {
    render(<LoadingSpinner />)
    
    const spinner = screen.getByTestId('loading-spinner')
    expect(spinner).toBeInTheDocument()
    expect(spinner).toHaveClass('animate-spin')
  })

  it('renders with custom size', () => {
    render(<LoadingSpinner size="large" />)
    
    const spinner = screen.getByTestId('loading-spinner')
    expect(spinner).toHaveClass('w-8', 'h-8')
  })

  it('renders with custom text', () => {
    render(<LoadingSpinner text="Loading assets..." />)
    
    expect(screen.getByText('Loading assets...')).toBeInTheDocument()
  })

  it('renders without text when showText is false', () => {
    render(<LoadingSpinner text="Loading..." showText={false} />)
    
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<LoadingSpinner className="custom-class" />)
    
    const container = screen.getByTestId('loading-spinner').parentElement
    expect(container).toHaveClass('custom-class')
  })
})

describe('AssetGridSkeleton', () => {
  it('renders default number of skeleton cards', () => {
    render(<AssetGridSkeleton />)
    
    const skeleton = screen.getByTestId('asset-grid-skeleton')
    expect(skeleton).toBeInTheDocument()
    
    // Default should render 6 skeleton cards
    const skeletonCards = skeleton.querySelectorAll('.animate-pulse')
    expect(skeletonCards).toHaveLength(6)
  })

  it('renders custom number of skeleton cards', () => {
    render(<AssetGridSkeleton count={3} />)
    
    const skeleton = screen.getByTestId('asset-grid-skeleton')
    const skeletonCards = skeleton.querySelectorAll('.animate-pulse')
    expect(skeletonCards).toHaveLength(3)
  })

  it('has proper grid layout', () => {
    render(<AssetGridSkeleton />)
    
    const skeleton = screen.getByTestId('asset-grid-skeleton')
    expect(skeleton).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3', 'gap-6')
  })

  it('renders skeleton cards with proper structure', () => {
    render(<AssetGridSkeleton count={1} />)
    
    const skeletonCard = screen.getByTestId('asset-grid-skeleton').firstChild
    expect(skeletonCard).toHaveClass('animate-pulse')
    
    // Should have skeleton elements for image, title, details, etc.
    const skeletonElements = skeletonCard.querySelectorAll('.bg-gray-300')
    expect(skeletonElements.length).toBeGreaterThan(0)
  })
})