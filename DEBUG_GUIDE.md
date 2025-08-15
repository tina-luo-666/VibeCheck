# VibeCheck Debug Guide

## Overview

This guide explains the comprehensive logging system added to help debug timeout and performance issues in the VibeCheck application.

## Logging System

### Request Tracking

Each API request now has a unique `requestId` that flows through the entire system, making it easy to trace a specific request across all log messages.

Format: `[abc123] Message here`

### Log Categories

#### 1. Frontend Logging (`[Frontend]`)

- Request initiation and timing
- Response handling
- Error details with network status
- 5-minute timeout with AbortController

#### 2. API Route Logging (`[{requestId}]`)

- Request parsing and validation
- Redis availability and timing
- Rate limiting checks
- Idempotency checks
- Total request duration

#### 3. Orchestrator Logging (`[{requestId}]`)

- Step-by-step generation process
- Individual component timing
- Database operation timing
- Error handling with context

#### 4. OpenAI Logging (`[OpenAI]`)

- API call initiation and completion times
- Response content length
- JSON parsing duration
- Timeout and error handling
- Specific error types (timeout, API errors, content policy)

#### 5. Moderation Logging (`[Moderation]`)

- Blocked term detection
- OpenAI moderation API timing
- Content flagging details
- Error handling

#### 6. Database Logging (`[DB]`)

- Operation timing helper available
- Error context and duration

## Key Metrics Tracked

### Performance Timings

- **Frontend Request**: Total time from user click to response
- **API Processing**: Server-side request handling
- **Orchestrator**: Step-by-step generation process
- **OpenAI Calls**:
  - Store spec generation (GPT-4)
  - Image generation (DALL-E 3)
  - Content moderation
- **Database Operations**: All Supabase interactions
- **Redis Operations**: Cache and rate limiting

### Timeout Configuration

- **Frontend**: 5 minutes (300,000ms)
- **OpenAI Text Generation**: 1 minute (60,000ms)
- **OpenAI Image Generation**: 2 minutes (120,000ms)
- **OpenAI Moderation**: 30 seconds (30,000ms)
- **Database Operations**: 30 seconds (configurable)
- **Redis Operations**: 5 seconds (configurable)

## Using the Debug System

### 1. Monitor Console Logs

Check your browser developer console and server logs for detailed timing information:

```
[Frontend] Starting generation request at 2024-01-15T10:30:00.000Z
[abc123] Starting generation request at 2024-01-15T10:30:00.000Z
[abc123] Request parsed. Prompt: "cottagecore home decor", allowIp: false
[abc123] Starting generation for prompt: "cottagecore home decor"
[abc123] Step 1: Starting content moderation...
[Moderation] Starting moderation for prompt: "cottagecore home decor", allowIp: false
[Moderation] OpenAI moderation completed in 450ms
[abc123] Content moderation completed in 455ms, allowed: true
[abc123] Step 2: Starting store spec generation...
[OpenAI] Starting store spec generation for prompt: "cottagecore home decor"
[OpenAI] GPT-4 API call completed in 12500ms
[OpenAI] Store spec generation total time: 12650ms
...
```

### 2. Identify Bottlenecks

Look for the longest timing values in your logs:

- **Image generation** typically takes 30-60 seconds per image
- **Store spec generation** usually takes 5-15 seconds
- **Database operations** should be under 1 second
- **Moderation** should be under 1 second

### 3. Common Timeout Scenarios

#### Scenario 1: OpenAI API Timeout

```
[OpenAI] Store spec generation error after 60000ms: timeout
[OpenAI] Request timed out after 60000ms
```

**Solution**: Check OpenAI API status, verify API keys

#### Scenario 2: Image Generation Timeout

```
[OpenAI] Image generation error after 120000ms: timeout
[OpenAI] Image generation timed out after 120000ms
```

**Solution**: Simplify image prompts, check DALL-E service status

#### Scenario 3: Database Connection Issues

```
[DB] store creation failed after 30000ms: connection timeout
```

**Solution**: Check Supabase connection, verify environment variables

#### Scenario 4: Frontend Timeout

```
[Frontend] Request timeout after 5 minutes
[Frontend] Request timed out. The generation is taking longer than expected.
```

**Solution**: Check server logs for the specific bottleneck

### 4. Performance Optimization

Based on the logs, you can identify which steps are taking the longest:

1. **Store Spec Generation**: 5-15 seconds (normal)
2. **Hero Image Generation**: 30-60 seconds (normal)
3. **Product Images**: 30-60 seconds each (3-5 products = 2-5 minutes total)
4. **Database Operations**: <1 second each (should be fast)

### 5. Error Investigation

When a request fails, look for:

1. The `requestId` in the error message
2. The total time when the error occurred
3. Which specific step failed
4. Any underlying error details

## Configuration

### Adjusting Timeouts

Edit `/lib/config.ts` to modify timeout values:

```typescript
export const config = {
  api: {
    openai: {
      textGeneration: 60 * 1000, // Increase if needed
      imageGeneration: 2 * 60 * 1000, // Increase if needed
    },
  },
};
```

### Environment Variables

Make sure these are properly set:

- `OPENAI_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `UPSTASH_REDIS_REST_URL` (optional)
- `UPSTASH_REDIS_REST_TOKEN` (optional)

## Troubleshooting Tips

1. **Check Network Connection**: Ensure stable internet for OpenAI API calls
2. **Verify API Keys**: Make sure all environment variables are correct
3. **Monitor API Usage**: Check OpenAI dashboard for rate limits or quota issues
4. **Database Health**: Verify Supabase project status
5. **Server Resources**: Ensure adequate memory and CPU for long-running operations

## Log Analysis Commands

To analyze logs from the server:

```bash
# Filter logs by request ID
grep "abc123" server.log

# Find timeout errors
grep -i "timeout" server.log

# Find the slowest operations
grep -E "completed in [0-9]{4,}ms" server.log | sort -n

# Count errors by type
grep -E "\[OpenAI\].*error" server.log | wc -l
```

This comprehensive logging system will help you identify exactly where timeouts are occurring and optimize the application's performance accordingly.
