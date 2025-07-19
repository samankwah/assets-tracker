import { useState, useEffect } from 'react'
import { X, ArrowRight, AlertTriangle, CheckCircle, Calendar, FileText, Upload, User } from 'lucide-react'
import { PhaseBadge, PhaseProgress } from '../phases'
import { PHASES, PHASE_DESCRIPTIONS, createPhaseHistoryEntry } from '../../types/phaseTypes'
import { validatePhaseTransition, getNextPhases, getMissingRequirements } from '../../utils/phaseValidation'
import { usePhaseStore } from '../../stores/phaseStore'
import { useAssetStore } from '../../stores/assetStore'

const PhaseTransitionModal = ({ 
  asset, 
  isOpen, 
  onClose, 
  onTransitionComplete 
}) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedPhase, setSelectedPhase] = useState('')
  const [transitionNotes, setTransitionNotes] = useState('')
  const [scheduledDate, setScheduledDate] = useState('')
  const [forceTransition, setForceTransition] = useState(false)
  const [uploadedDocuments, setUploadedDocuments] = useState([])
  const [validationResult, setValidationResult] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { transitionAssetPhase } = usePhaseStore()
  const { updateAsset } = useAssetStore()

  const availablePhases = asset?.currentPhase ? getNextPhases(asset.currentPhase) : []

  useEffect(() => {
    if (asset && selectedPhase) {
      const validation = validatePhaseTransition(asset, selectedPhase, { force: forceTransition })
      setValidationResult(validation)
    }
  }, [asset, selectedPhase, forceTransition])

  const handlePhaseSelect = (phase) => {
    setSelectedPhase(phase)
    setCurrentStep(2)
  }

  const handleDocumentUpload = (event) => {
    const files = Array.from(event.target.files)
    const newDocuments = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      file: file
    }))
    setUploadedDocuments(prev => [...prev, ...newDocuments])
  }

  const handleRemoveDocument = (docId) => {
    setUploadedDocuments(prev => prev.filter(doc => doc.id !== docId))
  }

  const handleTransition = async () => {
    if (!asset || !selectedPhase) return

    setIsSubmitting(true)
    try {
      // Transition the phase
      await transitionAssetPhase(asset.id, selectedPhase, {
        notes: transitionNotes,
        nextPhaseDate: scheduledDate || null,
        force: forceTransition,
        userId: 'current-user', // This would come from auth context
        documents: uploadedDocuments
      })

      // Update the asset in the asset store
      updateAsset(asset.id, {
        currentPhase: selectedPhase,
        phaseMetadata: {
          ...asset.phaseMetadata,
          currentPhase: selectedPhase,
          phaseStartDate: new Date().toISOString(),
          phaseProgress: 0,
          nextPhaseDate: scheduledDate || null,
          notes: transitionNotes,
          previousPhase: asset.currentPhase
        }
      })

      // Callback to parent component
      if (onTransitionComplete) {
        onTransitionComplete(selectedPhase)
      }

      onClose()
    } catch (error) {
      console.error('Phase transition failed:', error)
      alert('Phase transition failed: ' + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetModal = () => {
    setCurrentStep(1)
    setSelectedPhase('')
    setTransitionNotes('')
    setScheduledDate('')
    setForceTransition(false)
    setUploadedDocuments([])
    setValidationResult(null)
  }

  const handleClose = () => {
    resetModal()
    onClose()
  }

  if (!isOpen || !asset) return null

  const steps = [
    { number: 1, title: 'Select Phase', description: 'Choose the target phase' },
    { number: 2, title: 'Review & Validate', description: 'Review requirements and validation' },
    { number: 3, title: 'Add Details', description: 'Add notes and schedule' },
    { number: 4, title: 'Confirm', description: 'Confirm the transition' }
  ]

  const StepIndicator = ({ step, isActive, isCompleted }) => (
    <div className={`flex items-center ${isCompleted ? 'text-green-600' : isActive ? 'text-blue-600' : 'text-gray-400'}`}>
      <div className={`
        w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
        ${isCompleted 
          ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300' 
          : isActive 
            ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' 
            : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
        }
      `}>
        {isCompleted ? <CheckCircle className="w-4 h-4" /> : step.number}
      </div>
      <div className="ml-3">
        <p className="text-sm font-medium">{step.title}</p>
        <p className="text-xs">{step.description}</p>
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <ArrowRight className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Phase Transition
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {asset.name} • Currently in <PhaseBadge phase={asset.currentPhase} size="xs" />
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50">
          <div className="flex justify-between">
            {steps.map((step, index) => (
              <StepIndicator 
                key={step.number}
                step={step}
                isActive={currentStep === step.number}
                isCompleted={currentStep > step.number}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Step 1: Select Phase */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Select Target Phase
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  Choose the phase you want to transition this asset to.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availablePhases.map((phase) => (
                  <button
                    key={phase}
                    onClick={() => handlePhaseSelect(phase)}
                    className={`
                      p-4 border-2 rounded-lg text-left transition-all duration-200
                      ${selectedPhase === phase
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <PhaseBadge phase={phase} size="sm" />
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {PHASE_DESCRIPTIONS[phase]}
                    </p>
                  </button>
                ))}
              </div>

              {availablePhases.length === 0 && (
                <div className="text-center py-8">
                  <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No Available Transitions
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    There are no valid phase transitions available from the current phase.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Review & Validate */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Review & Validate Transition
                </h3>
                <div className="flex items-center space-x-3 mb-6">
                  <PhaseBadge phase={asset.currentPhase} size="sm" />
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                  <PhaseBadge phase={selectedPhase} size="sm" />
                </div>
              </div>

              {/* Validation Results */}
              {validationResult && (
                <div className="space-y-4">
                  {validationResult.errors.length > 0 && (
                    <div className="p-4 border border-red-300 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-medium text-red-700 dark:text-red-300">
                            Validation Errors
                          </h4>
                          <ul className="mt-2 text-sm text-red-600 dark:text-red-400 space-y-1">
                            {validationResult.errors.map((error, index) => (
                              <li key={index}>• {error}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {validationResult.warnings.length > 0 && (
                    <div className="p-4 border border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                            Warnings
                          </h4>
                          <ul className="mt-2 text-sm text-yellow-600 dark:text-yellow-400 space-y-1">
                            {validationResult.warnings.map((warning, index) => (
                              <li key={index}>• {warning}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {validationResult.isValid && validationResult.errors.length === 0 && (
                    <div className="p-4 border border-green-300 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-medium text-green-700 dark:text-green-300">
                            Validation Passed
                          </h4>
                          <p className="mt-1 text-sm text-green-600 dark:text-green-400">
                            This phase transition is valid and can be performed.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Current Phase Progress */}
              {asset.phaseMetadata && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                    Current Phase Progress
                  </h4>
                  <PhaseProgress
                    phase={asset.currentPhase}
                    phaseMetadata={asset.phaseMetadata}
                    editable={false}
                    showRequirements={true}
                  />
                </div>
              )}

              {/* Force Transition Option */}
              {!validationResult?.isValid && (
                <div className="flex items-start space-x-3 p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
                  <input
                    type="checkbox"
                    id="forceTransition"
                    checked={forceTransition}
                    onChange={(e) => setForceTransition(e.target.checked)}
                    className="mt-1"
                  />
                  <div>
                    <label htmlFor="forceTransition" className="text-sm font-medium text-gray-900 dark:text-white">
                      Force Transition
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Override validation errors and proceed with the transition anyway. Use with caution.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Add Details */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Transition Details
                </h3>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Transition Notes
                </label>
                <textarea
                  value={transitionNotes}
                  onChange={(e) => setTransitionNotes(e.target.value)}
                  placeholder="Add notes about this phase transition..."
                  rows={4}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Scheduled Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Next Phase Target Date (Optional)
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Document Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Supporting Documents (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
                  <div className="text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Upload documents related to this transition
                    </p>
                    <input
                      type="file"
                      multiple
                      onChange={handleDocumentUpload}
                      className="hidden"
                      id="document-upload"
                    />
                    <label
                      htmlFor="document-upload"
                      className="cursor-pointer text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                    >
                      Choose files
                    </label>
                  </div>
                </div>

                {/* Uploaded Documents */}
                {uploadedDocuments.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {uploadedDocuments.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900 dark:text-white">{doc.name}</span>
                          <span className="text-xs text-gray-500">({(doc.size / 1024).toFixed(1)} KB)</span>
                        </div>
                        <button
                          onClick={() => handleRemoveDocument(doc.id)}
                          className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Confirm */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Confirm Phase Transition
                </h3>
              </div>

              {/* Transition Summary */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Asset:</span>
                  <span className="text-sm text-gray-900 dark:text-white">{asset.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">From:</span>
                  <PhaseBadge phase={asset.currentPhase} size="xs" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">To:</span>
                  <PhaseBadge phase={selectedPhase} size="xs" />
                </div>
                {scheduledDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Target Date:</span>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {new Date(scheduledDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {transitionNotes && (
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Notes:</span>
                    <p className="text-sm text-gray-900 dark:text-white mt-1">{transitionNotes}</p>
                  </div>
                )}
              </div>

              {/* Final Warning */}
              <div className="p-4 border border-orange-300 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-orange-700 dark:text-orange-300">
                      Confirm Transition
                    </h4>
                    <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                      This action will transition the asset to the {selectedPhase} phase. This action cannot be easily undone.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex space-x-3">
            {currentStep > 1 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Back
              </button>
            )}
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            
            {currentStep < 4 && (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={
                  (currentStep === 1 && !selectedPhase) ||
                  (currentStep === 2 && !validationResult?.isValid && !forceTransition)
                }
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            )}
            
            {currentStep === 4 && (
              <button
                onClick={handleTransition}
                disabled={isSubmitting}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Transitioning...</span>
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-4 h-4" />
                    <span>Confirm Transition</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PhaseTransitionModal