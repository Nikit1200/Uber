import React, { useContext, useEffect, useRef, useState } from 'react'
import {useGSAP} from '@gsap/react'
import gsap from 'gsap'
import 'remixicon/fonts/remixicon.css'
import axios from 'axios'
import LocationSearchPanel from '../components/LocationSearchPanel'
import VehiclePanel from '../components/VehiclePanel'
import ConfirmRide from '../components/ConfirmRide'
import LookingForDriver from '../components/LookingForDriver'
import WaitingForDriver from '../components/WaitingForDriver'
import LiveTracking from '../components/LiveTracking'
import { SocketDataContext } from '../context/SocketContext'
import { UserDataContext } from '../context/UserDataContext';
import { useNavigate } from 'react-router-dom'

const Home = () => {
  const [pickup, setpickup] = useState('')
  const [destination, setdestination] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')
  const [activeField, setActiveField] = useState('pickup')
  const [suggestions, setSuggestions] = useState([])
  const [suggestionsLoading, setSuggestionsLoading] = useState(false)
  const [suggestionsError, setSuggestionsError] = useState('')
  const [panelOpen, setpanelOpen] = useState(false)
  const pickupInputRef = useRef(null)
  const destinationInputRef = useRef(null)
  const vehiclePanelRef = useRef(null)
  const confirmRidePanelRef = useRef(null)
  const VehicleFoundRef = useRef(null)
  const waitingForDriverRef = useRef(null)

  const [vehiclePanel, setvehiclePanel] = useState(false)
  const [selectedVehicle, setselectedVehicle] = useState('')
  const panelRef = useRef(null)
  const panelCloseRef = useRef(null)
  const [confirmRidePanel, setconfirmRidePanel] = useState(false)
  const [VehicleFound, setVehicleFound] = useState(false)
  const [waitingForDriver, setwaitingForDriver] = useState(false)
  const [confirmedRide, setConfirmedRide] = useState(null)
  const [fare, setfare] = useState({})
  const [vehicleType, setvehicleType] = useState(null)
  const [passenger, setPassenger] = useState(1)
  const [ride , setRide] = useState(null)
  const showRecenterControl = !(
    panelOpen ||
    vehiclePanel ||
    confirmRidePanel ||
    VehicleFound ||
    waitingForDriver
  )
  const recenterControlBottomOffset = panelOpen
    ? 'calc(70% + env(safe-area-inset-bottom, 0px) + 16px)'
    : 'calc(30% + env(safe-area-inset-bottom, 0px) + 16px)'

    const navigate = useNavigate()

  const { sendMessageToEvent, isConnected, receiveMessageFromEvent } = useContext(SocketDataContext)
  const { user } = useContext(UserDataContext)

  useEffect(()=>{
    if (isConnected && user?._id) {
      sendMessageToEvent('join', { userType: 'user', userId: user._id })
    }
  }, [isConnected, sendMessageToEvent, user?._id])

  useEffect(() => {
    if (!isConnected) return

    const cleanupRideConfirmed = receiveMessageFromEvent('ride-confirmed', (ride) => {
      console.log(ride)
      setConfirmedRide(ride)
      setwaitingForDriver(true)
      setVehicleFound(false)
      setvehiclePanel(false)
      setconfirmRidePanel(false)
      setpanelOpen(false)
      setRide(ride)
    })

    const cleanupRideStarted = receiveMessageFromEvent('ride-started', (ride) => {
      const rideData = ride?.data ?? ride
      setwaitingForDriver(false)
      setRide(rideData)
      localStorage.setItem('currentRide', JSON.stringify(rideData))
      navigate('/riding', {
        state: {
          ride: rideData
        }
      })
    })

    return () => {
      cleanupRideConfirmed()
      cleanupRideStarted()
    }
  }, [isConnected, receiveMessageFromEvent, navigate])
  
  const submitHandler =(e)=>{
    e.preventDefault()
  }


  useEffect(() => {
    const searchInput = activeField === 'pickup' ? pickup : destination

    if (!panelOpen || searchInput.trim().length <= 2) {
      setSuggestions([])
      setSuggestionsLoading(false)
      setSuggestionsError('')
      return
    }

    const token = localStorage.getItem('token')
    const timeoutId = setTimeout(async () => {
      try {
        setSuggestionsLoading(true)
        setSuggestionsError('')

        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/maps/get-suggestions`, {
          params: {
            input: searchInput
          },
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        const responseSuggestions = Array.isArray(response.data)
          ? response.data
          : response.data.predictions || []

        setSuggestions(responseSuggestions)
      } catch (error) {
        setSuggestions([])
        setSuggestionsError(error.response?.data?.message || 'Unable to fetch suggestions')
      } finally {
        setSuggestionsLoading(false)
      }
    }, 400)

    return () => clearTimeout(timeoutId)
  }, [pickup, destination, activeField, panelOpen])

  const handleLocationSelect = (location) => {
    if (activeField === 'pickup') {
      setpickup(location)
      setActiveField('destination')
      setSuggestions([])
      setSuggestionsError('')
      setSuggestionsLoading(false)
      setpanelOpen(true)
      setvehiclePanel(false)

      setTimeout(() => {
        destinationInputRef.current?.focus()
      }, 0)

      return
    } else {
      setdestination(location)
      setActiveField('destination')
    }

    setSuggestions([])
    setSuggestionsError('')
    setSuggestionsLoading(false)
    setpanelOpen(true)
    setvehiclePanel(false)
  }

  const handleFindTrip = async () => {
    if (!pickup.trim() || !destination.trim()) {
      return
    }

    const response  = await axios.get(`${import.meta.env.VITE_BASE_URL}/rides/get-fare`,{
      params:{pickup, destination},
      headers:{
        Authorization:`Bearer ${localStorage.getItem('token')}`
      }
    })
    
    setfare(response.data)
    setpanelOpen(false)
    setvehiclePanel(true)
  }

  async function createRide(vehicleType){
  const response  = await  axios.post(`${import.meta.env.VITE_BASE_URL}/rides/create`,{
      pickup,
      destination,
      vehicleType
    },{
      headers:{
        Authorization:`Bearer ${localStorage.getItem('token')}`
      }
    })
    console.log(response.data)
  }
  
  useGSAP(function(){
    if(panelOpen){
    gsap.to(panelRef.current,{
      height:'70%',
      padding:20
      //opacity:1
    })
    gsap.to(panelCloseRef.current,{
      opacity:1
    })
  }else{
    gsap.to(panelRef.current,{
      height:'0%',
      padding:0
      //opacity:0
    })
    gsap.to(panelCloseRef.current,{
      opacity:0
    })
  }
  },[panelOpen])

  useGSAP(function(){
   if(vehiclePanel){
     gsap.to(vehiclePanelRef.current,{
      transform:'translateY(0)'
    })
   }else{
     gsap.to(vehiclePanelRef.current,{
      transform:'translateY(100%)'
    })
   }
  },[vehiclePanel])

  useGSAP(function(){
   if(confirmRidePanel){
     gsap.to(confirmRidePanelRef.current,{
      transform:'translateY(0)'
    })
   }else{
     gsap.to(confirmRidePanelRef.current,{
      transform:'translateY(100%)'
    })
   }
  },[confirmRidePanel])

  useGSAP(function(){
   if(VehicleFound){
     gsap.to(VehicleFoundRef.current,{
      transform:'translateY(0)'
    })
   }else{
     gsap.to(VehicleFoundRef.current,{
      transform:'translateY(100%)'
    })
   }
  },[VehicleFound])

  useGSAP(function(){
   if(waitingForDriver){
     gsap.to(waitingForDriverRef.current,{
      transform:'translateY(0)'
    })
   }else{
     gsap.to(waitingForDriverRef.current,{
      transform:'translateY(100%)'
    })
   }
  },[waitingForDriver])

  return (
    <div className='h-screen relative overflow-hidden'>
      <img className='w-16 absolute left-5 top-5' src="https://freelogopng.com/images/all_img/1659761100uber-logo-png.png" alt="" />

    <div className='h-screen w-screen'>
          <LiveTracking
            showRecenterControl={showRecenterControl}
            recenterControlStyle={{
              left: 'calc(env(safe-area-inset-left, 0px) + 16px)',
              bottom: recenterControlBottomOffset
            }}
          />
    </div>
    <div className='pointer-events-none flex flex-col justify-end h-screen absolute top-0 w-full'>
      <div className='pointer-events-auto h-[30%] p-6 pb-8 bg-white relative'>
       <h5 ref={panelCloseRef} onClick={()=>{
        setpanelOpen(false)
       }} className='absolute opacity-0 right-6 top-6 text-xl'>
        <i className="ri-arrow-down-wide-fill"></i>
        </h5> 
        <h4 className='text-2xl font-semibold'>Find a trip</h4>
      <form onSubmit={(e)=>{
        submitHandler(e)
      }} >
        <div className='relative mt-5'>
          <div className="absolute left-5 top-5 h-16 w-1 bg-gray-700 rounded-full"></div>
          <input
          ref={pickupInputRef}
          onClick={()=>{
            setpanelOpen(true)
            setvehiclePanel(false)
            setActiveField('pickup')
          }}
          value={pickup}
          onChange={(e)=>{
            setActiveField('pickup')
            setpanelOpen(true)
            setvehiclePanel(false)
            setpickup(e.target.value)
          }}
           className='bg-[#eee] px-12 py-2 text-lg rounded-lg w-full' 
           type="text"  
           placeholder='Add a pick-up location'
           />
          <input
          ref={destinationInputRef}
          onClick={()=>{
            setpanelOpen(true)
            setvehiclePanel(false)
            setActiveField('destination')
          }}
          value={destination}
          onChange={(e)=>{
            setActiveField('destination')
            setpanelOpen(true)
            setvehiclePanel(false)
            setdestination(e.target.value)
          }}
           className='bg-[#eee] px-12 py-2 text-lg rounded-lg w-full mt-3' 
           type="text" 
           placeholder='Enter your destination' 
           />
        </div>
      </form>
      <button
        type='button'
        onClick={handleFindTrip}
        className='bg-black w-full text-white px-4 py-2 rounded-lg mt-6'
      >
        Find Trip
      </button>
      </div>
      <div ref={panelRef} className='pointer-events-auto bg-white h-0 overflow-hidden'>
          <LocationSearchPanel
            suggestions={suggestions}
            loading={suggestionsLoading}
            error={suggestionsError}
            onSelect={handleLocationSelect}
          />
      </div>
    </div>
    <div ref={vehiclePanelRef} className='pointer-events-auto fixed w-full z-10 bottom-0 translate-y-full bg-white px-3 py-10 pt-14'>
          <VehiclePanel
          setvehicle={setvehicleType}
          fare={fare} setvehiclePanel={setvehiclePanel} setconfirmRidePanel={setconfirmRidePanel}/>
    </div>
    <div ref={confirmRidePanelRef} className='pointer-events-auto fixed w-full z-20 bottom-0 translate-y-full bg-white px-3 py-10 pt-12'>
          <ConfirmRide
          createRide={createRide}
          pickup={pickup}
          destination={destination}
          fare={fare}
          vehicleType={vehicleType}
          passenger={passenger}
          setconfirmRidePanel={setconfirmRidePanel} setvehicleFound={setVehicleFound}/>
    </div>
        <div ref={VehicleFoundRef} className='pointer-events-auto fixed w-full z-10 bottom-0 translate-y-full rounded-t-3xl bg-white px-4 py-8 pt-14'>
          <LookingForDriver
          pickup={pickup}
          destination={destination}
          fare={fare}
          vehicleType={vehicleType}
          setVehicleFound={setVehicleFound}/>
    </div>
    <div ref={waitingForDriverRef} className='pointer-events-auto fixed w-full z-10 bottom-0 translate-y-full rounded-t-3xl bg-white px-3 py-6 pt-12'>
<WaitingForDriver
  ride={confirmedRide}
  setVehicleFound={setVehicleFound}
  setwaitingForDriver={setwaitingForDriver} />
    </div>
      </div>
  )
}

export default Home
