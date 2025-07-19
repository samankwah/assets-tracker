// Email Templates - HTML email templates for notifications
// Responsive email templates with consistent branding

export const EMAIL_TEMPLATES = {
  // Base template wrapper
  BASE_TEMPLATE: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>{{title}}</title>
      <style>
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%); padding: 30px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; }
        .content { padding: 30px; }
        .footer { background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; }
        .btn { display: inline-block; padding: 12px 24px; background-color: #0ea5e9; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 500; margin: 10px 0; }
        .btn:hover { background-color: #0369a1; }
        .alert { padding: 15px; border-radius: 6px; margin: 15px 0; }
        .alert-high { background-color: #fef2f2; border-left: 4px solid #ef4444; color: #991b1b; }
        .alert-urgent { background-color: #fdf2f8; border-left: 4px solid #ec4899; color: #9d174d; }
        .alert-normal { background-color: #f0f9ff; border-left: 4px solid #3b82f6; color: #1e40af; }
        .asset-info { background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 15px 0; }
        .task-details { background-color: #fffbeb; padding: 15px; border-radius: 6px; margin: 10px 0; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin: 20px 0; }
        .stat-card { background-color: #f8fafc; padding: 15px; border-radius: 6px; text-align: center; }
        .stat-number { font-size: 24px; font-weight: 700; color: #0ea5e9; }
        .stat-label { font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>{{headerTitle}}</h1>
        </div>
        <div class="content">
          {{content}}
        </div>
        <div class="footer">
          <p>Asset Tracker - Your Property Management Solution</p>
          <p>This email was sent to {{email}}. <a href="{{unsubscribeUrl}}">Unsubscribe</a></p>
        </div>
      </div>
    </body>
    </html>
  `,

  // Task Due Template
  TASK_DUE: `
    <h2>Task Due Today</h2>
    <p>Hello {{userName}},</p>
    <p>This is a reminder that you have a task due today:</p>
    
    <div class="task-details">
      <h3>{{taskType}}</h3>
      <p><strong>Asset:</strong> {{assetName}}</p>
      <p><strong>Address:</strong> {{assetAddress}}</p>
      <p><strong>Due Date:</strong> {{dueDate}} at {{dueTime}}</p>
      <p><strong>Priority:</strong> <span style="color: {{priorityColor}};">{{priority}}</span></p>
      {{#if description}}
      <p><strong>Description:</strong> {{description}}</p>
      {{/if}}
    </div>

    <div class="alert alert-high">
      <strong>Action Required:</strong> Please complete this task today to stay on schedule.
    </div>

    <p style="text-align: center;">
      <a href="{{dashboardUrl}}" class="btn">View Task Details</a>
    </p>

    <p>Best regards,<br>Asset Tracker Team</p>
  `,

  // Task Overdue Template
  TASK_OVERDUE: `
    <h2>Overdue Task Alert</h2>
    <p>Hello {{userName}},</p>
    <p><strong>URGENT:</strong> You have an overdue task that requires immediate attention:</p>
    
    <div class="task-details">
      <h3>{{taskType}}</h3>
      <p><strong>Asset:</strong> {{assetName}}</p>
      <p><strong>Address:</strong> {{assetAddress}}</p>
      <p><strong>Was Due:</strong> {{dueDate}}</p>
      <p><strong>Days Overdue:</strong> <span style="color: #ef4444; font-weight: bold;">{{daysOverdue}}</span></p>
      <p><strong>Priority:</strong> <span style="color: {{priorityColor}};">{{priority}}</span></p>
      {{#if description}}
      <p><strong>Description:</strong> {{description}}</p>
      {{/if}}
    </div>

    <div class="alert alert-urgent">
      <strong>Immediate Action Required:</strong> This task is {{daysOverdue}} day{{#if (gt daysOverdue 1)}}s{{/if}} overdue. Please complete it as soon as possible to prevent further delays.
    </div>

    <p style="text-align: center;">
      <a href="{{dashboardUrl}}" class="btn">Complete Task Now</a>
    </p>

    <p>Best regards,<br>Asset Tracker Team</p>
  `,

  // Inspection Reminder Template
  INSPECTION_REMINDER: `
    <h2>Inspection Reminder</h2>
    <p>Hello {{userName}},</p>
    <p>This is a reminder about your upcoming property inspection:</p>
    
    <div class="asset-info">
      <h3>{{assetName}}</h3>
      <p><strong>Property Type:</strong> {{assetType}}</p>
      <p><strong>Address:</strong> {{assetAddress}}</p>
      <p><strong>Inspection Date:</strong> {{inspectionDate}} at {{inspectionTime}}</p>
      <p><strong>Frequency:</strong> {{frequency}}</p>
    </div>

    <div class="alert alert-normal">
      <strong>Preparation Tips:</strong>
      <ul>
        <li>Ensure property is accessible</li>
        <li>Have maintenance records available</li>
        <li>Note any concerns or issues</li>
        <li>Prepare list of questions for inspector</li>
      </ul>
    </div>

    <p style="text-align: center;">
      <a href="{{dashboardUrl}}" class="btn">View Asset Details</a>
    </p>

    <p>Best regards,<br>Asset Tracker Team</p>
  `,

  // Maintenance Completed Template
  MAINTENANCE_COMPLETED: `
    <h2>Task Completed</h2>
    <p>Hello {{userName}},</p>
    <p>Great news! A maintenance task has been completed for your property:</p>
    
    <div class="task-details">
      <h3>{{taskType}}</h3>
      <p><strong>Asset:</strong> {{assetName}}</p>
      <p><strong>Address:</strong> {{assetAddress}}</p>
      <p><strong>Completed Date:</strong> {{completedDate}}</p>
      <p><strong>Completed By:</strong> {{completedBy}}</p>
      {{#if notes}}
      <p><strong>Notes:</strong> {{notes}}</p>
      {{/if}}
    </div>

    <div class="alert alert-normal">
      <strong>Task Status:</strong> This maintenance task has been successfully completed and marked as finished in your system.
    </div>

    <p style="text-align: center;">
      <a href="{{dashboardUrl}}" class="btn">View Task Details</a>
    </p>

    <p>Thank you for using Asset Tracker!</p>
  `,

  // Asset Status Change Template
  ASSET_STATUS_CHANGE: `
    <h2>Asset Status Update</h2>
    <p>Hello {{userName}},</p>
    <p>The status of one of your assets has been updated:</p>
    
    <div class="asset-info">
      <h3>{{assetName}}</h3>
      <p><strong>Property Type:</strong> {{assetType}}</p>
      <p><strong>Address:</strong> {{assetAddress}}</p>
      <p><strong>Previous Status:</strong> <span style="color: #64748b;">{{oldStatus}}</span></p>
      <p><strong>New Status:</strong> <span style="color: #059669; font-weight: bold;">{{newStatus}}</span></p>
      <p><strong>Updated On:</strong> {{changedDate}}</p>
    </div>

    <div class="alert alert-normal">
      <strong>Status Change:</strong> Your asset status has been updated to reflect its current condition and operational state.
    </div>

    <p style="text-align: center;">
      <a href="{{dashboardUrl}}" class="btn">View Asset Details</a>
    </p>

    <p>Best regards,<br>Asset Tracker Team</p>
  `,

  // Weekly Report Template
  WEEKLY_REPORT: `
    <h2>Weekly Asset Report</h2>
    <p>Hello {{userName}},</p>
    <p>Here's your weekly asset management summary for {{reportDate}}:</p>
    
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-number">{{totalAssets}}</div>
        <div class="stat-label">Total Assets</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{tasksCompleted}}</div>
        <div class="stat-label">Tasks Completed</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{tasksPending}}</div>
        <div class="stat-label">Tasks Pending</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{tasksOverdue}}</div>
        <div class="stat-label">Tasks Overdue</div>
      </div>
    </div>

    {{#if tasksOverdue}}
    <div class="alert alert-high">
      <strong>Attention Required:</strong> You have {{tasksOverdue}} overdue task{{#if (gt tasksOverdue 1)}}s{{/if}} that need immediate attention.
    </div>
    {{/if}}

    {{#if inspectionsDue}}
    <div class="alert alert-normal">
      <strong>Upcoming Inspections:</strong> {{inspectionsDue}} inspection{{#if (gt inspectionsDue 1)}}s{{/if}} due this week.
    </div>
    {{/if}}

    {{#if upcomingTasks}}
    <h3>Upcoming Tasks</h3>
    <ul>
      {{#each upcomingTasks}}
      <li><strong>{{type}}</strong> for {{assetName}} - Due {{dueDate}}</li>
      {{/each}}
    </ul>
    {{/if}}

    <p style="text-align: center;">
      <a href="{{dashboardUrl}}" class="btn">View Full Dashboard</a>
    </p>

    <p>Keep up the great work managing your assets!</p>
  `,

  // Monthly Report Template
  MONTHLY_REPORT: `
    <h2>Monthly Asset Report - {{monthName}}</h2>
    <p>Hello {{userName}},</p>
    <p>Here's your comprehensive monthly asset management report:</p>
    
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-number">{{totalAssets}}</div>
        <div class="stat-label">Total Assets</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{tasksCompleted}}</div>
        <div class="stat-label">Tasks Completed</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${{maintenanceCosts}}</div>
        <div class="stat-label">Maintenance Costs</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{inspectionsCompleted}}</div>
        <div class="stat-label">Inspections Done</div>
      </div>
    </div>

    <h3>Monthly Highlights</h3>
    <div class="asset-info">
      <ul>
        <li>Completed {{tasksCompleted}} maintenance tasks</li>
        <li>Conducted {{inspectionsCompleted}} property inspections</li>
        <li>Total maintenance investment: ${{maintenanceCosts}}</li>
        <li>Asset portfolio actively managed: {{totalAssets}} properties</li>
      </ul>
    </div>

    {{#if performanceMetrics}}
    <h3>Performance Metrics</h3>
    <div class="stats-grid">
      {{#if performanceMetrics.taskCompletionRate}}
      <div class="stat-card">
        <div class="stat-number">{{performanceMetrics.taskCompletionRate}}%</div>
        <div class="stat-label">Task Completion Rate</div>
      </div>
      {{/if}}
      {{#if performanceMetrics.avgResponseTime}}
      <div class="stat-card">
        <div class="stat-number">{{performanceMetrics.avgResponseTime}}</div>
        <div class="stat-label">Avg Response Time</div>
      </div>
      {{/if}}
    </div>
    {{/if}}

    <p style="text-align: center;">
      <a href="{{dashboardUrl}}" class="btn">View Detailed Analytics</a>
    </p>

    <p>Thank you for choosing Asset Tracker for your property management needs!</p>
  `
}

// Template compiler utility
export class EmailTemplateCompiler {
  static compile(template, data) {
    let compiled = template
    
    // Simple handlebars-like template compilation
    // Replace {{variable}} with data values
    Object.keys(data).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g')
      compiled = compiled.replace(regex, data[key] || '')
    })
    
    // Handle conditional blocks {{#if variable}}...{{/if}}
    compiled = this.handleConditionals(compiled, data)
    
    // Handle loops {{#each array}}...{{/each}}
    compiled = this.handleLoops(compiled, data)
    
    return compiled
  }
  
  static handleConditionals(template, data) {
    const ifRegex = /{{#if\s+(\w+)}}(.*?){{\/if}}/gs
    
    return template.replace(ifRegex, (match, condition, content) => {
      const value = data[condition]
      if (value && value !== 0 && value !== false && value !== '') {
        return content
      }
      return ''
    })
  }
  
  static handleLoops(template, data) {
    const eachRegex = /{{#each\s+(\w+)}}(.*?){{\/each}}/gs
    
    return template.replace(eachRegex, (match, arrayName, content) => {
      const array = data[arrayName]
      if (!Array.isArray(array)) return ''
      
      return array.map(item => {
        let itemContent = content
        Object.keys(item).forEach(key => {
          const regex = new RegExp(`{{${key}}}`, 'g')
          itemContent = itemContent.replace(regex, item[key] || '')
        })
        return itemContent
      }).join('')
    })
  }
  
  static wrapInBaseTemplate(content, data) {
    return this.compile(EMAIL_TEMPLATES.BASE_TEMPLATE, {
      ...data,
      content: this.compile(content, data)
    })
  }
}

export default { EMAIL_TEMPLATES, EmailTemplateCompiler }