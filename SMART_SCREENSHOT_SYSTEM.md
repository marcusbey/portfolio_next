# Smart Screenshot System

A comprehensive solution for automatically capturing high-quality screenshots of web projects while avoiding login screens and handling various edge cases.

## Overview

The Smart Screenshot System consists of four main components that work together to provide the best possible project screenshots:

1. **Smart URL Testing Agent** - Tests multiple URL patterns and ranks them by quality
2. **Enhanced Screenshot Service** - Captures optimized screenshots with smart content detection
3. **Fallback Strategies Service** - Provides alternatives when screenshots fail
4. **Smart Screenshot Orchestrator** - Coordinates all services for optimal results

## Features

### Smart URL Testing 🔍

- **Multiple URL Pattern Generation**: Automatically generates candidate URLs from project names
- **Login/Auth Detection**: Identifies and avoids login screens, authentication pages
- **Content Quality Assessment**: Analyzes page content to determine screenshot suitability
- **Performance Scoring**: Ranks URLs by accessibility, content quality, and load time
- **Common Domain Patterns**: Tests `.com`, `.app`, `.dev`, Vercel, Netlify, and more

### Enhanced Screenshot Capture 📸

- **Hero Section Detection**: Automatically finds and captures the most important content area
- **Responsive Design Support**: Captures screenshots for desktop, tablet, and mobile viewports
- **Overlay Removal**: Intelligently hides cookie banners, chat widgets, and popup overlays
- **Content Loading**: Waits for images, animations, and dynamic content to fully load
- **Error Recovery**: Multiple retry strategies with fallback options

### Smart Fallback Strategies 🎨

- **GitHub README Images**: Extracts high-quality images from project documentation
- **Generated Placeholders**: Creates attractive SVG placeholders with project info
- **Cached Screenshots**: Uses previously captured screenshots when available
- **Technology Badges**: Displays framework and technology information visually

### Edge Case Handling 🛡️

- **Protected Deployments**: Handles authentication-required sites gracefully
- **Slow Loading Sites**: Adaptive waiting strategies for various loading patterns
- **JavaScript-Heavy Sites**: Proper handling of SPAs and client-side rendering
- **Splash Screens**: Waits for loading screens to complete
- **Network Issues**: Robust error handling and retry mechanisms

## API Endpoints

### Generate Smart Screenshots

```bash
POST /api/projects/smart-generate-screenshots
Authorization: Bearer YOUR_ADMIN_SECRET

# Single project
{
  "projectId": "project-uuid"
}

# Multiple projects
{
  "projectIds": ["uuid1", "uuid2", "uuid3"]
}

# All projects (only those without screenshots)
{}

# Force regeneration
{
  "forceRegenerate": true
}
```

### Check URL Health

```bash
POST /api/projects/check-url-health
Authorization: Bearer YOUR_ADMIN_SECRET

# Single URL
{
  "url": "https://example.com"
}

# Multiple URLs
{
  "urls": ["https://example.com", "https://alt.example.com"]
}
```

### Manage Project URLs

```bash
# Get project URLs and health status
GET /api/projects/manage-urls?projectId=PROJECT_ID
Authorization: Bearer YOUR_ADMIN_SECRET

# Update manual URLs
PUT /api/projects/manage-urls?projectId=PROJECT_ID
Authorization: Bearer YOUR_ADMIN_SECRET
{
  "manualUrls": ["https://custom-domain.com", "https://backup-url.com"]
}

# Test URLs and optionally generate screenshot
POST /api/projects/manage-urls?projectId=PROJECT_ID
Authorization: Bearer YOUR_ADMIN_SECRET
{
  "testUrls": ["https://test1.com", "https://test2.com"],
  "generateScreenshot": true
}
```

## Configuration

### Environment Variables

```env
# Required
ADMIN_SECRET=your-secret-key
VERCEL_API_TOKEN=your-vercel-token

# Optional
GITHUB_PERSONAL_ACCESS_TOKEN=your-github-token  # For README image extraction
```

