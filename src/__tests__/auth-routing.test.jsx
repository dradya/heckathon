import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import App from '../App'
import { AuthContext } from '../auth/AuthProvider'

function renderRoute(path, auth = { user: null, loading: false, signOut: vi.fn() }) {
  return render(
    <AuthContext.Provider value={auth}>
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>
    </AuthContext.Provider>,
  )
}

describe('public routes', () => {
  test('renders the landing route', () => {
    renderRoute('/')
    expect(screen.getByRole('heading', { name: /emergency medical profile/i })).toBeInTheDocument()
  })

  test('renders a complete login form', () => {
    renderRoute('/login')
    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })

  test('renders a complete registration form', () => {
    renderRoute('/register')
    expect(screen.getByRole('heading', { name: /create account/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
  })
})

describe('protected routes', () => {
  test('redirects an unauthenticated dashboard visitor to login', () => {
    renderRoute('/dashboard')
    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument()
  })
})
