import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import ProfilePage from '../pages/ProfilePage'
import { getOwnProfile, saveOwnProfile } from '../services/profiles'

vi.mock('../auth/AuthProvider', () => ({
  useAuth: () => ({ user: { id: 'user-1' } }),
}))

vi.mock('../services/profiles', () => ({
  getOwnProfile: vi.fn(),
  saveOwnProfile: vi.fn(),
}))

beforeEach(() => {
  vi.clearAllMocks()
  getOwnProfile.mockResolvedValue(null)
})

test('blocks submission when required medical profile fields are missing', async () => {
  const user = userEvent.setup()
  render(<MemoryRouter><ProfilePage /></MemoryRouter>)

  await screen.findByRole('heading', { name: /medical profile/i })
  await user.click(screen.getByRole('button', { name: /save profile/i }))

  expect(await screen.findByText(/please complete the required fields/i)).toBeInTheDocument()
  expect(saveOwnProfile).not.toHaveBeenCalled()
})

test('saves a valid medical profile for the signed-in user', async () => {
  saveOwnProfile.mockResolvedValue({ id: 'profile-1', public_id: 'public-1' })
  const user = userEvent.setup()
  render(<MemoryRouter><ProfilePage /></MemoryRouter>)

  await screen.findByRole('heading', { name: /medical profile/i })
  await user.type(screen.getByLabelText(/full name/i), 'Demo User')
  await user.selectOptions(screen.getByLabelText(/blood group/i), 'O+')
  await user.type(screen.getByLabelText(/emergency contact name/i), 'Demo Contact')
  await user.type(screen.getByLabelText(/emergency contact phone/i), '9999999999')
  await user.click(screen.getByRole('button', { name: /save profile/i }))

  await waitFor(() => expect(saveOwnProfile).toHaveBeenCalledTimes(1))
  expect(saveOwnProfile).toHaveBeenCalledWith('user-1', expect.objectContaining({
    full_name: 'Demo User',
    blood_group: 'O+',
    emergency_contact_name: 'Demo Contact',
    emergency_contact_phone: '9999999999',
  }))
})
