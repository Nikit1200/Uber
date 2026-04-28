import React, { useEffect, useRef, useState } from 'react'
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api'

const fallbackCenter = { lat: 23.2599, lng: 77.4126 }

const containerStyle = {
  width: '100%',
  height: '100%'
}

const mapOptions = {
  disableDefaultUI: false,
  draggable: true,
  scrollwheel: true,
  zoomControl: true,
  keyboardShortcuts: true,
  gestureHandling: 'greedy',
  clickableIcons: false,
  streetViewControl: true,
  mapTypeControl: true,
  fullscreenControl: true
}

const LiveTracking = ({
  className = '',
  zoom = 16,
  markerLabel = 'You',
  onLocationUpdate,
  recenterControlStyle,
  showRecenterControl = true
}) => {
  const [currentPosition, setCurrentPosition] = useState(null)
  const [mapCenter, setMapCenter] = useState(fallbackCenter)
  const [locationError, setLocationError] = useState('')
  const [isTracking, setIsTracking] = useState(true)
  const [followUserLocation, setFollowUserLocation] = useState(true)
  const watchIdRef = useRef(null)
  const mapRef = useRef(null)

  const googleMapsApiKey =
    (import.meta.env.VITE_GOOGLE_MAPS_API_KEY || import.meta.env.VITE_GOOGLE_MAPS_API || '').trim()

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey
  })

  useEffect(() => {
    if (!navigator?.geolocation) {
      setIsTracking(false)
      setLocationError('Geolocation is not supported in this browser.')
    
      return
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      ({ coords }) => {
        const nextPosition = {
          lat: coords.latitude,
          lng: coords.longitude
        }

        setCurrentPosition(nextPosition)
        setMapCenter((previousCenter) => {
          if (!followUserLocation) {
            return previousCenter
          }

          return nextPosition
        })
        setLocationError('')
        setIsTracking(false)
        onLocationUpdate?.(nextPosition)

        if (mapRef.current && followUserLocation) {
          mapRef.current.panTo(nextPosition)
        }
      },
      (error) => {
        setIsTracking(false)

        if (error.code === error.PERMISSION_DENIED) {
          setLocationError('Enable location permission to use live tracking.')
          return
        }

        if (error.code === error.TIMEOUT) {
          setLocationError('Location request timed out. Please try again in an open area.')
          return
        }

        setLocationError('Unable to fetch your current location right now.')
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 5000
      }
    )

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
    }
  }, [followUserLocation, onLocationUpdate])

  const handleRecenter = () => {
    if (!currentPosition || !mapRef.current) {
      return
    }

    setFollowUserLocation(true)
    setMapCenter(currentPosition)
    mapRef.current.panTo(currentPosition)
    mapRef.current.setZoom(zoom)
  }

  const recenterButtonPositionStyle = {
    left: 'calc(env(safe-area-inset-left, 0px) + 16px)',
    bottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)',
    ...recenterControlStyle
  }

  if (!googleMapsApiKey) {
    return (
      <div className={`flex h-full w-full items-center justify-center bg-slate-200 px-6 text-center text-sm text-slate-700 ${className}`}>
        Add `VITE_GOOGLE_MAPS_API_KEY` to `frontend/.env` to load live tracking on Google Maps.
      </div>
    )
  }

  if (loadError) {
    return (
      <div className={`flex h-full w-full items-center justify-center bg-slate-200 px-6 text-center text-sm text-slate-700 ${className}`}>
        Google Maps failed to load. Check your browser key, allowed referrers, and restart the Vite server after changing env values.
      </div>
    )
  }

  return (
    <div className={`relative h-full w-full ${className}`}>
      {!isLoaded && (
        <div className='absolute inset-0 z-10 flex items-center justify-center bg-slate-200 text-sm font-medium text-slate-700'>
          Loading map...
        </div>
      )}

      {isLoaded && (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={mapCenter}
          zoom={currentPosition ? zoom : 12}
          options={mapOptions}
          onDragStart={() => {
            setFollowUserLocation(false)
          }}
          onZoomChanged={() => {
            if (mapRef.current && currentPosition) {
              const center = mapRef.current.getCenter()

              if (!center) {
                return
              }

              const latDifference = Math.abs(center.lat() - currentPosition.lat)
              const lngDifference = Math.abs(center.lng() - currentPosition.lng)

              if (latDifference > 0.0003 || lngDifference > 0.0003) {
                setFollowUserLocation(false)
              }
            }
          }}
          onLoad={(map) => {
            mapRef.current = map
          }}
          onUnmount={() => {
            mapRef.current = null
          }}
        >
          {currentPosition && (
            <Marker
              position={currentPosition}
              label={markerLabel}
            />
          )}
        </GoogleMap>
      )}

      {isLoaded && currentPosition && showRecenterControl && (
        <div
          className='absolute z-20'
          style={recenterButtonPositionStyle}
        >
          <button
            type='button'
            onClick={handleRecenter}
            aria-label='Recenter map'
            title={followUserLocation ? 'Following your location' : 'Recenter map'}
            className={`flex h-12 w-12 items-center justify-center rounded-full border shadow-lg transition focus:outline-none focus:ring-2 focus:ring-slate-900/20 ${
              followUserLocation
                ? 'border-slate-900 bg-slate-900 text-white'
                : 'border-white bg-white text-slate-900 hover:bg-slate-50'
            }`}
          >
            <svg
              aria-hidden='true'
              viewBox='0 0 24 24'
              className='h-5 w-5'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <circle cx='12' cy='12' r='3' />
              <path d='M12 2v3' />
              <path d='M12 19v3' />
              <path d='M2 12h3' />
              <path d='M19 12h3' />
            </svg>
          </button>
        </div>
      )}

      {(isTracking || locationError) && (
        <div className='pointer-events-none absolute left-1/2 top-4 z-10 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-2xl bg-white/95 px-4 py-3 shadow-lg backdrop-blur'>
          <p className='text-sm font-semibold text-slate-900'>
            {locationError || 'Finding your live location...'}
          </p>
          {!locationError && (
            <p className='mt-1 text-xs text-slate-600'>
              We will keep the map centered on your current position.
            </p>
          )}
        </div>
      )}

    </div>
  )
}

export default LiveTracking
