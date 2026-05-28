# AI Service

**Port**: 8000  
**Language**: Python 3.10+  
**Framework**: FastAPI  
**Architecture**: Clean Architecture (Domain → Application → Infrastructure)

AI-powered microservice for DailyFlow providing receipt OCR, spending insights, anomaly detection, and voice transcription.

## Features

### 1. Receipt OCR (`POST /api/ai/receipt/process`)
Extract structured expense data from receipt images using GPT-4 Vision API.

**Request**:
```json
{
  "image_data": "base64_encoded_image",
  "merchant_hint": "Starbucks",
  "amount_hint": 5.50
}
```

**Response**:
```json
{
  "merchant_name": "Starbucks",
  "amount": 5.50,
  "currency": "USD",
  "category": "RESTAURANT",
  "tax_amount": 0.45,
  "items": ["Espresso", "Milk"],
  "confidence_score": 0.92
}
```

**Use Case**: Users upload receipt photos → AI extracts expense details → Automatically logs expense.

---

### 2. Spending Insights (`POST /api/ai/insights/generate`)
Generate actionable insights on habit streaks and spending patterns.

**Request**:
```json
{
  "user_id": "user_123",
  "insight_type": "habit_streak",
  "days_lookback": 7
}
```

**Response**:
```json
{
  "type": "HABIT_STREAK",
  "title": "🔥 Exercise is on fire!",
  "description": "You've completed Exercise 95% of the time.",
  "confidence": 0.95,
  "actionable_items": ["Keep up the momentum!", "Consider increasing difficulty"]
}
```

**Insight Types**:
- `habit_streak`: Progress on specific habit
- `spending_trend`: Category spending changes
- `budget_alert`: Budget threshold violations
- `category_insight`: Category-specific analysis
- `goal_progress`: Progress towards goals

---

### 3. Anomaly Detection (`POST /api/ai/anomalies/detect`)
Identify unusual spending patterns using statistical analysis.

**Request**:
```json
{
  "user_id": "user_123",
  "category": "Groceries",
  "current_amount": 500.0,
  "lookback_days": 30
}
```

**Response**:
```json
{
  "category": "Groceries",
  "is_anomalous": true,
  "anomalies": [
    {
      "description": "Unusual Groceries spending detected",
      "severity": "HIGH",
      "expected_value": 100.0,
      "actual_value": 500.0,
      "deviation_pct": 400.0
    }
  ],
  "message": "Anomaly detected"
}
```

**Severity Levels**:
- `LOW`: 1.5x normal spending
- `MEDIUM`: 1.5-2x normal
- `HIGH`: >2x normal
- `CRITICAL`: >3x normal or unusual frequency

---

### 4. Voice Transcription (`POST /api/ai/voice/transcribe`)
Convert voice recordings to text and extract expense information.

**Request**:
```json
{
  "audio_data": "base64_encoded_audio",
  "format": "mp3",
  "language": "en"
}
```

**Response**:
```json
{
  "text": "I spent $50 at Starbucks for coffee",
  "duration_seconds": 3.5,
  "confidence": 0.95,
  "extracted_data": {
    "amount": 50.0,
    "merchant": "Starbucks",
    "category_hints": ["RESTAURANT"],
    "word_count": 9
  }
}
```

**Supported Formats**: `mp3`, `wav`, `m4a`, `ogg`, `flac`  
**Max Duration**: 1 hour  
**Max File Size**: 25MB

---

## Architecture

### Domain Layer
Zero external dependencies. Pure business logic for:
- **ReceiptProcessor**: Receipt validation, categorization, OCR logic
- **InsightsEngine**: Habit & spending analysis, trend calculation
- **AnomalyDetector**: Statistical anomaly detection (z-score based)
- **VoiceProcessor**: Audio validation, text extraction

### Application Layer
- **ProcessReceiptUseCase**: Orchestrate receipt → expense extraction
- **GenerateInsightsUseCase**: Generate insights from data
- **DetectAnomaliesUseCase**: Detect unusual patterns
- **TranscribeVoiceUseCase**: Transcribe and extract data
- **DTOs**: Type-safe request/response models using Pydantic

### Infrastructure Layer
- **FastAPI Routes**: HTTP endpoints for all use cases
- **OpenAIClient**: GPT-4, Vision API, Whisper integration with retry logic
- **EventConsumer**: Redis listener for async events from Node services
- **Config**: Environment-based configuration

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Root health check |
| `GET` | `/api/ai/health` | AI service health check |
| `POST` | `/api/ai/receipt/process` | Process receipt image |
| `POST` | `/api/ai/insights/generate` | Generate insights |
| `POST` | `/api/ai/anomalies/detect` | Detect anomalies |
| `POST` | `/api/ai/voice/transcribe` | Transcribe audio |

---

## Event Integration

### Consuming Events
Listen to Node.js services via Redis + BullMQ:

- **`expense:created`** → Trigger anomaly detection, category correction
- **`habit:logged`** → Generate streak insights
- **`habit:milestone:reached`** → Generate milestone insights

### Publishing Events
Publish results back to event bus:

- **`expense:categorized`** → Updated category from OCR
- **`anomaly:detected`** → Alert on unusual spending
- **`insight:generated`** → New insight available

