import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockSend = vi.fn().mockResolvedValue({ id: 'test-email-id' })

vi.mock('resend', () => ({
  Resend: class {
    emails = { send: mockSend }
  },
}))

describe('Dead Hand Emails', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('sendOwnerWarning', () => {
    it('should send warning email to owner', async () => {
      const { sendOwnerWarning } = await import('../lib/email')
      
      await sendOwnerWarning(
        'owner@example.com',
        'capsule-123',
        'Test Capsule',
        'https://app.com/reset'
      )

      expect(mockSend).toHaveBeenCalled()
    })

    it('should include capsule title in email', async () => {
      const { sendOwnerWarning } = await import('../lib/email')
      
      await sendOwnerWarning(
        'owner@example.com',
        'capsule-123',
        'Important Documents',
        'https://app.com/reset'
      )

      const call = mockSend.mock.calls[0][0]
      
      expect(call.subject).toContain('Important Documents')
      expect(call.html).toContain('Important Documents')
    })

    it('should include reset link in email', async () => {
      const { sendOwnerWarning } = await import('../lib/email')
      const resetLink = 'https://app.com/reset?id=123'
      
      await sendOwnerWarning(
        'owner@example.com',
        'capsule-123',
        'Test Capsule',
        resetLink
      )

      const call = mockSend.mock.calls[0][0]
      
      expect(call.html).toContain(resetLink)
    })
  })

  describe('sendRecipientNotification', () => {
    it('should send notification to single recipient', async () => {
      const { sendRecipientNotification } = await import('../lib/email')
      
      await sendRecipientNotification(
        ['recipient@example.com'],
        'capsule-123',
        'Test Capsule',
        'https://app.com/download'
      )

      expect(mockSend).toHaveBeenCalled()
    })

    it('should send notification to multiple recipients', async () => {
      const { sendRecipientNotification } = await import('../lib/email')
      const recipients = ['user1@example.com', 'user2@example.com', 'user3@example.com']
      
      await sendRecipientNotification(
        recipients,
        'capsule-123',
        'Test Capsule',
        'https://app.com/download'
      )

      const call = mockSend.mock.calls[0][0]
      
      expect(call.to).toEqual(recipients)
    })

    it('should include download link in email', async () => {
      const { sendRecipientNotification } = await import('../lib/email')
      const downloadLink = 'https://app.com/download?id=123&token=abc'
      
      await sendRecipientNotification(
        ['recipient@example.com'],
        'capsule-123',
        'Test Capsule',
        downloadLink
      )

      const call = mockSend.mock.calls[0][0]
      
      expect(call.html).toContain(downloadLink)
    })
  })
})
