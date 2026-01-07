/**
 * API Endpoint: Process Reddit JSON through extraction pipeline
 * 
 * POST /api/extraction/process
 * 
 * Body: { threads: RedditThread[] }
 * 
 * Returns: PipelineResult
 */

import { runExtractionPipeline, defaultConfig } from '../../extraction/pipeline'
import type { RedditThread } from '../../extraction/types'

export default defineEventHandler(async (event) => {
  if (event.method !== 'POST') {
    throw createError({
      statusCode: 405,
      message: 'Method not allowed'
    })
  }

  const body = await readBody(event)

  if (!body.threads || !Array.isArray(body.threads)) {
    throw createError({
      statusCode: 400,
      message: 'Request body must include "threads" array'
    })
  }

  const threads: RedditThread[] = body.threads
  const config = body.config || defaultConfig

  try {
    const result = await runExtractionPipeline(threads, config)

    return {
      success: true,
      result
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: `Pipeline execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    })
  }
})

