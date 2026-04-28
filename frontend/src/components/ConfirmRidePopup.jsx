import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const backendUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:3000'

const ConfirmRidePopup = (props) => {
  const [otp, setOtp] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  const riderName = props.ride?.user?.fullname
    ? `${props.ride.user.fullname.firstname || ''} ${props.ride.user.fullname.lastname || ''}`.trim()
    : 'Rider'

  const submitHandler = async (e) => {
    e.preventDefault()

    if (!otp.trim()) {
      setErrorMessage('Please enter the OTP before confirming the ride.')
      return
    }

    try {
      setIsSubmitting(true)
      setErrorMessage('')

      const response = await axios.get(`${backendUrl}/rides/start-ride`, {
        params: {
          rideId: props.ride?._id,
          otp: otp.trim()
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.status === 200) {
        localStorage.setItem('captainCurrentRide', JSON.stringify(response.data))
        props?.setConfirmRidePopupPanel?.(false)
        props?.setRidePopupPanel?.(false)
        navigate('/captain-riding', {
          state: {
            ride: response.data
          }
        })
      }
    } catch (error) {
      console.error('Failed to start ride:', error)
      setErrorMessage(error.response?.data?.message || 'Unable to start the ride. Please check the OTP and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <h5
        className='absolute left-1/2 top-0 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full text-center text-gray-400 shadow-md'
        onClick={() => {
          props?.setConfirmRidePopupPanel?.(false)
        }}
      >
        <i className="ri-arrow-down-wide-fill"></i>
      </h5>
      <h3 className='mb-5 text-2xl font-semibold'>Confirm this ride to start</h3>

      <div className='mt-4 flex items-center justify-between rounded-lg bg-yellow-400'>
        <div className='mt-3 flex items-center gap-3'>
          <img
            className='mb-1 ml-1 h-12 w-12 rounded-full object-cover'
            src="https://photosweek.in/wp-content/uploads/Cute-Indian-Girl-Pic.jpg"
            alt="Rider"
          />
          <h2 className='text-xl font-medium capitalize'>{riderName}</h2>
        </div>
        <h5 className='p-2'>2.2 KM</h5>
      </div>

      <div className='flex flex-col items-center justify-between gap-2'>
        <div className='mt-5 w-full'>
          <div className='flex items-center gap-5 border-b-2 border-gray-200 p-3'>
            <i className="text-lg ri-map-pin-2-fill"></i>
            <div>
              <h3 className='text-lg font-medium'>Pickup</h3>
              <p className='-mt-1 text-sm text-gray-600'>{props.ride?.pickup}</p>
            </div>
          </div>
          <div className='flex items-center gap-5 border-b-2 border-gray-200 p-3'>
            <i className="text-lg ri-map-pin-2-fill"></i>
            <div>
              <h3 className='text-lg font-medium'>Destination</h3>
              <p className='-mt-1 text-sm text-gray-600'>{props.ride?.destination}</p>
            </div>
          </div>
          <div className='flex items-center gap-5 p-3'>
            <i className="ri-currency-fill"></i>
            <div>
              <h3 className='text-lg font-medium'>Rs. {props.ride?.fare}</h3>
              <p className='-mt-1 text-sm text-gray-600'>Cash</p>
            </div>
          </div>
        </div>

        <div className='mt-6 w-full'>
          <form onSubmit={submitHandler}>
            <input
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              type="text"
              inputMode='numeric'
              maxLength={4}
              className='mt-3 w-full rounded-lg border border-transparent bg-[#eee] px-6 py-3 text-lg outline-none focus:border-black'
              placeholder='Enter OTP'
            />
            {errorMessage && (
              <p className='mt-3 text-sm font-medium text-red-600'>{errorMessage}</p>
            )}
            <button
              type='submit'
              disabled={isSubmitting}
              className='mt-5 flex w-full justify-center rounded bg-green-600 p-2 font-semibold text-white disabled:bg-green-400'
            >
              {isSubmitting ? 'Confirming...' : 'Confirm'}
            </button>
            <button
              type='button'
              onClick={() => {
                props?.setConfirmRidePopupPanel?.(false)
              }}
              className='mt-4 w-full rounded bg-red-300 p-2 font-semibold text-gray-700'
            >
              Cancel
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ConfirmRidePopup
