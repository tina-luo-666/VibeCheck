export const config = {
  // API timeouts and limits
  api: {
    // Maximum execution time for generation requests (5 minutes)
    maxExecutionTime: 5 * 60 * 1000,

    // OpenAI timeouts
    openai: {
      textGeneration: 60 * 1000, // 1 minute for text generation
      imageGeneration: 2 * 60 * 1000, // 2 minutes for image generation
      moderation: 30 * 1000, // 30 seconds for moderation
    },

    // Database timeouts
    database: {
      defaultTimeout: 30 * 1000, // 30 seconds for most operations
    },

    // Redis timeouts
    redis: {
      defaultTimeout: 5 * 1000, // 5 seconds for Redis operations
    },
  },

  // Development/debugging flags
  debug: {
    logTimings: true,
    logRequestDetails: true,
    logOpenAIResponses: process.env.NODE_ENV === "development",
  },
};
