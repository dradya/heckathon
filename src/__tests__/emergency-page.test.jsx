import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { vi } from 'vitest'
import EmergencyPage from '../pages/EmergencyPage'
import { getEmergencyProfile } from '../services/profiles'

vi.mock('../services/profiles', () => ({
  getEmergencyProfile: vi.fn(),
}))

function renderEmergency(publicId = '550e8400-e29b-41d4-a716-446655440000') {
  return render(
    <MemoryRouter initialEntries={[`/emergency/${publicId}`]}>
      <Routes>
        <Route path="/emergency/:publicId" element={<EmergencyPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

test('renders approved emergency information without authentication', async () => {
  getEmergencyProfile.mockResolvedValue({
    full_name: 'Demo User',
    blood_group: 'O+',
    allergies: 'Penicillin',
    medications: 'Salbutamol inhaler',
    medical_conditions: 'Asthma',
    critical_notes: 'Keep inhaler nearby',
    emergency_contact_name: 'Demo Contact',
    emergency_contact_relation: 'Parent',
    emergency_contact_phone: '+919999999999',
  })

  renderEmergency()

  expect(await screen.findByRole('heading', { name: /demo user/i })).toBeInTheDocument()
  expect(screen.getByText('O+')).toBeInTheDocument()
  expect(screen.getByText('Penicillin')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /call demo contact/i })).toHaveAttribute('href', 'tel:+919999999999')
})

test('shows a safe not-found state for a malformed public id without calling Supabase', async () => {
  renderEmergency('not-a-uuid')

  expect(await screen.findByText(/emergency profile not found/i)).toBeInTheDocument()
  expect(getEmergencyProfile).not.toHaveBeenCalled()
})

test('shows a retry action when emergency data cannot be loaded', async () => {
  getEmergencyProfile
    .mockRejectedValueOnce(new Error('network unavailable'))
    .mockResolvedValueOnce(null)

  const user = userEvent.setup()
  renderEmergency()

  expect(await screen.findByText(/could not load emergency information/i)).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: /try again/i }))

  await waitFor(() => expect(getEmergencyProfile).toHaveBeenCalledTimes(2))
  expect(await screen.findByText(/emergency profile not found/i)).toBeInTheDocument()
})
