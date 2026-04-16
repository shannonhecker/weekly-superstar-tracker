import { Link } from 'react-router-dom'

const Landing = () => {
  return (
    <div className="min-h-screen font-body flex flex-col items-center justify-center px-4 bg-gradient-to-br from-green-50 via-purple-50 to-yellow-50">
      <div className="text-center max-w-md w-full">
        <div className="text-6xl sm:text-7xl mb-4">⭐</div>
        <h1 className="text-3xl sm:text-4xl font-black font-display mb-2 bg-gradient-to-br from-green-500 via-purple-500 to-yellow-500 bg-clip-text text-transparent">
          Superstar Tracker
        </h1>
        <p className="text-gray-500 text-sm sm:text-base font-semibold mb-8">
          A weekly achievement tracker the whole family can share. Track habits, earn badges, grow pets together.
        </p>
        <div className="flex flex-col gap-3">
          <Link
            to="/signup"
            className="w-full py-3.5 rounded-2xl font-extrabold text-white text-base bg-gradient-to-r from-green-500 to-purple-500 shadow-lg shadow-purple-200 hover:scale-105 transition-transform"
          >
            Create a family board
          </Link>
          <Link
            to="/signin"
            className="w-full py-3.5 rounded-2xl font-extrabold text-gray-700 text-base bg-white border-2 border-gray-200 hover:border-purple-300 transition-colors"
          >
            Sign in
          </Link>
        </div>
        <p className="text-xs text-gray-400 mt-6 font-semibold">
          Got an invite link? Just tap it — no account needed.
        </p>
      </div>
    </div>
  )
}

export default Landing
