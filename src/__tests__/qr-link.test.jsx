import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import DashboardPage, { buildEmergencyUrl } from '../pages/DashboardPage'
import { getOwnProfile } from '../services/profiles'

vi.mock('../auth/AuthProvider', () => ({
  useAuth: () => ({ user: { id: 'user-1', email: 'demo@example.com' }, signOut: vi.fn() }),
}))

vi.mock('../services/profiles', () => ({
  getOwnProfile: vi.fn(),
}))

vi.mock('react-qr-code', () => ({
  default: ({ value }) => <div data-testid="emergency-qr" data-value={value}>QR</div>,
}))

beforeEach(() => {
  vi.clearAllMocks()
})

test('shows a create-profile CTA when the signed-in user has no profile', async () => {
  getOwnProfile.mockResolvedValue(null)
  render(<MemoryRouter><DashboardPage /></MemoryRouter>)

  expect(await screen.findByRole('link', { name: /create medical profile/i })).toHaveAttribute('href', '/profile')
})

test('builds and renders the exact public emergency QR URL', async () => {
  getOwnProfile.mockResolvedValue({
    public_id: '550e8400-e29b-41d4-a716-446655440000',
    full_name: 'Demo User',
    blood_group: 'O+',
    emergency_contact_name: 'Demo Contact',
    emergency_contact_phone: '9999999999',
  })

  render(<MemoryRouter><DashboardPage /></MemoryRouter>)

  const expected = `${window.location.origin}/emergency/550e8400-e29b-41d4-a716-446655440000`
  await waitFor(() => expect(screen.getByTestId('emergency-qr')).toHaveAttribute('data-value', expected))
  expect(buildEmergencyUrl('550e8400-e29b-41d4-a716-446655440000')).toBe(expected)
  expect(screen.getByText(expected)).toBeInTheDocument()
})
