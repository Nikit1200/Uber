import React, { useContext } from 'react'
import { CaptainDataContext } from '../context/CaptainContext'

const CaptainDetails = () => {
    const { captain } = useContext(CaptainDataContext);
    const fullName = captain?.fullname
        ? `${captain.fullname.firstname || ''} ${captain.fullname.lastname || ''}`.trim()
        : 'Captain';

  return (
    <div>
            <div className='flex items-center justify-between'>
        <div className='flex items-center justify-start gap-3'>
            <img className='h-10 w-10 rounded-full object-cover' src="https://allprodad.com/wp-content/uploads/2021/03/05-12-21-happy-people.jpg" alt="" />
            <h4 className='text-lg font-medium capitalize'>{fullName}</h4>
        </div>
        <div>
            <h4 className='text-xl font-semibold'>₹295.79</h4>
            <p className='text-sm text-gray-600'>earned</p>
        </div>
    </div>
    <div className='flex p-3 mt-6 bg-gray-100 rounded-xl justify-center gap-5 items-start'>
        <div className='text-center'>
            <i className="text-2xl font-think ri-timer-2-line"></i>
            <h5 className='text-lg font-medium'>10.2</h5>
            <p className='text-sm text-gray-600'>Hours Online</p>
        </div>
        <div className='text-center'>
            <i className="text-2xl font-thin ri-speed-up-line"></i>
             <h5 className='text-lg font-medium'>10.2</h5>
            <p className='text-sm text-gray-600'>Hours Online</p>
        </div>
        <div className='text-center'>
            <i className="text-2xl font-thin ri-booklet-line"></i>
             <h5 className='text-lg font-medium'>10.2</h5>
            <p className='text-sm text-gray-600'>Hours Online</p>
        </div>
    </div>
    </div>
  )
}

export default CaptainDetails
