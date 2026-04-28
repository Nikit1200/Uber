import React, { useEffect, useState ,useContext} from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import PaymentPopup from '../components/PaymentPopup'
import LiveTracking from '../components/LiveTracking'
import { SocketDataContext } from '../context/SocketContext'

const Riding = () => {
  const location = useLocation()
  const [ride, setRide] = useState(() => location.state?.ride || null)
  const navigate = useNavigate()
  const { socket } = useContext(SocketDataContext)

  useEffect(() => {
    if (!socket) return

    const handleRideEnded = () => {
      navigate('/home')
    }

    socket.on('ride-ended', handleRideEnded)

    return () => {
      socket.off('ride-ended', handleRideEnded)
    }
  }, [socket, navigate])

  useEffect(() => {
    document.body.style.overflow = 'hidden'

    if (location.state?.ride) {
      setRide(location.state.ride)
      localStorage.setItem('currentRide', JSON.stringify(location.state.ride))
    } else {
      const storedRide = localStorage.getItem('currentRide')

      if (storedRide) {
        try {
          setRide(JSON.parse(storedRide))
        } catch (error) {
          console.error('Failed to parse stored ride data', error)
        }
      }
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [location.state])

  useEffect(() => {
    if (!ride) {
      return
    }

    localStorage.setItem('currentRide', JSON.stringify(ride))
  }, [ride])

  const handlePaymentSuccess = () => {
    localStorage.removeItem('currentRide')
    navigate('/home')
  }

  return (
    <div className='min-h-screen bg-[#2e3138]'>
      <div className='mx-auto flex min-h-screen w-full max-w-sm flex-col overflow-hidden bg-white shadow-[0_24px_60px_rgba(15,23,42,0.24)]'>
        <div className='relative h-[42vh] overflow-hidden bg-slate-100'>
          <LiveTracking />

          <div className='pointer-events-none absolute inset-0 bg-white/12'></div>

          <img
            className='absolute left-6 top-5 w-20'
            src='https://freelogopng.com/images/all_img/1659761100uber-logo-png.png'
            alt='Uber'
          />

          <Link
            to='/home'
            className='absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-slate-700 shadow-lg'
          >
            <i className='ri-home-5-line text-lg'></i>
          </Link>
        </div>

        <div className='flex-1 overflow-y-auto bg-white'>
          <PaymentPopup ride={ride} onPaymentSuccess={handlePaymentSuccess} />
        </div>
      </div>
    </div>
  )
}

export default Riding
