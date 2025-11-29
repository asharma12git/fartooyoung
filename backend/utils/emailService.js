const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses')
const crypto = require('crypto')

// Initialize SES client
const sesClient = new SESClient({ 
  region: process.env.SES_REGION || 'us-east-1' 
})

/**
 * Send email using AWS SES
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} html - HTML email content
 */
const sendEmail = async (to, subject, html) => {
  const command = new SendEmailCommand({
    Source: process.env.SES_FROM_EMAIL,
    Destination: {
      ToAddresses: [to]
    },
    Message: {
      Subject: {
        Data: subject,
        Charset: 'UTF-8'
      },
      Body: {
        Html: {
          Data: html,
          Charset: 'UTF-8'
        }
      }
    }
  })

  try {
    const result = await sesClient.send(command)
    console.log('Email sent successfully:', result.MessageId)
    return result
  } catch (error) {
    console.error('Error sending email:', error)
    throw error
  }
}

/**
 * Generate verification token
 * @returns {string} Random verification token
 */
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Send email verification email
 * @param {string} email - User's email address
 * @param {string} token - Verification token
 */
const sendVerificationEmail = async (email, token) => {
  const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${token}`
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #f97316;">Welcome to Far Too Young!</h2>
      <p>Thank you for registering. Please verify your email address to complete your account setup.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verifyUrl}" 
           style="background-color: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Verify Email Address
        </a>
      </div>
      <p style="color: #666; font-size: 14px;">
        If the button doesn't work, copy and paste this link into your browser:<br>
        <a href="${verifyUrl}">${verifyUrl}</a>
      </p>
      <p style="color: #666; font-size: 14px;">
        This link will expire in 1 hour for security reasons.
      </p>
    </div>
  `
  
  await sendEmail(email, 'Verify Your Far Too Young Account', html)
}

/**
 * Send password reset email
 * @param {string} email - User's email address
 * @param {string} token - Reset token
 */
const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #f97316;">Password Reset Request</h2>
      <p>You requested a password reset for your Far Too Young account.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" 
           style="background-color: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Reset Password
        </a>
      </div>
      <p style="color: #666; font-size: 14px;">
        If the button doesn't work, copy and paste this link into your browser:<br>
        <a href="${resetUrl}">${resetUrl}</a>
      </p>
      <p style="color: #666; font-size: 14px;">
        This link will expire in 1 hour for security reasons.
      </p>
      <p style="color: #666; font-size: 14px;">
        If you didn't request this password reset, please ignore this email.
      </p>
    </div>
  `
  
  await sendEmail(email, 'Reset Your Far Too Young Password', html)
}

module.exports = {
  sendEmail,
  generateVerificationToken,
  sendVerificationEmail,
  sendPasswordResetEmail
}
