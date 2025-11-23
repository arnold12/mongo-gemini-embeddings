# MongoDB Gemini Embeddings API

A RESTful API built with Express.js for creating embeddings using Google Gemini and performing similarity search with MongoDB Atlas Vector Search.

## Features

- 🚀 Create embeddings for documents and store them in MongoDB Atlas
- 🔍 Perform similarity search using cosine similarity
- 📊 Filter results by similarity score threshold
- 🎯 Metadata filtering support
- 🔌 MongoDB connection management using Mongoose
- 📁 Clean MVC architecture (Routes, Controllers, Services, Models)
- 📝 JSON structured logging with Winston
- ✅ Input validation with Joi
- 🔒 Request ID tracking for better debugging

## Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account with Vector Search enabled
- Google API Key for Gemini embeddings

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```env
MONGODB_ATLAS_URI=your_mongodb_atlas_connection_string
GOOGLE_API_KEY=your_google_api_key
PORT=3000
LOG_LEVEL=info
NODE_ENV=development
```

## Running the Server

```bash
# Start the server
npm start

# Start with auto-reload (development)
npm run dev
```

The server will start on `http://localhost:3000` (or the PORT specified in .env)

## API Endpoints

### 1. Health Check

**GET** `/health`

Check if the server is running.

**Response:**
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

---

### 2. Create Embeddings

**POST** `/api/embeddings`

Create embeddings for documents and store them in MongoDB Atlas.

**Request Body:**
```json
{
  "documents": [
    {
      "content": "React.js is a popular library for building user interfaces.",
      "metadata": {
        "category": "tech",
        "topic": "frontend"
      }
    },
    {
      "content": "The weather is lovely in Paris today.",
      "metadata": {
        "category": "weather",
        "location": "Paris"
      }
    }
  ]
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "message": "Embeddings created and stored successfully",
  "documentsProcessed": 2
}
```

**Response (Error - 400):**
```json
{
  "error": "Invalid request",
  "message": "documents must be a non-empty array"
}
```

---

### 3. Search Similarity

**POST** `/api/search`

Perform similarity search using cosine similarity.

**Request Body:**
```json
{
  "query": "Tell me about React.js",
  "k": 5,
  "minScore": 0.5,
  "filter": {
    "category": "tech"
  }
}
```

**Parameters:**
- `query` (required): The search query string
- `k` (optional): Number of results to return (default: 2)
- `minScore` (optional): Minimum similarity score threshold 0-1 (default: 0.5)
- `filter` (optional): Metadata filter object (e.g., `{ "category": "tech" }`)

**Response (Success - 200):**
```json
{
  "success": true,
  "query": "Tell me about React.js",
  "parameters": {
    "k": 5,
    "minScore": 0.5,
    "filter": {
      "category": "tech"
    }
  },
  "resultsCount": 2,
  "results": [
    {
      "content": "React.js is a popular library for building user interfaces.",
      "metadata": {
        "category": "tech",
        "topic": "frontend"
      },
      "similarityScore": 0.9234,
      "rawScore": 0.9234
    },
    {
      "content": "Vue.js is another popular frontend framework.",
      "metadata": {
        "category": "tech",
        "topic": "frontend"
      },
      "similarityScore": 0.7845,
      "rawScore": 0.7845
    }
  ]
}
```

**Response (Error - 400):**
```json
{
  "error": "Invalid request",
  "message": "query is required and must be a string"
}
```

---

## Example Usage

### Using cURL

**Create Embeddings:**
```bash
curl -X POST http://localhost:3000/api/embeddings \
  -H "Content-Type: application/json" \
  -d '{
    "documents": [
      {
        "content": "Machine learning is a subset of artificial intelligence.",
        "metadata": {"category": "tech", "topic": "AI"}
      }
    ]
  }'
```

**Search Similarity:**
```bash
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "artificial intelligence",
    "k": 3,
    "minScore": 0.6
  }'
```

### Using JavaScript (Fetch)

```javascript
// Create embeddings
const response = await fetch('http://localhost:3000/api/embeddings', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    documents: [
      {
        content: 'Your text content here',
        metadata: { category: 'tech' }
      }
    ]
  })
});

const data = await response.json();
console.log(data);

// Search similarity
const searchResponse = await fetch('http://localhost:3000/api/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: 'Your search query',
    k: 5,
    minScore: 0.5
  })
});

const searchData = await searchResponse.json();
console.log(searchData);
```

## Project Structure

```
mongo-gemini-embeddings/
├── server.js                    # Express server entry point
├── config/
│   └── database.js              # MongoDB connection using Mongoose
├── models/
│   └── Document.js              # Mongoose schema for documents
├── services/
│   ├── embeddingsService.js     # Business logic for creating embeddings
│   └── searchService.js         # Business logic for similarity search
├── controllers/
│   ├── embeddingsController.js  # Request handlers for embeddings
│   └── searchController.js      # Request handlers for search
├── routes/
│   ├── embeddings.js            # Embeddings API routes
│   └── search.js                # Search API routes
├── middleware/
│   └── requestLogger.js         # Request logging middleware
├── utils/
│   ├── logger.js                # Winston logger configuration
│   └── validation.js            # Joi validation schemas
├── logs/                        # Log files directory
├── package.json
├── README.md
└── .env                         # Environment variables
```

## Logging

The application uses Winston for structured JSON logging. All logs are written in JSON format to:
- Console (stdout)
- `logs/combined.log` (all logs)
- `logs/error.log` (errors only)
- `logs/exceptions.log` (uncaught exceptions)
- `logs/rejections.log` (unhandled promise rejections)

### Log Format

All logs are in JSON format with the following structure:
```json
{
  "level": "info",
  "message": "Server started successfully",
  "service": "mongo-gemini-embeddings",
  "environment": "development",
  "timestamp": "2024-01-15 10:30:45.123",
  "port": 3000,
  "requestId": "req-1234567890-abc123"
}
```

### Log Levels

- `error`: Error events
- `warn`: Warning events
- `info`: Informational messages
- `debug`: Debug messages

Set log level via `LOG_LEVEL` environment variable (default: `info`).

## Input Validation

The API uses Joi for input validation. All requests are automatically validated before reaching the controllers.

### Validation Features

- Automatic request body validation
- Detailed error messages for invalid inputs
- Type checking and sanitization
- Default values for optional fields
- Custom error messages

### Example Validation Error Response

```json
{
  "error": "Validation failed",
  "message": "Invalid request data",
  "details": [
    {
      "field": "query",
      "message": "Query is required"
    }
  ]
}
```

## MongoDB Atlas Setup

1. Run the setup script to create the Vector Search index:
   ```bash
   npm run setup-index
   ```
   This will create the `vector_index` with the required configuration (including filterable fields).

2. Ensure your collection is named `vector_demo` in database `project001` (or update in `dbConnection.js`)

## Notes

- The API uses Google's `text-embedding-004` model (768 dimensions)
- Similarity scores range from 0 to 1 (higher = more similar)
- MongoDB Atlas Vector Search uses cosine similarity by default
- Connections are automatically managed and reused when possible

## License

ISC

