import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import PhaseProgress from '../PhaseProgress'

describe('PhaseProgress', () => {
  const defaultProps = {
    currentPhase: 'planning',
    phases: [
      { id: 'planning', name: 'Planning', order: 1 },
      { id: 'development', name: 'Development', order: 2 },
      { id: 'testing', name: 'Testing', order: 3 },
      { id: 'deployment', name: 'Deployment', order: 4 },
      { id: 'maintenance', name: 'Maintenance', order: 5 }
    ]
  }

  it('renders all phases', () => {
    render(<PhaseProgress {...defaultProps} />)
    
    expect(screen.getByText('Planning')).toBeInTheDocument()
    expect(screen.getByText('Development')).toBeInTheDocument()
    expect(screen.getByText('Testing')).toBeInTheDocument()
    expect(screen.getByText('Deployment')).toBeInTheDocument()
    expect(screen.getByText('Maintenance')).toBeInTheDocument()
  })

  it('highlights current phase', () => {
    render(<PhaseProgress {...defaultProps} />)
    
    const currentPhase = screen.getByText('Planning').closest('div')
    expect(currentPhase).toHaveClass('bg-blue-500', 'text-white')
  })

  it('shows completed phases', () => {
    render(<PhaseProgress {...defaultProps} currentPhase="testing" />)
    
    const planningPhase = screen.getByText('Planning').closest('div')
    const developmentPhase = screen.getByText('Development').closest('div')
    
    expect(planningPhase).toHaveClass('bg-green-500', 'text-white')
    expect(developmentPhase).toHaveClass('bg-green-500', 'text-white')
  })

  it('shows upcoming phases', () => {
    render(<PhaseProgress {...defaultProps} currentPhase="development" />)
    
    const testingPhase = screen.getByText('Testing').closest('div')
    const deploymentPhase = screen.getByText('Deployment').closest('div')
    
    expect(testingPhase).toHaveClass('bg-gray-200', 'text-gray-600')
    expect(deploymentPhase).toHaveClass('bg-gray-200', 'text-gray-600')
  })

  it('calculates progress percentage correctly', () => {
    render(<PhaseProgress {...defaultProps} currentPhase="testing" />)
    
    // Should show progress for completed phases (planning, development) + current (testing)
    // That's 3 out of 5 phases = 60%
    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toHaveAttribute('aria-valuenow', '60')
  })

  it('displays progress percentage text', () => {
    render(<PhaseProgress {...defaultProps} currentPhase="development" />)
    
    // 2 out of 5 phases = 40%
    expect(screen.getByText('40% Complete')).toBeInTheDocument()
  })

  it('renders phase numbers', () => {
    render(<PhaseProgress {...defaultProps} />)
    
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('4')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('connects phases with lines', () => {
    render(<PhaseProgress {...defaultProps} />)
    
    // Check that connector lines are present
    const connectors = screen.getAllByTestId('phase-connector')
    expect(connectors).toHaveLength(4) // 5 phases = 4 connectors
  })

  it('handles single phase', () => {
    const singlePhaseProps = {
      currentPhase: 'only',
      phases: [{ id: 'only', name: 'Only Phase', order: 1 }]
    }
    
    render(<PhaseProgress {...singlePhaseProps} />)
    
    expect(screen.getByText('Only Phase')).toBeInTheDocument()
    expect(screen.getByText('100% Complete')).toBeInTheDocument()
  })

  it('handles invalid current phase gracefully', () => {
    render(<PhaseProgress {...defaultProps} currentPhase="nonexistent" />)
    
    // Should still render all phases, but none should be marked as current
    expect(screen.getByText('Planning')).toBeInTheDocument()
    expect(screen.getByText('0% Complete')).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(<PhaseProgress {...defaultProps} />)
    
    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toHaveAttribute('aria-label', 'Phase progress')
    expect(progressBar).toHaveAttribute('aria-valuemin', '0')
    expect(progressBar).toHaveAttribute('aria-valuemax', '100')
  })

  it('renders with custom styling', () => {
    render(<PhaseProgress {...defaultProps} className="custom-class" />)
    
    const container = screen.getByLabelText('Phase progress').closest('div')
    expect(container).toHaveClass('custom-class')
  })

  it('shows phase descriptions when provided', () => {
    const propsWithDescriptions = {
      ...defaultProps,
      phases: [
        { id: 'planning', name: 'Planning', description: 'Initial planning phase', order: 1 },
        { id: 'development', name: 'Development', description: 'Development work', order: 2 }
      ]
    }
    
    render(<PhaseProgress {...propsWithDescriptions} />)
    
    expect(screen.getByText('Initial planning phase')).toBeInTheDocument()
    expect(screen.getByText('Development work')).toBeInTheDocument()
  })

  it('handles phases out of order', () => {
    const unorderedProps = {
      currentPhase: 'development',
      phases: [
        { id: 'development', name: 'Development', order: 2 },
        { id: 'planning', name: 'Planning', order: 1 },
        { id: 'testing', name: 'Testing', order: 3 }
      ]
    }
    
    render(<PhaseProgress {...unorderedProps} />)
    
    // Should render in correct order regardless of array order
    const phaseElements = screen.getAllByTestId('phase-item')
    expect(phaseElements[0]).toHaveTextContent('Planning')
    expect(phaseElements[1]).toHaveTextContent('Development')
    expect(phaseElements[2]).toHaveTextContent('Testing')
  })

  it('supports different phase statuses', () => {
    const propsWithStatuses = {
      currentPhase: 'development',
      phases: [
        { id: 'planning', name: 'Planning', order: 1, status: 'completed' },
        { id: 'development', name: 'Development', order: 2, status: 'active' },
        { id: 'testing', name: 'Testing', order: 3, status: 'blocked' }
      ]
    }
    
    render(<PhaseProgress {...propsWithStatuses} />)
    
    const blockedPhase = screen.getByText('Testing').closest('div')
    expect(blockedPhase).toHaveClass('bg-red-200', 'text-red-700')
  })
})