---

## Configuration

### Environment Variables

```bash
# Service
PORT=8000
LOG_LEVEL=INFO
ENVIRONMENT=development

# OpenAI
OPENAI_API_KEY=sk-your-key
OPENAI_MODEL=gpt-4o-mini
OPENAI_VISION_MODEL=gpt-4-vision-preview
OPENAI_WHISPER_MODEL=whisper-1

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_URL=redis://localhost:6379/0

# Service Discovery
AUTH_SERVICE_URL=http://localhost:3001
HABIT_SERVICE_URL=http://localhost:3002
EXPENSE_SERVICE_URL=http://localhost:3003
ANALYTICS_SERVICE_URL=http://localhost:3004

# AI Settings
RECEIPT_OCR_CONFIDENCE_THRESHOLD=0.7
ANOMALY_DETECTION_STD_DEVS=2.5
INSIGHTS_GENERATION_DAYS=7
```

### Setup

1. **Install Poetry**:
   ```bash
   curl -sSL https://install.python-poetry.org | python3 -
   ```

2. **Install dependencies**:
   ```bash
   cd apps/ai-service
   poetry install
   ```

3. **Configure environment**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your OpenAI API key
   ```

4. **Run service**:
   ```bash
   poetry run python -m uvicorn src.main:app --reload --port 8000
   ```

---

## Testing

### Run all tests
```bash
poetry run pytest
```

### Run specific test
```bash
poetry run pytest tests/unit/test_domain.py::TestReceiptProcessor::test_validate_extracted_expense_valid -v
```

### Run with coverage
```bash
poetry run pytest --cov=src --cov-report=html
```

### Test coverage targets
- **Overall**: 80%
- **Domain layer**: 90%
- **Infrastructure**: 70%

### Test structure
- `tests/unit/test_domain.py` - Domain logic tests (Receipt, Insights, Anomaly, Voice)
- `tests/integration/test_routes.py` - API endpoint tests
- `tests/conftest.py` - Pytest fixtures

---

## Deployment

### Docker
```dockerfile
FROM python:3.10-slim
WORKDIR /app
COPY pyproject.toml poetry.lock ./
RUN pip install poetry && poetry install --no-dev
COPY src ./src
CMD ["poetry", "run", "uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Local Development
```bash
docker-compose up -d  # Start PostgreSQL, Redis
poetry run uvicorn src.main:app --reload
```

### Production
```bash
# Set environment variables
export ENVIRONMENT=production
export OPENAI_API_KEY=sk-prod-key
# Deploy container
```

---

## External API Costs

### OpenAI Pricing (as of 2024)
- **GPT-4 Vision**: $0.01-$0.025 per image
- **GPT-4o-mini**: $0.15/$0.60 per 1M tokens
- **Whisper**: $0.30 per minute of audio

### Optimization
- Cache vision API results for identical receipts
- Batch insights generation (daily cron)
- Rate limit voice transcription (prevent abuse)

---

## Error Handling

### Standard Error Responses

**400 Bad Request** - Invalid input
```json
{
  "detail": "Invalid base64 image data"
}
```

**422 Unprocessable Entity** - Validation error
```json
{
  "detail": [{"loc": ["body", "amount"], "msg": "Amount must be > 0"}]
}
```

**500 Internal Server Error** - OpenAI API failure
```json
{
  "detail": "Receipt processing failed: OpenAI API timeout"
}
```

### Retry Logic
- Failed API calls retry 3 times with exponential backoff
- Circuit breaker for external services (fail fast after threshold)

---

## Performance Considerations

### Latency
- Receipt OCR: 2-4 seconds (Vision API)
- Insights generation: 1-2 seconds
- Anomaly detection: <500ms (local)
- Voice transcription: 2-5 seconds

### Scaling
- Stateless service → horizontal scaling
- Rate limiting: 100 req/min per user
- Concurrent OpenAI calls: batched via queue

---

## Troubleshooting

### OpenAI API Key Error
```
Error: Invalid API key provided
```
**Solution**: Check `OPENAI_API_KEY` environment variable is set and valid.

### Confidence Score Too Low
```
Confidence score 0.45 below threshold 0.7
```
**Solution**: Receipt image quality too low. Try:
- Better lighting
- Straight angle
- Full receipt visible

### Redis Connection Error
```
ConnectionError: Cannot connect to Redis
```
**Solution**: Ensure Redis running: `docker-compose up -d redis`

---

## Development

### Code Quality
- **Linter**: Ruff (Python linter)
- **Formatter**: Black (code formatting)
- **Type checking**: mypy (static type analysis)

### Commands
```bash
poetry run black src tests          # Format code
poetry run ruff check src tests     # Lint
poetry run mypy src                # Type check
poetry run pytest --cov             # Test with coverage
```

---

## Next Steps

1. **Event Consumption**: Implement Redis event listener in EventConsumer
2. **Database Integration**: Add PostgreSQL for caching results
3. **Authentication**: Add JWT validation for API requests
4. **Rate Limiting**: Implement per-user rate limits
5. **Monitoring**: Add OpenTelemetry for observability

---

## References

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

---

**Version**: 0.1.0  
**Last Updated**: Phase 5  
**Status**: Active Development
