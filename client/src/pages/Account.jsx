import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Account() {
  const navigate = useNavigate()

  useEffect(() => {
    navigate('/settings')
  }, [navigate])

  return null
}


