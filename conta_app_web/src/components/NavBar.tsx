import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <nav className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center">
      {/* LEFT - Logo */}
      <div className="text-xl font-bold">
        MyApp
      </div>

      {/* CENTER - Links */}
      <div className="flex gap-6">
        <Link to="/" className="hover:text-gray-300">Home</Link>
        <Link to="/dashboard" className="hover:text-gray-300">Dashboard</Link>
        <Link to="/collect" className="hover:text-gray-300">Collect</Link>
        <Link to="/transcribe" className="hover:text-gray-300">Transcribe</Link>
        <Link to="/admin" className="hover:text-gray-300">Admin</Link>
      </div>

      {/* RIGHT - Auth */}
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <span className="text-sm text-gray-300">
              {user.email}
            </span>

            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded"
            >
              Logout
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  )
}