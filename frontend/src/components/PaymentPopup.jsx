import React from 'react'

const PaymentPopup = ({ ride, onPaymentSuccess }) => {
  const driverName = ride?.captain?.fullname
    ? `${ride.captain.fullname.firstname || ''} ${ride.captain.fullname.lastname || ''}`.trim()
    : 'Sarthak'
  const licensePlate = ride?.captain?.vehicle?.plate || 'MP04 AB 1234'
  const vehicleModel = ride?.captain?.vehicle?.vehicleType || 'Maruti Suzuki Alto'
  const pickupAddress = ride?.pickup || '562/11-A'
  const pickupLocation = ride?.pickupDetails || 'Kankariya Talab, Bhopal'
  const fare = typeof ride?.fare === 'number' ? ride.fare.toFixed(2) : ride?.fare || '193.20'
  const paymentType = ride?.paymentMethod || 'Cash Cash'

  return (
    <div className='relative -mt-5 rounded-t-[2rem] bg-white px-5 pb-5 pt-4 shadow-[0_-18px_42px_rgba(15,23,42,0.12)]'>
      <div className='mb-4 flex justify-center'>
        <div className='h-1.5 w-14 rounded-full bg-slate-200'></div>
      </div>

      <div className='flex items-center justify-between gap-4'>
        <img
          className='h-12 w-18 object-contain'
          src='https://www.pngplay.com/wp-content/uploads/8/Uber-PNG-Photos.png'
          alt='Vehicle'
        />

        <div className='text-right'>
          <h2 className='text-[1.05rem] font-semibold leading-6 text-slate-900'>{driverName}</h2>
          <h3 className='text-[1.35rem] font-bold tracking-tight text-slate-900'>{licensePlate}</h3>
          <p className='text-sm text-slate-500 capitalize'>{vehicleModel}</p>
        </div>
      </div>

      <div className='mt-5 border-t border-slate-200 pt-3'>
        <div className='flex items-start gap-4 border-b border-slate-200 pb-4'>
          <div className='flex h-10 w-10 items-center justify-center text-slate-800'>
            <i className='ri-map-pin-2-fill text-xl'></i>
          </div>
          <div>
            <h4 className='text-[1.05rem] font-semibold text-slate-900'>{pickupAddress}</h4>
            <p className='mt-0.5 text-sm leading-6 text-slate-500'>{pickupLocation}</p>
          </div>
        </div>

        <div className='flex items-start gap-4 pt-4'>
          <div className='flex h-10 w-10 items-center justify-center text-slate-800'>
            <i className='ri-wallet-3-line text-xl'></i>
          </div>
          <div>
            <h4 className='text-[1.55rem] font-bold tracking-tight text-slate-900'>₹{fare}</h4>
            <p className='mt-0.5 text-sm text-slate-500'>{paymentType}</p>
          </div>
        </div>
      </div>

      <button
        type='button'
        onClick={onPaymentSuccess}
        className='mt-5 block h-12 w-full rounded-xl bg-[#18a84b] px-4 text-[1rem] font-semibold text-white shadow-[0_10px_25px_rgba(24,168,75,0.24)] transition hover:bg-[#14913f]'
      >
        Make a Payment
      </button>
    </div>
  )
}

export default PaymentPopup