### Database Schema

The system adds these fields to the `Project` model:

```prisma
model Project {
  // ... existing fields
  
  // Smart screenshot metadata
  manualUrls         String[]  @default([])           // Manual URL overrides
  screenshotStrategy String?                         // Strategy used for screenshot
  screenshotMetadata Json?                           // Additional metadata
  lastScreenshotAt   DateTime?                       // When screenshot was generated
}
```

Run the database migration:

```bash
npx prisma migrate dev --name add-smart-screenshot-fields
npx prisma generate
```

## Usage Examples

### Basic Usage

```typescript
import { getSmartScreenshotOrchestrator } from '@/lib/smart-screenshot-orchestrator'

const orchestrator = getSmartScreenshotOrchestrator()

const result = await orchestrator.generateSmartScreenshot({
  id: 'project-id',
  name: 'My Project',
  vercelUrl: 'https://my-project.vercel.app',
  githubUrl: 'https://github.com/user/my-project',
  framework: 'Next.js',
  technologies: ['React', 'TypeScript', 'Tailwind CSS']
})

if (result.success) {
  console.log('Screenshot saved to:', result.finalImagePath)
  console.log('Strategy used:', result.strategy)
} else {
  console.error('Failed:', result.error)
}
```

### URL Health Check

```typescript
import { getSmartScreenshotOrchestrator } from '@/lib/smart-screenshot-orchestrator'

const orchestrator = getSmartScreenshotOrchestrator()

const health = await orchestrator.quickHealthCheck('https://example.com')

console.log('Accessible:', health.accessible)
console.log('Screenshotable:', health.screenshotable)
console.log('Confidence:', health.confidence)
console.log('Issues:', health.issues)
```

### Bulk Processing

```typescript
const projects = [
  { id: '1', name: 'Project 1', vercelUrl: 'https://p1.vercel.app' },
  { id: '2', name: 'Project 2', vercelUrl: 'https://p2.vercel.app' }
]

const results = await orchestrator.generateBulkSmartScreenshots(projects)

results.forEach((result, projectId) => {
  console.log(`${projectId}: ${result.success ? 'Success' : 'Failed'}`)
})
```

## Screenshot Strategies

### 1. Smart Screenshot (`smart_screenshot`)

High-quality screenshot captured from the best available URL:

- Tests multiple URL candidates
- Detects and avoids login pages
- Optimizes for hero sections
- Waits for full content loading
- Removes overlays and distractions

### 2. Fallback README (`fallback_readme`)

Uses images extracted from GitHub README files:

- Searches for screenshots, previews, and demo images
- Ranks images by relevance and quality
- Prefers images that show the actual application

### 3. Fallback Placeholder (`fallback_placeholder`)

Generated SVG placeholder with project information:

- Professional gradient backgrounds
- Project name and description
- Technology badges
- Framework indicators
- Category labels

### 4. Fallback Cached (`fallback_cached`)

Previously captured screenshots (future enhancement):

- Stores successful screenshots for reuse
- Useful for temporarily inaccessible sites
- Maintains screenshot history

## Performance Considerations

### Concurrent Processing

- Limited concurrent browser instances to prevent resource exhaustion
- Respectful delays between requests to avoid overwhelming servers
- Batched processing for bulk operations

### Resource Management

- Automatic browser cleanup after operations
- Memory-efficient SVG generation for placeholders
- Optimized screenshot sizes and quality settings

### Caching and Storage

- Screenshots stored in `public/images/projects/generated/`
- Placeholders stored in `public/images/projects/placeholders/`
- Database metadata for quick status checks

## Error Handling

### Graceful Degradation

1. **Primary URL fails** → Try alternative URLs
2. **All URLs fail** → Extract GitHub README images
3. **No README images** → Generate attractive placeholder
4. **All strategies fail** → Return detailed error information

