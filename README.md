# IMAGO Image Search

A lightweight search experience for IMAGO's media content library, built with Next.js and TypeScript. This application provides keyword search, filtering, and pagination for media items with inconsistent metadata.

## Features

- **Keyword Search**: Search across media text content (`suchtext`), credit (`fotografen`), and image number (`bildnummer`)
- **Filters**: Filter by credit, date range, and restrictions (multi-select, extracted from text)
- **Sorting**: Sort results by date (ascending/descending)
- **Pagination**: Paginated results with configurable page size
- **Analytics**: Client-side tracking of search queries and usage
- **Responsive UI**: Dark-themed interface built with Tailwind CSS
- **Auto-suggestions**: Search history with query counts
- **Text Snippets**: When searching by text, results display truncated snippets instead of full content
- **Dynamic Card Colors**: Background colors based on `bildnummer` for visual variety

## Tech Stack

- **Frontend**: Next.js 16, React, TypeScript, Tailwind CSS
- **Search**: Fuse.js for fuzzy text matching
- **Date Handling**: date-fns for parsing and formatting
- **Pagination**: react-paginate
- **Deployment**: Vercel (recommended)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/dnelband/images-metadata-search.git
   cd images-metadata-search
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   pnpm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Search Interface

- Enter keywords in the search input for fuzzy matching across content
- Use filters for credit, date range, and restrictions
- Sort results by date
- Navigate through pages using pagination controls

### API Endpoint

The application exposes a REST API at `/api/search` with the following query parameters:

- `suchtext`: Keyword search string
- `fotografen`: Credit filter
- **API Restrictions Parameter**: Now accepts comma-separated values for multi-select (e.g., `restrictions=PUBLIC,EDITORIAL`)
- `from`: Start date (YYYY-MM-DD)
- `to`: End date (YYYY-MM-DD)
- `page`: Page number (0-based)
- `pageSize`: Results per page
- `sortOrder`: "asc" or "desc"

Example request:
```
GET /api/search?suchtext=michael&page=0&pageSize=10&sortOrder=desc
```

## High-Level Approach

This implementation focuses on a maintainable, type-safe search layer using Next.js server components and client-side React. The search uses Fuse.js for fuzzy matching with custom scoring to prioritize exact matches and relevant fields. Data preprocessing normalizes dates and extracts restrictions during load time. The UI provides a polished experience with debounced search, loading states, and responsive design.

## Assumptions

- Dataset size: Tested with the provided sample dataset (~10,000 items expected)
- Restrictions are embedded in `suchtext` using "x" delimiters (e.g., "PUBLICATIONxINxGERxAUS")
- Date formats are consistent (DD.MM.YYYY)
- Client-side analytics are sufficient for demo purposes
- No authentication or authorization required
- Single-user environment (no concurrent write operations)

## Design Decisions

### Search/Relevance Strategy

- **Fuse.js Configuration**:
  - Weights: `suchtext` (70%), `fotografen` (20%), `bildnummer` (10%)
  - Threshold: 0.35 for balanced precision/recall
  - Extended search enabled for complex queries
  - Minimum match length: 2 characters

- **Scoring Boosts**:
  - Exact prefix matches in `bildnummer`: -0.15 score reduction
  - Partial matches in `fotografen`: -0.05 reduction
  - Contains matches in `suchtext`: -0.1 reduction

- **Preprocessing**:
  - Date normalization to ISO strings during data load
  - Restriction extraction using regex patterns
  - Cached normalized data to avoid repeated processing

### Data Flow

1. Load and normalize data on server startup
2. Client sends search requests to `/api/search`
3. Server applies filters, runs Fuse.js search, sorts results
4. Return paginated results with metadata

## Limitations

- No full-text indexing for large datasets (10k+ items require Elasticsearch or similar)
- Client-side analytics (not persisted server-side)
- No advanced query syntax (AND/OR/NOT boolean operators)
- No image thumbnails or previews
- No export functionality

## What I Would Do Next

### Immediate Improvements

- ✅ Add result text snippets (first 35 characters)
- ✅ Implement multi-select chips for restrictions
- Add server-side analytics with database persistence
- Implement advanced query parsing (AND/OR/NOT boolean operators)

### Scaling for Millions of Items

- **Indexing**: Replace Fuse.js with Elasticsearch or Algolia for full-text search
- **Preprocessing**: Move to background jobs with Redis queue
- **Caching**: Implement Redis for result caching
- **Database**: Migrate to PostgreSQL with full-text search capabilities
- **Continuous Ingestion**: Use message queues (RabbitMQ) for real-time updates
- **API**: Add GraphQL for flexible queries

### Testing

- Unit tests for search logic and preprocessing
- Integration tests for API endpoints
- E2E tests with Playwright for UI flows
- Load testing with Artillery for performance validation

## FAQ

**What does "advanced query parsing (boolean operators)" mean?**

Currently, the search uses Fuse.js fuzzy matching which treats all keywords as "AND" by default. Advanced query parsing would enable:
- `michael jackson` - finds results with both (AND)
- `michael OR jackson` - finds results with either word  
- `michael NOT queen` - finds michael but excludes queen
- `"michael jackson"` - finds exact phrase

This requires a custom query parser before passing to Fuse.js.

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js App   │    │   API Route     │    │   Search Lib    │
│                 │    │                 │    │                 │
│ - React UI      │◄──►│ /api/search     │◄──►│ - Fuse.js       │
│ - Client State  │    │ - Query Params  │    │ - Filters       │
│ - Pagination    │    │ - Response JSON │    │ - Sorting       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Data Load     │    │   Preprocessing │    │   Caching       │
│                 │    │                 │    │                 │
│ - JSON File     │───►│ - Date Norm     │───►│ - In-Memory     │
│ - Raw Items     │    │ - Restrictions  │    │ - Filter Opts   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Search Strategy and Relevance

### Relevance Scoring

Results are ranked using a combination of Fuse.js fuzzy matching scores and custom boosts:

1. **Base Score**: Fuse.js calculates similarity based on weighted fields
2. **Boost Adjustments**:
   - Exact prefix matches get higher priority
   - Field-specific matches get score reductions
3. **Final Sort**: Lowest score wins (Fuse.js uses 0-1 scale where 0 is perfect match)

### Preprocessing Strategy

- **Date Normalization**: Parse DD.MM.YYYY to Date objects, convert to ISO strings
- **Restriction Extraction**: Regex-based parsing of delimited tokens in `suchtext`
- **Caching**: Normalized data cached in memory for performance

### Scaling Approach

For millions of items:
- **Indexing**: Elasticsearch with custom analyzers for German text
- **Ingestion**: Kafka streams for continuous updates
- **Query Optimization**: Query planning with result caching
- **Monitoring**: APM tools for performance tracking

## Testing Approach

- **Unit Tests**: Jest for search logic, preprocessing functions
- **Integration Tests**: API endpoint testing with Supertest
- **E2E Tests**: Playwright for complete user flows
- **Performance Tests**: k6 for load testing search queries

## Trade-offs Made

- **Fuse.js vs Elasticsearch**: Chose Fuse.js for simplicity, sacrificing scalability
- **Client-side Analytics**: Easy implementation vs server-side persistence
- **Single-threaded Processing**: Fast for demo, not suitable for production load
- **No Authentication**: Simplified development, not production-ready