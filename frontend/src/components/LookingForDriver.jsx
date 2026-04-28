import React from 'react'

const LookingForDriver = (props) => {
  return (
      <div>
      <h5 className='absolute left-1/2 top-0 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full  text-center text-gray-400 shadow-md'onClick={()=>{
        props.setVehicleFound(false)
      }}><i className="ri-arrow-down-wide-fill"></i></h5>
      <h3 className='text-2xl font-semibold mb-5'>Looking for a Driver</h3>

     <div className='flex gap-2 justify-between flex-col items -center'>
       <img className='h-40' src="https://cn-geo1.uber.com/image-proc/crop/resizecrop/udam/format=auto/width=956/height=538/srcb64=aHR0cHM6Ly90Yi1zdGF0aWMudWJlci5jb20vcHJvZC91ZGFtLWFzc2V0cy85MDM0YzIwMC1jZTI5LTQ5ZjEtYmYzNS1lOWQyNTBlODIxN2EucG5n" alt="" />
       <div className='w-full mt-5'>
            <div className='flex items-center gap-5 p-3 border-b-2 border-gray-200'>
              <i className="text-lg ri-map-pin-2-fill"></i>
              <div>
                <h3 className='text-lg font-medium'>562//11-A</h3>
                <p className='text-sm -mt-1 text-gray-699'>{props.pickup}</p>
              </div>
            </div>
            <div className='flex items-center gap-5 p-3 border-b-2 border-gray-200'>
               <i className="text-lg ri-map-pin-2-fill"></i>
              <div>
                <h3 className='text-lg font-medium'>562//11-A</h3>
                <p className='text-sm -mt-1 text-gray-699'>{props.destination}</p>
              </div>
            </div>
            <div className='flex items-center gap-5 p-3 '>
               <i className="ri-currency-fill"></i>
              <div>
                <h3 className='text-lg font-medium'>₹{props.fare[props.vehicleType]}</h3>
                <p className='text-sm -mt-1 text-gray-699'>Cash Cash</p>
              </div>
            </div>
       </div>
     
     </div>
    </div>
  )
}

export default LookingForDriver
