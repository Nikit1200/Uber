import { useState } from 'react'

const VehiclePanel = (props) => {
  const [selectedVehicle, setselectedVehicle] = useState('')
  const fare = props.fare || {}

  return (
    <div>
      <h5 className='absolute left-1/2 top-0 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full  text-center shadow-md'onClick={()=>{
        props.setvehiclePanel(false)
      }}><i className="ri-arrow-down-wide-fill"></i></h5>
      <h3 className='text-2xl font-semibold mb-5'>Choose a Vehicle</h3>
            <div onClick={() => {
              setselectedVehicle('UberGo')
              props.setvehiclePanel(false)
              props.setconfirmRidePanel(true)
              props.setvehicle('car')
            }} className={`flex border-2 ${selectedVehicle === 'UberGo' ? 'border-black' : 'border-gray-400'} mb-2 rounded-xl w-full p-3 items-center justify-between`}>
                <img className='h-15'  src="https://img.freepik.com/premium-photo/luxury-car-png-style-white-background_1115207-8890.jpg?semt=ais_hybrid&w=740&q=80" alt="" />
                <div className='ml-2 w-1/2'>
                    <h4 className='font-medium text-base'>UberGo<span><i  className="ri-user-3-fill"></i>4</span></h4>
                    <h5 className='font-medium text-sm'>2 mins away</h5>
                    <p className='font-medium text-xs text-gray-600'>Affordable, compact rides</p>
                </div>
                <h2 className='text-2xl font-semibold'>&#8377;{fare.car ?? 0}</h2>
            </div>
        <div onClick={() => {
          setselectedVehicle('Moto')
          props.setvehiclePanel(false)
          props.setconfirmRidePanel(true)
          props.setvehicle('moto')
        }} className={`flex border-2 ${selectedVehicle === 'Moto' ? 'border-black' : 'border-gray-400'} mb-2 rounded-xl w-full p-3 items-center justify-between`}>
                <img className='h-15'  src="https://cn-geo1.uber.com/image-proc/crop/resizecrop/udam/format=auto/width=1344/height=896/srcb64=aHR0cHM6Ly90Yi1zdGF0aWMudWJlci5jb20vcHJvZC91ZGFtLWFzc2V0cy85NTM4NTEyZC1mZGUxLTRmNzMtYmQ1MS05Y2VmZjRlMjU0ZjEucG5n" alt="" />
                <div className='ml-2 w-1/2'>
                    <h4 className='font-medium text-base'>Moto<span><i  className="ri-user-3-fill"></i>1</span></h4>
                    <h5 className='font-medium text-sm'>3 mins away</h5>
                    <p className='font-medium text-xs text-gray-600'>Affordable, motor cycle rides</p>
                </div>
                <h2 className='text-2xl font-semibold'>&#8377;{fare.moto ?? 0}</h2>
            </div>
            <div onClick={() => {
              setselectedVehicle('UberAuto')
              props.setvehiclePanel(false)
              props.setconfirmRidePanel(true)
              props.setvehicle('auto')
            }} className={`flex border-2 ${selectedVehicle === 'UberAuto' ? 'border-black' : 'border-gray-400'} mb-2 rounded-xl w-full p-3 items-center justify-between`}>
                <img className='h-15'  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTiYZNGPspo5yDiYR9DP05wsjLh1skE79Jfng&s" alt="" />
                <div className='ml-2 w-1/2'>
                    <h4 className='font-medium text-base'>UberAuto<span><i  className="ri-user-3-fill"></i>4</span></h4>
                    <h5 className='font-medium text-sm'>2 mins away</h5>
                    <p className='font-medium text-xs text-gray-600'>Affordable, Auto rides</p>
                </div>
                <h2 className='text-2xl font-semibold'>&#8377;{fare.auto ?? 0}</h2>
            </div>
    </div>
  )
}

export default VehiclePanel