### Common Issues and Solutions

| Issue | Detection | Solution |
|-------|-----------|----------|
| Login page | Content analysis | Try alternative URLs |
| Slow loading | Timeout detection | Adaptive wait strategies |
| Network errors | HTTP status codes | Retry with backoff |
| Missing content | DOM analysis | Fallback strategies |
| JavaScript required | Content inspection | Extended wait times |

## Monitoring and Debugging

### Logging

The system provides detailed logging at each step:

```
🚀 Starting smart screenshot generation for MyProject
🔍 Generated 12 URL candidates for MyProject
📊 example.com: accessible=true, login=false, error=false, confidence=85
✅ Found accessible URL: https://example.com
📸 Attempting smart screenshot for MyProject
✅ Smart screenshot successful for MyProject
```

### Metadata Tracking

Each screenshot attempt stores metadata:

- Processing time
- Number of attempts
- Best URL found
- Confidence scores
- Strategy used
- Error details (if any)

### Health Monitoring

Use the health check endpoint to monitor URL status:

```javascript
// Check if URLs are still accessible
const health = await fetch('/api/projects/check-url-health', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_SECRET',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    urls: ['https://project1.com', 'https://project2.com']
  })
})

const results = await health.json()
console.log('Accessible projects:', results.summary.accessible)
```

## Integration with Existing System

### Vercel Project Sync

The smart screenshot system is integrated into the existing Vercel sync process:

1. Vercel projects are synced as usual
2. Smart screenshot generation replaces the old screenshot logic
3. All fallback strategies are attempted automatically
4. Projects get high-quality screenshots regardless of accessibility

### Admin Dashboard

The system works with the existing admin dashboard:

- View screenshot strategies used
- Manually trigger regeneration
- Check URL health status
- Manage manual URL overrides

## Best Practices

### URL Management

1. **Use Manual URLs**: Add custom domains and alternative URLs for better results
2. **Test Regularly**: Use health checks to monitor URL accessibility
3. **Update Metadata**: Keep project information current for better placeholders

### Performance Optimization

1. **Batch Operations**: Process multiple projects together when possible
2. **Avoid Peak Hours**: Run bulk operations during low-traffic periods
3. **Monitor Resources**: Keep an eye on memory and CPU usage during processing

### Quality Assurance

1. **Review Results**: Check generated screenshots for quality
2. **Manual Overrides**: Use manual URLs for problematic projects
3. **Regenerate When Needed**: Update screenshots when projects change significantly

## Troubleshooting

### Common Problems

**Problem**: All screenshots show login pages
**Solution**: Add manual URLs or check if the project requires authentication

**Problem**: Screenshots are taking too long
**Solution**: Reduce concurrent operations or increase timeouts

**Problem**: Generated placeholders are missing information
**Solution**: Update project metadata (description, technologies, framework)

**Problem**: URLs returning 404 errors
**Solution**: Update project URLs or use manual URL overrides

### Debug Mode

Enable detailed logging by setting the log level:

```typescript
// Enable verbose logging for troubleshooting
process.env.LOG_LEVEL = 'debug'
```

## Future Enhancements

- **AI-Powered Quality Assessment**: Use computer vision to rate screenshot quality
- **Dynamic Placeholder Generation**: Create placeholders based on actual project content
- **Screenshot Scheduling**: Automatic periodic updates of project screenshots
- **Mobile-First Capture**: Prioritize mobile viewports for responsive designs
- **Performance Metrics**: Track and optimize screenshot generation performance
- **Integration Testing**: Automated testing of URL accessibility and screenshot quality

## Contributing

When contributing to the smart screenshot system:

1. Test with various project types and hosting platforms
2. Ensure graceful handling of edge cases
3. Update documentation for new features
4. Add comprehensive error handling
5. Consider performance implications of changes

## License

This smart screenshot system is part of the portfolio project and follows the same license terms.