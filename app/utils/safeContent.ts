import { queryCollection } from '@nuxt/content'

/**
 * Safe Content Query Utility
 * 
 * Prevents undefined collection queries that crash builds.
 * This whitelist prevents accidental queries to non-existent collections
 * during prerender, which is especially critical for nuxt-feedme and
 * dynamic route handling.
 */
const ALLOWED_COLLECTIONS = [
  'companies',
  'guides',
  'methodology',
  'networks',
  'pages',
  'landing'
] as const

type CollectionName = typeof ALLOWED_COLLECTIONS[number]

/**
 * Safe Content Query Utility
 * 
 * Prevents undefined collection queries that crash builds.
 * Use this everywhere you dynamically access collections.
 */
export function safeQueryCollection(name: unknown) {
  if (typeof name !== 'string') return null
  if (!ALLOWED_COLLECTIONS.includes(name as CollectionName)) return null
  return queryCollection(name as CollectionName)
}

/**
 * Validates a collection name and throws if invalid
 */
export function validateCollectionName(name: unknown): asserts name is CollectionName {
  if (typeof name !== 'string' || !ALLOWED_COLLECTIONS.includes(name as CollectionName)) {
    throw createError({ 
      statusCode: 404, 
      statusMessage: `Invalid collection: ${name}`,
      fatal: true
    })
  }
}

