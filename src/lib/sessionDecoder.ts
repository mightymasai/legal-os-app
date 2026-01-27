/**
 * Session Data Decoder Utility
 * Decodes and parses session data tokens for the Legal OS application
 */

export interface DecodedSessionData {
  sessionId: string
  signature: string
  rawParts: {
    part1: string
    part2: string
  }
  decodedParts: {
    part1: Buffer | null
    part2: Buffer | null
  }
  metadata: {
    decodedAt: string
    isValid: boolean
    format: 'standard' | 'legacy' | 'unknown'
  }
}

export interface SessionValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Decodes a session data string into its component parts
 * Session format: <sessionId>#<signature>
 */
export function decodeSessionData(encodedData: string): DecodedSessionData {
  if (!encodedData || typeof encodedData !== 'string') {
    throw new SessionDecoderError('Invalid input: encodedData must be a non-empty string')
  }

  const parts = encodedData.split('#')

  if (parts.length !== 2) {
    throw new SessionDecoderError(
      `Invalid session format: expected 2 parts separated by '#', got ${parts.length}`
    )
  }

  const [sessionId, signature] = parts

  // Attempt to decode base64 parts
  let decodedPart1: Buffer | null = null
  let decodedPart2: Buffer | null = null

  try {
    decodedPart1 = Buffer.from(sessionId, 'base64')
  } catch {
    decodedPart1 = null
  }

  try {
    decodedPart2 = Buffer.from(signature, 'base64')
  } catch {
    decodedPart2 = null
  }

  // Determine format based on structure
  const format = determineSessionFormat(sessionId, signature)

  return {
    sessionId,
    signature,
    rawParts: {
      part1: sessionId,
      part2: signature,
    },
    decodedParts: {
      part1: decodedPart1,
      part2: decodedPart2,
    },
    metadata: {
      decodedAt: new Date().toISOString(),
      isValid: decodedPart1 !== null && decodedPart2 !== null,
      format,
    },
  }
}

/**
 * Validates session data structure and integrity
 */
export function validateSessionData(encodedData: string): SessionValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  if (!encodedData) {
    errors.push('Session data is empty')
    return { isValid: false, errors, warnings }
  }

  if (typeof encodedData !== 'string') {
    errors.push('Session data must be a string')
    return { isValid: false, errors, warnings }
  }

  // Check for separator
  if (!encodedData.includes('#')) {
    errors.push('Session data missing separator (#)')
    return { isValid: false, errors, warnings }
  }

  const parts = encodedData.split('#')

  if (parts.length !== 2) {
    errors.push(`Invalid number of parts: expected 2, got ${parts.length}`)
    return { isValid: false, errors, warnings }
  }

  const [sessionId, signature] = parts

  // Validate session ID
  if (!sessionId || sessionId.length === 0) {
    errors.push('Session ID is empty')
  } else if (sessionId.length < 10) {
    warnings.push('Session ID seems unusually short')
  }

  // Validate signature
  if (!signature || signature.length === 0) {
    errors.push('Signature is empty')
  } else if (signature.length < 10) {
    warnings.push('Signature seems unusually short')
  }

  // Check if parts are valid base64
  if (!isValidBase64(sessionId)) {
    warnings.push('Session ID may not be valid base64')
  }

  if (!isValidBase64(signature)) {
    warnings.push('Signature may not be valid base64')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Extracts session metadata from decoded data
 */
export function extractSessionMetadata(decodedData: DecodedSessionData): Record<string, unknown> {
  const metadata: Record<string, unknown> = {
    sessionIdLength: decodedData.sessionId.length,
    signatureLength: decodedData.signature.length,
    format: decodedData.metadata.format,
    decodedAt: decodedData.metadata.decodedAt,
  }

  // Add decoded byte lengths if available
  if (decodedData.decodedParts.part1) {
    metadata.sessionIdByteLength = decodedData.decodedParts.part1.length
  }

  if (decodedData.decodedParts.part2) {
    metadata.signatureByteLength = decodedData.decodedParts.part2.length
  }

  return metadata
}

/**
 * Converts decoded session data to a safe, loggable format
 * (masks sensitive portions)
 */
export function toSafeLogFormat(decodedData: DecodedSessionData): Record<string, unknown> {
  const maskString = (str: string, visibleChars: number = 4): string => {
    if (str.length <= visibleChars * 2) {
      return '*'.repeat(str.length)
    }
    return `${str.slice(0, visibleChars)}...${'*'.repeat(8)}...${str.slice(-visibleChars)}`
  }

  return {
    sessionId: maskString(decodedData.sessionId),
    signature: maskString(decodedData.signature),
    metadata: decodedData.metadata,
  }
}

/**
 * Determines the session format based on structure
 */
function determineSessionFormat(
  sessionId: string,
  signature: string
): 'standard' | 'legacy' | 'unknown' {
  // Standard format: both parts are valid base64 with expected lengths
  const standardSessionIdLength = 48
  const standardSignatureLength = 86

  if (
    sessionId.length === standardSessionIdLength &&
    signature.length === standardSignatureLength &&
    isValidBase64(sessionId) &&
    isValidBase64(signature)
  ) {
    return 'standard'
  }

  // Legacy format: shorter session IDs
  if (sessionId.length < standardSessionIdLength && isValidBase64(sessionId)) {
    return 'legacy'
  }

  return 'unknown'
}

/**
 * Checks if a string is valid base64
 */
function isValidBase64(str: string): boolean {
  if (!str || str.length === 0) {
    return false
  }

  // Base64 regex pattern (standard and URL-safe)
  const base64Regex = /^[A-Za-z0-9+/=_-]*$/

  if (!base64Regex.test(str)) {
    return false
  }

  try {
    const decoded = Buffer.from(str, 'base64')
    const reencoded = decoded.toString('base64')
    // Account for URL-safe base64 variants
    const normalizedOriginal = str.replace(/-/g, '+').replace(/_/g, '/')
    const normalizedReencoded = reencoded.replace(/-/g, '+').replace(/_/g, '/')
    return normalizedOriginal === normalizedReencoded || decoded.length > 0
  } catch {
    return false
  }
}

/**
 * Custom error class for session decoder errors
 */
export class SessionDecoderError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'SessionDecoderError'
  }
}

/**
 * Parses session data and returns a summary object
 */
export function parseSessionSummary(encodedData: string): {
  success: boolean
  data?: DecodedSessionData
  validation: SessionValidationResult
  error?: string
} {
  const validation = validateSessionData(encodedData)

  if (!validation.isValid) {
    return {
      success: false,
      validation,
      error: validation.errors.join('; '),
    }
  }

  try {
    const data = decodeSessionData(encodedData)
    return {
      success: true,
      data,
      validation,
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    return {
      success: false,
      validation,
      error: errorMessage,
    }
  }
}
