import { useEffect, useState } from 'react'
import { checkBackendHealth } from '../../services/api'

function BackendStatus() {
  const [status, setStatus] = useState('Checking...')

  useEffect(() => {
    checkBackendHealth()
      .then((data) => {
        setStatus(`${data.status} — ${data.application}`)
      })
      .catch(() => {
        setStatus('Backend unavailable')
      })
  }, [])

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900 px-6 py-4">
      <p className="text-sm text-slate-400">
        Backend Status
      </p>

      <p className="mt-2 text-green-400">
        {status}
      </p>
    </div>
  )
}

export default BackendStatus