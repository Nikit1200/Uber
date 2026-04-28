import React, { useContext, useEffect, useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { Link } from 'react-router-dom'
import axios from 'axios'
import CaptainDetails from '../components/CaptainDetails'
import RidePopUp from '../components/RidePopUp'
import ConfirmRidePopup from '../components/ConfirmRidePopup'
import { SocketDataContext } from '../context/SocketContext'
import { CaptainDataContext } from '../context/CaptainContext'

const CaptainHome = () => {

    const [ridePopupPanel, setridePopupPanel] = useState(false)
    const [confirmRidePopupPanel, setConfirmRidePopupPanel] = useState(false)   
    const ridePopupPanelRef = useRef(null)
    const confirmRidePopupPanelRef = useRef(null)
    const { sendMessageToEvent, isConnected, receiveMessageFromEvent } = useContext(SocketDataContext)
    const { captain } = useContext(CaptainDataContext)
    const lastLocationRef = useRef(null)
    const [ride, setRide] = useState(null)

    useEffect(() => {
      if (isConnected && captain?._id) {
        sendMessageToEvent('join', { userType: 'captain', userId: captain._id })
      }
    }, [captain?._id, isConnected, sendMessageToEvent])

    useEffect(() => {
      if (!isConnected || !captain?._id || !navigator?.geolocation) return

      const hasLocationChanged = (prev, next) => {
        if (!prev || !next) return true
        const latChanged = Math.abs(prev.ltd - next.ltd) > 0.000001
        const lngChanged = Math.abs(prev.lng - next.lng) > 0.000001
        return latChanged || lngChanged
      }

      const updateLocation = () => {
        navigator.geolocation.getCurrentPosition(
          position => {
            const { latitude, longitude } = position.coords
            const nextLocation = { ltd: latitude, lng: longitude }

            if (!hasLocationChanged(lastLocationRef.current, nextLocation)) {
              return
            }

            lastLocationRef.current = nextLocation
            console.log({
              userId: captain._id,
              location: nextLocation
            })

            sendMessageToEvent('update-location-captain', {
              userId: captain._id,
              userType: 'captain',
              location: nextLocation
            })
          },
          () => {},
          { enableHighAccuracy: true }
        )
      }

      const interval = setInterval(() => {
        updateLocation()
      }, 10000)

      updateLocation()

      return () => {
        clearInterval(interval)
      }
    }, [isConnected, captain?._id, sendMessageToEvent])

    useEffect(() => {
      if (!isConnected || !captain?._id) return

      const cleanupSocket = receiveMessageFromEvent('new-ride', (data) => {
        const rideData = data?.data ?? data;
        console.log('new-ride received:', rideData);
        console.log('pickup:', rideData.pickup);
        console.log('destination:', rideData.destination);
        console.log('fare:', rideData.fare);
        console.log('status:', rideData.status);
        console.log('user:', rideData.user);
        setRide(rideData);
        setridePopupPanel(true);
      })

      return () => {
        cleanupSocket()
      }
    }, [isConnected, captain?._id, receiveMessageFromEvent])
    

async function confirmRide(){
  const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/rides/confirm`,{
    rideId: ride._id
  },{
    headers:{
      Authorization:`Bearer ${localStorage.getItem('token')}`
    }
  })
  console.log('Ride confirmed:', response.data)
}


      useGSAP(function(){
   if(ridePopupPanel){
     gsap.to(ridePopupPanelRef.current,{
      transform:'translateY(0)'
    })
   }else{
     gsap.to(ridePopupPanelRef.current,{
      transform:'translateY(100%)'
    })
   }
  },[ridePopupPanel])

    useGSAP(function(){
   if(confirmRidePopupPanel){
     gsap.to(confirmRidePopupPanelRef.current,{
      transform:'translateY(0)'
    })
   }else{
     gsap.to(confirmRidePopupPanelRef.current,{
      transform:'translateY(100%)'
    })
   }
  },[confirmRidePopupPanel])

  return (
  <div className='h-screen'>
       <div className='fixed p-3 top-0 flex items-center justify-between w-screen'>
            <img src={null} alt="" />
         <Link to='/home' className='fixed  right-2 top-2 h-10 w-10 bg-white flex items-center justify-center rounded-full'>
            <i className="text-lg font-medium ri-logout-box-r-line"></i>
        </Link>
       </div>
        <div onClick={()=>{
          setridePopupPanel(true)
        }} className='h-3/5'>
            <img className='h-full w-full object-cover' src="https://miro.medium.com/v2/resize:fit:1400/0*gwMx05pqII5hbfmX.gif" alt="" />
        </div>
        
        <div className='h-2/5 p-6 '>
            <CaptainDetails/>
          </div>
           <div ref={ridePopupPanelRef} className='fixed w-full z-10 bottom-0 translate-y-full bg-white px-3 py-10 pt-14'>
          <RidePopUp 
          ride={ride}
          setRidePopupPanel={setridePopupPanel} setConfirmRidePopupPanel={setConfirmRidePopupPanel}
          confirmRide = {confirmRide}
          />
    </div>
     <div ref={confirmRidePopupPanelRef} className='fixed w-full h-screen z-10 bottom-0 translate-y-full bg-white px-3 py-10 pt-14'>
          <ConfirmRidePopup
          ride={ride}
           setConfirmRidePopupPanel={setConfirmRidePopupPanel} setRidePopupPanel={setridePopupPanel}/>
    </div>
    </div>
  )
}

export default CaptainHome
