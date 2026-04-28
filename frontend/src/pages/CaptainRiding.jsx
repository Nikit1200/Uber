import { useGSAP } from '@gsap/react'
import axios from 'axios'
import gsap from 'gsap'
import React, { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import FinishRide from '../components/FinishRide'
import LiveTracking from '../components/LiveTracking'

const backendUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:3000'

const toRadians = (value) => (value * Math.PI) / 180

const getDistanceBetweenPoints = (origin, destination) => {
  const earthRadiusKm = 6371
  const latDistance = toRadians(destination.lat - origin.lat)
  const lngDistance = toRadians(destination.lng - origin.lng)
  const originLatitude = toRadians(origin.lat)
  const destinationLatitude = toRadians(destination.lat)

  const haversineDistance =
    Math.sin(latDistance / 2) * Math.sin(latDistance / 2) +
    Math.cos(originLatitude) *
      Math.cos(destinationLatitude) *
      Math.sin(lngDistance / 2) *
      Math.sin(lngDistance / 2)

  const centralAngle = 2 * Math.atan2(Math.sqrt(haversineDistance), Math.sqrt(1 - haversineDistance))

  return earthRadiusKm * centralAngle
}

const formatDistance = (distanceInKm) => {
  if (!Number.isFinite(distanceInKm)) {
    return 'Distance unavailable'
  }

  if (distanceInKm < 1) {
    return `${Math.max(50, Math.round(distanceInKm * 1000))} m away`
  }

  return `${distanceInKm.toFixed(1)} km away`
}

const CaptainRiding = () => {
  const location = useLocation()
  const [finishRidePanel, setfinishRidePanel] = useState(false)
  const [ride, setRide] = useState(() => location.state?.ride || null)
  const [captainLocation, setCaptainLocation] = useState(null)
  const [targetCoordinates, setTargetCoordinates] = useState(null)
  const [distanceLabel, setDistanceLabel] = useState('Calculating distance...')
  const finishRidePanelRef = useRef(null)
  const showRecenterControl = !finishRidePanel

  useEffect(() => {
    if (location.state?.ride) {
      setRide(location.state.ride)
      localStorage.setItem('captainCurrentRide', JSON.stringify(location.state.ride))
      return
    }

    const storedRide = localStorage.getItem('captainCurrentRide')
    if (!storedRide) return

    try {
      setRide(JSON.parse(storedRide))
    } catch (error) {
      console.error('Failed to parse captain ride data', error)
    }
  }, [location.state])

  useGSAP(function(){
    if(finishRidePanel){
      gsap.to(finishRidePanelRef.current,{
        transform:'translateY(0)'
      })
    }else{
      gsap.to(finishRidePanelRef.current,{
        transform:'translateY(100%)'
      })
    }
  },[finishRidePanel])

  useEffect(()=>{
    document.body.style.overflow='hidden'

    return ()=>{
      document.body.style.overflow='auto'
    }
  },[])

  const riderName = ride?.user?.fullname
    ? `${ride.user.fullname.firstname || ''} ${ride.user.fullname.lastname || ''}`.trim()
    : 'Rider'
  const pickup = ride?.pickup || 'Pickup not available'
  const destination = ride?.destination || 'Destination not available'
  const fare = typeof ride?.fare === 'number' ? ride.fare.toFixed(2) : ride?.fare || '0.00'
  const distanceTarget = ride?.status === 'ongoing' ? destination : pickup

  useEffect(() => {
    if (!distanceTarget || distanceTarget.includes('not available')) {
      setTargetCoordinates(null)
      setDistanceLabel('Distance unavailable')
      return
    }

    let isActive = true

    const loadTargetCoordinates = async () => {
      try {
        const response = await axios.get(`${backendUrl}/maps/get-coordinates`, {
          params: {
            address: distanceTarget
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        })

        if (!isActive) {
          return
        }

        setTargetCoordinates({
          lat: response.data.lat ?? response.data.ltd,
          lng: response.data.lng ?? response.data.lang
        })
      } catch (error) {
        if (!isActive) {
          return
        }

        setTargetCoordinates(null)
        setDistanceLabel('Distance unavailable')
      }
    }

    loadTargetCoordinates()

    return () => {
      isActive = false
    }
  }, [distanceTarget])

  useEffect(() => {
    if (!captainLocation || !targetCoordinates) {
      return
    }

    const distanceInKm = getDistanceBetweenPoints(captainLocation, targetCoordinates)
    setDistanceLabel(formatDistance(distanceInKm))
  }, [captainLocation, targetCoordinates])

  return (
     <div className='h-screen relative overflow-hidden bg-white'>
       <div className='relative h-[78%] w-full'>
            <LiveTracking
              onLocationUpdate={setCaptainLocation}
              showRecenterControl={showRecenterControl}
              recenterControlStyle={{
                left: 'calc(env(safe-area-inset-left, 0px) + 16px)',
                bottom: 'calc(22% + env(safe-area-inset-bottom, 0px) + 16px)'
              }}
            />
            <img className='absolute left-5 top-5 w-20' src="https://freelogopng.com/images/all_img/1659761100uber-logo-png.png" alt="" />
         <Link to='/captain-home' className='absolute right-5 top-5 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-md'>
            <i className="text-lg font-medium ri-logout-box-r-line"></i>
        </Link>
       </div>

        <div className='absolute bottom-0 h-[22%] w-full bg-yellow-400 px-5 pt-3 pb-4'>
          <div className='mb-2 flex items-center justify-center' onClick={()=>{
          setfinishRidePanel(true)
        }}>
            <i className="text-2xl font-medium ri-arrow-up-s-line"></i>
          </div>
          <div className='flex items-start justify-between gap-4 pt-1'>
            <div>
              <h4 className='text-[2rem] leading-[1.05] font-semibold'>{distanceLabel}</h4>
              <p className='mt-1 text-sm font-medium text-slate-700'>{riderName}</p>
            </div>
            <button
              type='button'
              onClick={() => setfinishRidePanel(true)}
              className='mt-1 rounded-xl bg-green-600 px-6 py-2.5 text-base font-semibold text-white'
            >
              Complete Ride
            </button>
          </div>
        </div>
        <div ref={finishRidePanelRef} className='fixed w-full z-10 bottom-0 translate-y-full bg-white px-3 py-10 pt-14'>
        <FinishRide
          ride={ride}
          riderName={riderName}
          pickup={pickup}
          destination={destination}
          fare={fare}
          setfinishRidePanel={setfinishRidePanel}
        />
        </div>
    </div>
  )
}

export default CaptainRiding
