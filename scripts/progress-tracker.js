#!/usr/bin/env node

/**
 * Automated Progress Tracker for Asset Tracker Project
 * 
 * This script analyzes the codebase and automatically updates project documentation
 * with current progress, feature completion status, and development metrics.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

class ProgressTracker {
  constructor() {
    this.features = {
      authentication: { weight: 8, files: ['src/pages/auth/', 'src/context/AuthContext.jsx'] },
      dashboard: { weight: 12, files: ['src/pages/Dashboard.jsx', 'src/components/dashboard/'] },
      assetManagement: { weight: 18, files: ['src/pages/Assets.jsx', 'src/components/assets/', 'src/stores/assetStore.js'] },
      taskManagement: { weight: 15, files: ['src/pages/Tasks.jsx', 'src/components/tasks/', 'src/stores/taskStore.js'] },
      calendar: { weight: 12, files: ['src/pages/Calendar.jsx', 'src/components/calendar/', 'src/stores/calendarStore.js'] },
      settings: { weight: 8, files: ['src/pages/Settings.jsx'] },
      responsive: { weight: 5, files: ['src/components/layout/', 'tailwind.config.js'] },
      theme: { weight: 4, files: ['src/context/ThemeContext.jsx'] },
      search: { weight: 8, files: ['src/components/search/', 'src/stores/searchStore.js'] },
      analytics: { weight: 10, files: ['src/components/analytics/', 'src/utils/analyticsUtils.js'] },
      realtime: { weight: 10, files: ['src/services/websocketService.js', 'src/context/WebSocketContext.jsx', 'src/components/realtime/', 'websocket-server.js'] }
    };

    this.progress = {
      overall: 0,
      features: {},
      lastUpdated: new Date().toISOString(),
      metrics: {
        totalFiles: 0,
        totalLines: 0,
        components: 0,
        pages: 0,
        tests: 0
      }
    };
  }

  async analyzeProject() {
    console.log('🔍 Analyzing project structure...');
    
    try {
      // Analyze each feature
      for (const [featureName, featureConfig] of Object.entries(this.features)) {
        const completion = await this.analyzeFeature(featureName, featureConfig);
        this.progress.features[featureName] = completion;
      }

      // Calculate overall progress
      this.calculateOverallProgress();

      // Gather project metrics
      await this.gatherMetrics();

      console.log('✅ Analysis complete!');
      return this.progress;
    } catch (error) {
      console.error('❌ Error analyzing project:', error.message);
      throw error;
    }
  }

  async analyzeFeature(featureName, config) {
    let totalFiles = 0;
    let existingFiles = 0;
    let totalLines = 0;

    for (const filePath of config.files) {
      const fullPath = path.join(projectRoot, filePath);
      
      try {
        const stats = await fs.stat(fullPath);
        
        if (stats.isDirectory()) {
          const dirAnalysis = await this.analyzeDirectory(fullPath);
          totalFiles += dirAnalysis.fileCount;
          existingFiles += dirAnalysis.fileCount;
          totalLines += dirAnalysis.lineCount;
        } else {
          totalFiles++;
          if (stats.isFile()) {
            existingFiles++;
            const content = await fs.readFile(fullPath, 'utf-8');
            totalLines += content.split('\n').length;
          }
        }
      } catch (error) {
        totalFiles++;
        // File doesn't exist, count as incomplete
      }
    }

    const completion = totalFiles > 0 ? Math.round((existingFiles / totalFiles) * 100) : 0;
    
    return {
      completion,
      files: existingFiles,
      totalFiles,
      lines: totalLines,
      status: completion >= 90 ? 'complete' : completion >= 50 ? 'in-progress' : 'planned'
    };
  }

  async analyzeDirectory(dirPath) {
    let fileCount = 0;
    let lineCount = 0;

    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isFile() && (entry.name.endsWith('.jsx') || entry.name.endsWith('.js'))) {
          fileCount++;
          const filePath = path.join(dirPath, entry.name);
          try {
            const content = await fs.readFile(filePath, 'utf-8');
            lineCount += content.split('\n').length;
          } catch (error) {
            // Skip files that can't be read
          }
        } else if (entry.isDirectory()) {
          const subDirAnalysis = await this.analyzeDirectory(path.join(dirPath, entry.name));
          fileCount += subDirAnalysis.fileCount;
          lineCount += subDirAnalysis.lineCount;
        }
      }
    } catch (error) {
      // Directory doesn't exist or can't be read
    }

    return { fileCount, lineCount };
  }

  calculateOverallProgress() {
    let weightedSum = 0;
    let totalWeight = 0;

    for (const [featureName, featureData] of Object.entries(this.progress.features)) {
      const weight = this.features[featureName].weight;
      weightedSum += (featureData.completion * weight);
      totalWeight += weight;
    }

    this.progress.overall = Math.round(weightedSum / totalWeight);
  }

  async gatherMetrics() {
    const srcPath = path.join(projectRoot, 'src');
    
    try {
      this.progress.metrics = await this.calculateMetrics(srcPath);
    } catch (error) {
      console.warn('⚠️ Could not gather metrics:', error.message);
    }
  }

  async calculateMetrics(dirPath) {
    let totalFiles = 0;
    let totalLines = 0;
    let components = 0;
    let pages = 0;
    let tests = 0;

    const analyzeDir = async (currentPath) => {
      try {
        const entries = await fs.readdir(currentPath, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(currentPath, entry.name);
          
          if (entry.isFile()) {
            if (entry.name.endsWith('.jsx') || entry.name.endsWith('.js')) {
              totalFiles++;
              
              if (entry.name.includes('.test.') || entry.name.includes('.spec.')) {
                tests++;
              } else if (currentPath.includes('/pages/')) {
                pages++;
              } else if (currentPath.includes('/components/')) {
                components++;
              }

              try {
                const content = await fs.readFile(fullPath, 'utf-8');
                totalLines += content.split('\n').length;
              } catch (error) {
                // Skip files that can't be read
              }
            }
          } else if (entry.isDirectory()) {
            await analyzeDir(fullPath);
          }
        }
      } catch (error) {
        // Skip directories that can't be read
      }
    };

    await analyzeDir(dirPath);

    return { totalFiles, totalLines, components, pages, tests };
  }

  async updateReadme() {
    console.log('📝 Updating README.md...');
    
    const readmePath = path.join(projectRoot, 'README.md');
    
    try {
      let content = await fs.readFile(readmePath, 'utf-8');
      
      // Update progress percentage
      content = content.replace(
        /### 🎯 Overall Completion: \*\*\d+%\*\*/,
        `### 🎯 Overall Completion: **${this.progress.overall}%**`
      );

      // Update feature progress table
      const tableRows = Object.entries(this.progress.features).map(([featureName, data]) => {
        const emoji = this.getFeatureEmoji(featureName);
        const displayName = this.getFeatureDisplayName(featureName);
        const status = data.completion >= 90 ? '✅ Complete' : 
                     data.completion >= 50 ? '🚧 In Progress' : '📋 Planned';
        
        return `| ${emoji} ${displayName} | ${data.completion}% | ${status} |`;
      }).join('\n');

      // Replace the feature table
      const tablePattern = /(\| Feature Category \| Progress \| Status \|\n\|[^\n]+\|\n)([\s\S]*?)(\n\n###)/;
      content = content.replace(tablePattern, `$1${tableRows}$3`);

      // Update last updated timestamp
      const timestamp = new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      content = content.replace(
        /Last Updated: [^\n]+/,
        `Last Updated: ${timestamp} (Auto-generated)`
      );

      await fs.writeFile(readmePath, content, 'utf-8');
      console.log('✅ README.md updated successfully!');
    } catch (error) {
      console.error('❌ Failed to update README.md:', error.message);
      throw error;
    }
  }

  getFeatureEmoji(featureName) {
    const emojiMap = {
      authentication: '🔐',
      dashboard: '📊',
      assetManagement: '🏠',
      taskManagement: '✅',
      calendar: '📅',
      settings: '⚙️',
      responsive: '📱',
      theme: '🌙',
      search: '🔍',
      analytics: '📈',
      realtime: '⚡'
    };
    return emojiMap[featureName] || '🔧';
  }

  getFeatureDisplayName(featureName) {
    const nameMap = {
      authentication: 'Authentication',
      dashboard: 'Dashboard',
      assetManagement: 'Asset Management',
      taskManagement: 'Task Management',
      calendar: 'Calendar System',
      settings: 'Settings Panel',
      responsive: 'Responsive Design',
      theme: 'Theme System',
      search: 'Search & Filtering',
      analytics: 'Advanced Analytics',
      realtime: 'Real-time Features'
    };
    return nameMap[featureName] || featureName;
  }

  async generateProgressReport() {
    const reportPath = path.join(projectRoot, 'PROGRESS_REPORT.md');
    
    const report = `# 📊 Automated Progress Report

Generated on: ${new Date().toLocaleString()}

## 🎯 Overall Progress: ${this.progress.overall}%

## 📈 Feature Breakdown

${Object.entries(this.progress.features).map(([name, data]) => `
### ${this.getFeatureEmoji(name)} ${this.getFeatureDisplayName(name)}
- **Completion**: ${data.completion}%
- **Status**: ${data.status}
- **Files**: ${data.files}/${data.totalFiles}
- **Lines of Code**: ${data.lines.toLocaleString()}
`).join('')}

## 📊 Project Metrics

- **Total Files**: ${this.progress.metrics.totalFiles}
- **Total Lines**: ${this.progress.metrics.totalLines.toLocaleString()}
- **Components**: ${this.progress.metrics.components}
- **Pages**: ${this.progress.metrics.pages}
- **Tests**: ${this.progress.metrics.tests}

## 🏆 Achievements

${this.progress.overall >= 90 ? '🎉 Project is near completion!' : 
  this.progress.overall >= 70 ? '🚀 Great progress! Keep it up!' : 
  this.progress.overall >= 50 ? '💪 Good momentum building!' : 
  '🌱 Project is getting started!'}

---

*This report is automatically generated by the Asset Tracker progress tracking system.*
`;

    await fs.writeFile(reportPath, report, 'utf-8');
    console.log('📄 Progress report generated: PROGRESS_REPORT.md');
  }

  printSummary() {
    console.log('\n🎯 PROGRESS SUMMARY');
    console.log('==================');
    console.log(`Overall Completion: ${this.progress.overall}%`);
    console.log(`Total Files: ${this.progress.metrics.totalFiles}`);
    console.log(`Total Lines: ${this.progress.metrics.totalLines.toLocaleString()}`);
    console.log('\nFeature Status:');
    
    Object.entries(this.progress.features).forEach(([name, data]) => {
      const status = data.completion >= 90 ? '✅' : data.completion >= 50 ? '🚧' : '📋';
      console.log(`  ${status} ${this.getFeatureDisplayName(name)}: ${data.completion}%`);
    });
  }
}

// Main execution
async function main() {
  const tracker = new ProgressTracker();
  
  try {
    await tracker.analyzeProject();
    await tracker.updateReadme();
    await tracker.generateProgressReport();
    tracker.printSummary();
    
    console.log('\n🎉 Progress tracking complete!');
  } catch (error) {
    console.error('\n❌ Progress tracking failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default ProgressTracker;