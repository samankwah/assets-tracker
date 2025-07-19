export const taskTemplates = [
  // Inspection Templates
  {
    id: 'annual-inspection',
    name: 'Annual Property Inspection',
    description: 'Comprehensive annual inspection covering all property systems and components',
    type: 'Inspection',
    priority: 'High',
    estimatedDuration: 240, // minutes
    frequency: 'Annual',
    phase: 'acquisition',
    checklist: [
      'Exterior building condition',
      'Roof and gutters inspection',
      'Plumbing systems check',
      'Electrical systems inspection',
      'HVAC system evaluation',
      'Interior condition assessment',
      'Safety equipment check',
      'Documentation and photos'
    ],
    requiredTools: ['Camera', 'Measuring tape', 'Flashlight', 'Inspection forms'],
    notes: 'Schedule during dry weather for best exterior assessment. Coordinate with tenants if property is occupied.'
  },
  {
    id: 'quarterly-safety-check',
    name: 'Quarterly Safety Check',
    description: 'Safety systems and equipment inspection',
    type: 'Safety Check',
    priority: 'High',
    estimatedDuration: 90,
    frequency: 'Quarterly',
    phase: 'maintenance',
    checklist: [
      'Smoke detector functionality',
      'Carbon monoxide detector test',
      'Fire extinguisher check',
      'Emergency lighting test',
      'Security system verification',
      'Window and door locks',
      'Stair railings and safety',
      'Electrical outlet safety'
    ],
    requiredTools: ['Battery tester', 'Test button checker', 'Screwdriver'],
    notes: 'Replace batteries in detectors as needed. Document any safety concerns immediately.'
  },
  {
    id: 'move-in-inspection',
    name: 'Move-in Property Inspection',
    description: 'Detailed inspection before new tenant move-in',
    type: 'Inspection',
    priority: 'High',
    estimatedDuration: 120,
    frequency: 'As Needed',
    phase: 'acquisition',
    checklist: [
      'Overall cleanliness check',
      'Wall and ceiling condition',
      'Floor condition and cleanliness',
      'Window condition and operation',
      'Appliance functionality',
      'Plumbing fixtures operation',
      'Light fixtures and switches',
      'Cabinet and drawer condition',
      'Key and access verification'
    ],
    requiredTools: ['Camera', 'Inspection forms', 'Cleaning checklist'],
    notes: 'Complete before keys are handed over. Share results with tenant.'
  },

  // Maintenance Templates
  {
    id: 'hvac-maintenance',
    name: 'HVAC System Maintenance',
    description: 'Regular maintenance of heating, ventilation, and air conditioning systems',
    type: 'Maintenance',
    priority: 'Medium',
    estimatedDuration: 180,
    frequency: 'Bi-annual',
    phase: 'maintenance',
    checklist: [
      'Filter replacement/cleaning',
      'Coil cleaning (indoor/outdoor)',
      'Thermostat calibration',
      'Ductwork inspection',
      'Refrigerant level check',
      'Electrical connections tightening',
      'Fan belt inspection',
      'System performance test'
    ],
    requiredTools: ['Replacement filters', 'Cleaning supplies', 'Multimeter', 'Basic tools'],
    notes: 'Schedule before peak heating/cooling seasons. Consider professional service for complex issues.'
  },
  {
    id: 'plumbing-maintenance',
    name: 'Plumbing System Check',
    description: 'Comprehensive plumbing system inspection and maintenance',
    type: 'Maintenance',
    priority: 'Medium',
    estimatedDuration: 120,
    frequency: 'Bi-annual',
    phase: 'maintenance',
    checklist: [
      'Faucet and fixture inspection',
      'Toilet operation check',
      'Drain flow testing',
      'Pipe leak inspection',
      'Water pressure assessment',
      'Hot water heater check',
      'Shut-off valve operation',
      'Caulking and sealing inspection'
    ],
    requiredTools: ['Plumber tools', 'Pressure gauge', 'Flashlight', 'Caulk gun'],
    notes: 'Address minor leaks immediately to prevent major damage.'
  },
  {
    id: 'exterior-maintenance',
    name: 'Exterior Property Maintenance',
    description: 'Maintenance of building exterior and grounds',
    type: 'Maintenance',
    priority: 'Medium',
    estimatedDuration: 240,
    frequency: 'Bi-annual',
    phase: 'maintenance',
    checklist: [
      'Roof inspection and repairs',
      'Gutter cleaning and inspection',
      'Exterior paint touch-ups',
      'Window and door sealing',
      'Driveway and walkway condition',
      'Landscaping and lawn care',
      'Fence and gate inspection',
      'Outdoor lighting check'
    ],
    requiredTools: ['Ladder', 'Garden tools', 'Paint supplies', 'Cleaning equipment'],
    notes: 'Weather-dependent task. Schedule during favorable conditions.'
  },

  // Cleaning Templates
  {
    id: 'deep-cleaning',
    name: 'Deep Cleaning Service',
    description: 'Thorough cleaning of entire property',
    type: 'Cleaning',
    priority: 'Medium',
    estimatedDuration: 480,
    frequency: 'Quarterly',
    phase: 'maintenance',
    checklist: [
      'All rooms thoroughly cleaned',
      'Kitchen appliances detailed',
      'Bathroom deep clean and sanitize',
      'Window cleaning (interior/exterior)',
      'Floor deep cleaning/polishing',
      'Light fixture cleaning',
      'Baseboard and trim cleaning',
      'Carpet cleaning (if applicable)'
    ],
    requiredTools: ['Cleaning supplies', 'Vacuum', 'Mop', 'Window cleaner', 'Carpet cleaner'],
    notes: 'Best performed between tenants or during extended vacancy periods.'
  },
  {
    id: 'move-out-cleaning',
    name: 'Move-out Cleaning',
    description: 'Comprehensive cleaning after tenant move-out',
    type: 'Cleaning',
    priority: 'High',
    estimatedDuration: 360,
    frequency: 'As Needed',
    phase: 'maintenance',
    checklist: [
      'All surfaces wiped and sanitized',
      'Appliances cleaned inside and out',
      'Cabinets cleaned inside and out',
      'Floors thoroughly cleaned',
      'Bathrooms deep cleaned',
      'Windows cleaned',
      'Light fixtures cleaned',
      'Touch-up painting as needed'
    ],
    requiredTools: ['Cleaning supplies', 'Paint for touch-ups', 'Cleaning equipment'],
    notes: 'Essential for preparing property for new tenants. Take before/after photos.'
  },

  // Repair Templates
  {
    id: 'emergency-repair',
    name: 'Emergency Repair Response',
    description: 'Immediate response for urgent property issues',
    type: 'Repair',
    priority: 'High',
    estimatedDuration: 60,
    frequency: 'As Needed',
    phase: 'maintenance',
    checklist: [
      'Assess safety concerns',
      'Identify root cause',
      'Implement temporary fix',
      'Document damage',
      'Contact insurance if needed',
      'Schedule permanent repair',
      'Notify relevant parties',
      'Update property records'
    ],
    requiredTools: ['Emergency toolkit', 'Camera', 'Contact list', 'First aid kit'],
    notes: 'Prioritize safety first. Document everything for insurance and records.'
  },
  {
    id: 'minor-repairs',
    name: 'Minor Repairs and Touch-ups',
    description: 'Small repairs and maintenance tasks',
    type: 'Repair',
    priority: 'Low',
    estimatedDuration: 120,
    frequency: 'Monthly',
    phase: 'maintenance',
    checklist: [
      'Touch-up paint where needed',
      'Tighten loose fixtures',
      'Replace burnt-out bulbs',
      'Adjust door and cabinet hinges',
      'Caulk gaps and cracks',
      'Replace worn weather stripping',
      'Lubricate moving parts',
      'Clean and organize storage areas'
    ],
    requiredTools: ['Basic tool kit', 'Paint supplies', 'Light bulbs', 'Caulk', 'Lubricants'],
    notes: 'Regular minor maintenance prevents major issues. Keep detailed records.'
  },

  // Planning Templates
  {
    id: 'renovation-planning',
    name: 'Renovation Project Planning',
    description: 'Planning and preparation for property renovation',
    type: 'Planning',
    priority: 'Medium',
    estimatedDuration: 240,
    frequency: 'As Needed',
    phase: 'renovation',
    checklist: [
      'Define renovation scope',
      'Get multiple contractor quotes',
      'Check permit requirements',
      'Plan timeline and phases',
      'Budget preparation',
      'Material selection',
      'Tenant notification (if applicable)',
      'Finalize contracts and agreements'
    ],
    requiredTools: ['Measuring tools', 'Planning documents', 'Calculator', 'Camera'],
    notes: 'Thorough planning prevents cost overruns and delays.'
  },
  {
    id: 'budget-review',
    name: 'Property Budget Review',
    description: 'Quarterly review of property expenses and budget',
    type: 'Planning',
    priority: 'Medium',
    estimatedDuration: 120,
    frequency: 'Quarterly',
    phase: 'acquisition',
    checklist: [
      'Review maintenance expenses',
      'Analyze utility costs',
      'Assess property tax changes',
      'Review insurance costs',
      'Evaluate rental income',
      'Plan upcoming expenses',
      'Update property valuation',
      'Adjust budget for next quarter'
    ],
    requiredTools: ['Financial records', 'Calculator', 'Budget spreadsheets'],
    notes: 'Regular budget reviews help maintain profitability and plan for improvements.'
  }
];

export const getTemplatesByType = (type) => {
  return taskTemplates.filter(template => template.type === type);
};

export const getTemplatesByPhase = (phase) => {
  return taskTemplates.filter(template => template.phase === phase);
};

export const getTemplatesByFrequency = (frequency) => {
  return taskTemplates.filter(template => template.frequency === frequency);
};

export const searchTemplates = (searchTerm) => {
  const term = searchTerm.toLowerCase();
  return taskTemplates.filter(template => 
    template.name.toLowerCase().includes(term) ||
    template.description.toLowerCase().includes(term) ||
    template.type.toLowerCase().includes(term) ||
    template.checklist.some(item => item.toLowerCase().includes(term))
  );
};

export default taskTemplates;