import React from 'react'

const RidePopUp = (props) => {
  const user = props.ride?.user;
  const userFullname = user?.fullname;
  const riderName = userFullname
    ? `${userFullname.firstname ?? ''} ${userFullname.lastname ?? ''}`.trim()
    : user?.email || user?.name || 'Unknown Rider';

  const fareAmount = typeof props.ride?.fare === 'number'
    ? props.ride.fare
    : props.ride?.fare?.car ?? props.ride?.fare?.auto ?? props.ride?.fare?.moto ?? 'N/A';

  return (
    <div>
          <h5 className='absolute left-1/2 top-0 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full  text-center text-gray-400 shadow-md'onClick={()=>{
        props?.setRidePopupPanel?.(false)
      }}><i className="ri-arrow-down-wide-fill"></i></h5>
      <h3 className='text-2xl font-semibold mb-5'>New Ride Available!</h3>

      <div className='flex items-center justify-between bg-yellow-400 rounded-lg mt-4'>
        <div className='flex items-center gap-3 mt-3'>
            <img className='h-12 w-12 rounded-full object-cover mb-1 ml-1' src="https://photosweek.in/wp-content/uploads/Cute-Indian-Girl-Pic.jpg" alt="" />
            <h2 className='text-xl font-medium'>{riderName}</h2>
        </div>
        <h5 className='p-2'>2.2 KM</h5>
      </div>

     <div className='flex gap-2 justify-between flex-col items -center'>
     
       <div className='w-full mt-5'>
            <div className='flex items-center gap-5 p-3 border-b-2 border-gray-200'>
              <i className="text-lg ri-map-pin-2-fill"></i>
              <div>
                <h3 className='text-lg font-medium'>562//11-A</h3>
                <p className='text-sm -mt-1 text-gray-699'>{props.ride?.pickup}</p>
              </div>
            </div>
            <div className='flex items-center gap-5 p-3 border-b-2 border-gray-200'>
               <i className="text-lg ri-map-pin-2-fill"></i>
              <div>
                <h3 className='text-lg font-medium'>562//11-A</h3>
                <p className='text-sm -mt-1 text-gray-699'>{props.ride?.destination}</p>
              </div>
            </div>
            <div className='flex items-center gap-5 p-3 '>
               <i className="ri-currency-fill"></i>
              <div>
                <h3 className='text-lg font-medium'>₹{fareAmount}</h3>
                <p className='text-sm -mt-1 text-gray-699'>Cash Cash</p>
              </div>
            </div>
       </div>
      <div className='flex w-full items-center justify-between'>
         <button onClick={()=>{
        props?.setRidePopupPanel?.(false)
        props?.setConfirmRidePopupPanel?.(true)
        props.confirmRide()
       }} className=' mt-5 bg-green-600 text-white font-semibold p-3 px-8 rounded' >Accept</button>
       <button onClick={()=>{
        props?.setRidePopupPanel?.(false)
        
       }} className='l mt-4 bg-gray-400 text-gray-700 font-semibold p-3 px-8 rounded' >Egnore</button>
      </div>
     </div>
    </div>
  )
}

export default RidePopUp
