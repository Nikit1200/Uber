import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const backendUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:3000'

const FinishRide = (props) => {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const ride = props.ride || null
  const riderName = props.riderName || 'Harshi Patel'
  const pickup = props.pickup || ride?.pickup || 'Kankariya Talab, Bhopal'
  const destination = props.destination || ride?.destination || 'Kankariya Talab, Bhopal'
  const fare = props.fare || (typeof ride?.fare === 'number' ? ride.fare.toFixed(2) : ride?.fare) || '193.20'

  const handleFinishRide = async () => {
    if (!ride?._id || isSubmitting) {
      return
    }

    try {
      setIsSubmitting(true)
      setErrorMessage('')

      await axios.post(`${backendUrl}/rides/end-ride`, {
        rideId: ride._id
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })

      localStorage.removeItem('captainCurrentRide')
      navigate('/captain-home')
    } catch (error) {
      console.error('Failed to finish ride:', error)
      setErrorMessage(error.response?.data?.message || 'Unable to finish the ride right now.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <h5 className='absolute left-1/2 top-0 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full text-center text-gray-400 shadow-md' onClick={() => {
        props?.setfinishRidePanel?.(false)
      }}><i className="ri-arrow-down-wide-fill"></i></h5>
      <h3 className='mb-5 text-2xl font-semibold'>Finish this Ride</h3>

      <div className='mt-4 flex items-center justify-between rounded-lg border-2 border-yellow-400'>
        <div className='mt-3 flex items-center gap-3'>
          <img className='mb-1 ml-1 h-12 w-12 rounded-full object-cover' src="https://photosweek.in/wp-content/uploads/Cute-Indian-Girl-Pic.jpg" alt="" />
          <h2 className='text-xl font-medium'>{riderName}</h2>
        </div>
        <h5 className='p-2'>2.2 KM</h5>
      </div>

      <div className='flex flex-col items-center justify-between gap-2'>
        <div className='mt-5 w-full'>
          <div className='flex items-center gap-5 border-b-2 border-gray-200 p-3'>
            <i className="text-lg ri-map-pin-2-fill"></i>
            <div>
              <h3 className='text-lg font-medium'>Pickup</h3>
              <p className='text-sm -mt-1 text-gray-600'>{pickup}</p>
            </div>
          </div>
          <div className='flex items-center gap-5 border-b-2 border-gray-200 p-3'>
            <i className="text-lg ri-map-pin-2-fill"></i>
            <div>
              <h3 className='text-lg font-medium'>Destination</h3>
              <p className='text-sm -mt-1 text-gray-600'>{destination}</p>
            </div>
          </div>
          <div className='flex items-center gap-5 p-3'>
            <i className="ri-currency-fill"></i>
            <div>
              <h3 className='text-lg font-medium'>Rs. {fare}</h3>
              <p className='text-sm -mt-1 text-gray-600'>Cash Cash</p>
            </div>
          </div>
        </div>

        {errorMessage && (
          <p className='mt-3 w-full text-sm font-medium text-red-600'>{errorMessage}</p>
        )}

        <div className='mt-6 w-full'>
          <button
            type='button'
            onClick={handleFinishRide}
            disabled={isSubmitting}
            className='mt-5 flex w-full justify-center rounded bg-green-600 p-2 font-semibold text-white disabled:bg-green-400'
          >
            {isSubmitting ? 'Finishing Ride...' : 'Finish Ride'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default FinishRide
