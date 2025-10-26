/**
 * @jest-environment node
 */

import { createMocks } from 'node-mocks-http'
import handler, { __testUtils } from '../pages/api/contact-v2'
import type { NextApiRequest, NextApiResponse } from 'next'

// Mock Resend
jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: {
      send: jest.fn()
    }
  }))
}))

// Mock environment variables
const originalEnv = process.env
beforeAll(() => {
  process.env = {
    ...originalEnv,
    RESEND_API_KEY: 're_test_key_123',
    CONTACT_FORM_EMAIL: 'test@example.com',
    VERIFIED_DOMAIN: 'example.com',
    NODE_ENV: 'test'
  }
})

afterAll(() => {
  process.env = originalEnv
})

describe('/api/contact-v2', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    __testUtils.resetRateLimitStore()
  })

  it('should handle successful email submission', async () => {
    const { Resend } = require('resend')
    const mockSend = jest.fn().mockResolvedValue({
      data: { id: 'test-email-id' },
      error: null
    })

    Resend.mockImplementation(() => ({
      emails: { send: mockSend }
    }))

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        email: 'test@example.com',
        message: 'This is a test message that is long enough to pass validation',
        timestamp: Date.now() - 3000 // 3 seconds ago to pass min submission time
      },
      headers: {
        origin: 'http://localhost:3000'
      }
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(200)
    const data = JSON.parse(res._getData())
    expect(data.success).toBe(true)
    expect(data.id).toBe('test-email-id')
    expect(mockSend).toHaveBeenCalledTimes(1)
  })

  it('should validate required fields', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        email: '',
        message: '',
        timestamp: Date.now() - 3000 // 3 seconds ago
      }
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(400)
    const data = JSON.parse(res._getData())
    expect(data.success).toBe(false)
    expect(data.message).toContain('required')
  })

  it('should validate email format', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        email: 'invalid-email',
        message: 'This is a valid test message',
        timestamp: Date.now() - 3000 // 3 seconds ago
      }
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(400)
    const data = JSON.parse(res._getData())
    expect(data.success).toBe(false)
    expect(data.message).toContain('valid email')
  })

  it('should validate message length', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        email: 'test@example.com',
        message: 'short', // Too short
        timestamp: Date.now() - 3000 // 3 seconds ago
      }
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(400)
    const data = JSON.parse(res._getData())
    expect(data.success).toBe(false)
    expect(data.message).toContain('characters')
  })

  it('should handle honeypot spam detection', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        email: 'spammer@example.com',
        message: 'This is spam',
        timestamp: Date.now(),
        honeypot: 'bot-filled-this' // Bot detected
      }
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(200)
    const data = JSON.parse(res._getData())
    expect(data.success).toBe(true) // Fake success to not reveal detection
  })

  it('should handle rate limiting', async () => {
    const requestBody = {
      email: 'test@example.com',
      message: 'This is a test message that is long enough',
      timestamp: Date.now() - 3000 // Start with 3 seconds ago
    }

    const { Resend } = require('resend')
    Resend.mockImplementation(() => ({
      emails: {
        send: jest.fn().mockResolvedValue({
          data: { id: 'test-id' },
          error: null
        })
      }
    }))

    // Send 4 requests (limit is 3)
    for (let i = 0; i < 4; i++) {
      requestBody.timestamp = Date.now() - 3000 // Always 3 seconds ago
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: { ...requestBody },
        connection: { remoteAddress: '127.0.0.1' }
      })

      await handler(req, res)

      if (i < 3) {
        expect(res._getStatusCode()).toBe(200)
      } else {
        expect(res._getStatusCode()).toBe(429)
        const data = JSON.parse(res._getData())
        expect(data.rateLimited).toBe(true)
      }
    }
  })

  it('should handle expired form submissions', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        email: 'test@example.com',
        message: 'This is a test message',
        timestamp: Date.now() - (31 * 60 * 1000) // 31 minutes ago (expired)
      }
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(400)
    const data = JSON.parse(res._getData())
    expect(data.success).toBe(false)
    expect(data.message).toContain('expired')
  })

  it('should handle Resend API errors', async () => {
    const { Resend } = require('resend')
    const mockSend = jest.fn().mockResolvedValue({
      data: null,
      error: { message: 'API Error' }
    })

    Resend.mockImplementation(() => ({
      emails: { send: mockSend }
    }))

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        email: 'test@example.com',
        message: 'This is a test message that is long enough',
        timestamp: Date.now() - 3000 // 3 seconds ago
      }
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(500)
    const data = JSON.parse(res._getData())
    expect(data.success).toBe(false)
  })

  it('should reject non-POST methods', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET'
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(405)
    const data = JSON.parse(res._getData())
    expect(data.success).toBe(false)
    expect(data.message).toContain('Method not allowed')
  })

  it('should handle CORS preflight', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'OPTIONS',
      headers: {
        origin: 'http://localhost:3000'
      }
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(200)
    expect(res._getHeaders()['access-control-allow-origin']).toBe('http://localhost:3000')
  })

  it('should sanitize long messages', async () => {
    const { Resend } = require('resend')
    const mockSend = jest.fn().mockResolvedValue({
      data: { id: 'test-id' },
      error: null
    })

    Resend.mockImplementation(() => ({
      emails: { send: mockSend }
    }))

    const longMessage = 'a'.repeat(6000) // Exceeds max length

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        email: 'test@example.com',
        message: longMessage,
        timestamp: Date.now() - 3000 // 3 seconds ago
      }
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(400)
    const data = JSON.parse(res._getData())
    expect(data.success).toBe(false)
    expect(data.message).toContain('characters')
  })

  it('should reject submissions that are too fast (anti-bot)', async () => {
    const submissionTime = Date.now()
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        email: 'test@example.com',
        message: 'This is a valid test message with enough characters',
        timestamp: submissionTime - 500 // Only 500ms ago (less than 2 seconds)
      }
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(400)
    const data = JSON.parse(res._getData())
    expect(data.success).toBe(false)
    expect(data.message).toContain('take a moment')
  })

  it('should detect spam with too many links', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        email: 'spammer@example.com',
        message: 'Check out these links: http://spam1.com http://spam2.com http://spam3.com',
        timestamp: Date.now() - 5000
      }
    })

    await handler(req, res)

    // Should return fake success to not reveal spam detection
    expect(res._getStatusCode()).toBe(200)
    const data = JSON.parse(res._getData())
    expect(data.success).toBe(true)
  })

  it('should detect spam with suspicious patterns', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        email: 'spammer@example.com',
        message: 'Buy viagra now! Click here for lottery winner prize!',
        timestamp: Date.now() - 5000
      }
    })

    await handler(req, res)

    // Should return fake success to not reveal spam detection
    expect(res._getStatusCode()).toBe(200)
    const data = JSON.parse(res._getData())
    expect(data.success).toBe(true)
  })

  it('should allow legitimate messages with valid links', async () => {
    const { Resend } = require('resend')
    const mockSend = jest.fn().mockResolvedValue({
      data: { id: 'test-id' },
      error: null
    })

    Resend.mockImplementation(() => ({
      emails: { send: mockSend }
    }))

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        email: 'legitimate@example.com',
        message: 'Hi, I would like to discuss a project. You can see my portfolio at https://example.com',
        timestamp: Date.now() - 5000
      }
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(200)
    const data = JSON.parse(res._getData())
    expect(data.success).toBe(true)
    expect(mockSend).toHaveBeenCalledTimes(1)
  })
})
