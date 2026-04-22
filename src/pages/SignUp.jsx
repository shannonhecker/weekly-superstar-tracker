import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'
import { generateShareCode } from '../lib/codes'
import { formatAuthError } from '../lib/authErrors'

export default function SignUp() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [boardName, setBoardName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password)
      if (name.trim()) await updateProfile(cred.user, { displayName: name.trim() })
      const board = await addDoc(collection(db, 'boards'), {
        name: boardName.trim() || `${name.trim() || 'Our'} Family`,
        adminId: cred.user.uid,
        memberIds: [cred.user.uid],
        shareCode: generateShareCode(),
        createdAt: serverTimestamp(),
      })
      navigate(`/board/${board.id}`, { replace: true })
    } catch (err) {
      setError(formatAuthError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5">
      <form onSubmit={onSubmit} className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full">
        <h1 className="text-2xl font-black font-display mb-1">Create your board</h1>
        <p className="text-gray-400 mb-5 text-sm">Admin account — you can invite family after.</p>

        <label className="block text-xs font-bold text-gray-700 mb-1">Your name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-4 py-3 mb-4 rounded-xl bg-white border-2 border-gray-200 outline-none font-bold" />

        <label className="block text-xs font-bold text-gray-700 mb-1">Board name (optional)</label>
        <input value={boardName} onChange={(e) => setBoardName(e.target.value)} placeholder="The Smith Family" className="w-full px-4 py-3 mb-4 rounded-xl bg-white border-2 border-gray-200 outline-none font-bold" />

        <label className="block text-xs font-bold text-gray-700 mb-1">Email</label>
        <input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 mb-4 rounded-xl bg-purple-50 outline-none font-bold" />

        <label className="block text-xs font-bold text-gray-700 mb-1">Password</label>
        <input type="password" autoComplete="new-password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 mb-2 rounded-xl bg-purple-50 outline-none font-bold" />

        {error && <p className="text-red-500 text-sm font-bold mt-2">{error}</p>}

        <button type="submit" disabled={loading} className="w-full mt-4 py-4 rounded-2xl text-white font-bold bg-gradient-to-r from-green-400 to-purple-500 disabled:opacity-60">
          {loading ? 'Creating…' : 'Create board'}
        </button>

        <p className="text-center mt-4 text-sm text-gray-500">
          Already have an account? <Link to="/signin" className="text-purple-600 font-bold">Sign in</Link>
        </p>
      </form>
    </div>
  )
}
