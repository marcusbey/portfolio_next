import type { NextApiRequest, NextApiResponse } from 'next'
import { Resend } from 'resend'
import { EmailTemplate } from '@/components/email-template'

interface ContactRequest {
  email: string
  message: string
  honeypot?: string // Anti-spam field
  timestamp?: number
}

interface ContactResponse {
  success: boolean
  message: string
  id?: string
  error?: string
  rateLimited?: boolean
}

// Rate limiting store (in production, use Redis or database)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Configuration
const config = {
  resendKey: process.env.RESEND_API_KEY,
  contactEmail: process.env.CONTACT_FORM_EMAIL || 'hi@romainboboe.com',
  verifiedDomain: process.env.VERIFIED_DOMAIN || 'romainboboe.com',
  isDevelopment: process.env.NODE_ENV === 'development',
  rateLimitWindow: 15 * 60 * 1000, // 15 minutes
  rateLimitMaxRequests: 3, // max 3 emails per 15 minutes per IP
  minMessageLength: 10,
  maxMessageLength: 5000,
  allowedOrigins: [
    'http://localhost:3000',
    'https://www.romainboboe.com',
    'https://romainboboe.com'
  ],
  adminSecret: process.env.ADMIN_SECRET
}

// Validation helpers
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254
}

const validateMessage = (message: string): boolean => {
  return message.trim().length >= config.minMessageLength && 
         message.length <= config.maxMessageLength
}

const sanitizeInput = (input: string): string => {
  return input.trim().slice(0, config.maxMessageLength)
}

// Rate limiting
const checkRateLimit = (ip: string): { allowed: boolean; resetTime?: number } => {
  const now = Date.now()
  const key = ip
  const limit = rateLimitStore.get(key)

  if (!limit || now > limit.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + config.rateLimitWindow })
    return { allowed: true }
  }

  if (limit.count >= config.rateLimitMaxRequests) {
    return { allowed: false, resetTime: limit.resetTime }
  }

  limit.count++
  return { allowed: true }
}

// Get client IP
const getClientIP = (req: NextApiRequest): string => {
  const forwarded = req.headers['x-forwarded-for']
  const ip = forwarded ? (Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0]) : req.socket.remoteAddress
  return ip || 'unknown'
}

// CORS headers
const setCORSHeaders = (res: NextApiResponse, origin?: string) => {
  if (origin && config.allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With')
  res.setHeader('Access-Control-Max-Age', '86400') // 24 hours
}

// Initialize Resend
const createResendClient = () => {
  if (!config.resendKey?.startsWith('re_')) {
    throw new Error('Invalid or missing RESEND_API_KEY')
  }
  return new Resend(config.resendKey)
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ContactResponse>
) {
  const origin = req.headers.origin
  setCORSHeaders(res, origin)

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
      error: 'Only POST requests are allowed'
    })
  }

  const startTime = Date.now()
  const clientIP = getClientIP(req)

  try {
    // Rate limiting check
    const rateLimit = checkRateLimit(clientIP)
    if (!rateLimit.allowed) {
      const resetDate = new Date(rateLimit.resetTime || 0)
      return res.status(429).json({
        success: false,
        message: `Too many requests. Try again after ${resetDate.toLocaleTimeString()}`,
        error: 'Rate limit exceeded',
        rateLimited: true
      })
    }

    // Parse and validate request body
    const { email, message, honeypot, timestamp } = req.body as ContactRequest

    // Honeypot check (anti-spam)
    if (honeypot && honeypot.trim() !== '') {
      console.log(`🍯 Honeypot triggered from IP: ${clientIP}`)
      return res.status(200).json({
        success: true,
        message: 'Message sent successfully' // Fake success to not reveal spam detection
      })
    }

    // Timestamp check (prevent replay attacks)
    if (timestamp) {
      const submissionAge = Date.now() - timestamp
      if (submissionAge > 30 * 60 * 1000) { // 30 minutes
        return res.status(400).json({
          success: false,
          message: 'Form submission expired. Please refresh and try again.',
          error: 'Submission expired'
        })
      }
    }

    // Validate required fields
    if (!email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Email and message are required',
        error: 'Missing required fields'
      })
    }

    // Validate email format
    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address',
        error: 'Invalid email format'
      })
    }

    // Validate message length
    if (!validateMessage(message)) {
      return res.status(400).json({
        success: false,
        message: `Message must be between ${config.minMessageLength} and ${config.maxMessageLength} characters`,
        error: 'Invalid message length'
      })
    }

    // Sanitize inputs
    const sanitizedEmail = sanitizeInput(email)
    const sanitizedMessage = sanitizeInput(message)

    // Initialize Resend client
    let resend: Resend
    try {
      resend = createResendClient()
    } catch (error) {
      console.error('❌ Failed to initialize Resend client:', error)
      return res.status(500).json({
        success: false,
        message: 'Email service temporarily unavailable. Please try again later.',
        error: 'Service unavailable'
      })
    }

    // Prepare email
    const emailConfig = {
      from: `contact@${config.verifiedDomain}`,
      to: config.contactEmail,
      replyTo: sanitizedEmail,
      subject: `${config.isDevelopment ? '[TEST] ' : ''}📨 New Contact Form Message`,
      react: EmailTemplate({ 
        senderEmail: sanitizedEmail, 
        message: sanitizedMessage 
      })
    }

    console.log(`📧 Sending email from ${sanitizedEmail} to ${config.contactEmail}`)

    // Send email with timeout
    const emailPromise = resend.emails.send(emailConfig)
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Email sending timeout')), 10000)
    )

    const result = await Promise.race([emailPromise, timeoutPromise]) as any

    if (result.error) {
      console.error('❌ Resend API Error:', result.error)
      
      // Handle specific Resend errors
      if (result.error.message?.includes('rate limit')) {
        return res.status(429).json({
          success: false,
          message: 'Too many emails sent. Please wait before sending another message.',
          error: 'Rate limited by email service'
        })
      }
      
      throw new Error(result.error.message || 'Failed to send email')
    }

    const processingTime = Date.now() - startTime
    console.log(`✅ Email sent successfully in ${processingTime}ms:`, result.data?.id)

    // Log successful submission (for analytics/monitoring)
    console.log(`📊 Contact form submission: IP=${clientIP}, Email=${sanitizedEmail.substring(0, 3)}***, ProcessingTime=${processingTime}ms`)

    return res.status(200).json({
      success: true,
      message: "Thank you for your message! I'll get back to you soon.",
      id: result.data?.id
    })

  } catch (error) {
    const processingTime = Date.now() - startTime
    console.error(`❌ Contact form error (${processingTime}ms):`, {
      error: error instanceof Error ? error.message : 'Unknown error',
      ip: clientIP,
      stack: error instanceof Error ? error.stack : undefined
    })

    // Don't expose internal errors to client
    return res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again or contact me directly at hi@romainboboe.com',
      error: 'Internal server error'
    })
  }
}

// Health check endpoint for monitoring
export const healthCheck = async (): Promise<{ status: string; timestamp: number }> => {
  return {
    status: 'healthy',
    timestamp: Date.now()
  }
}