import React from 'react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import {CaptainDataContext} from '../context/CaptainContext'
import {useNavigate} from 'react-router-dom'
import axios from 'axios'


const CaptainSignup = () => {

    const navigate = useNavigate()

      const [email, setemail] = useState('')
      const [password, setpassword] = useState('')
      const [firstName, setfirstName] = useState('')
      const [lastName, setlastName] = useState('')
      const [userData, setuserData] = useState({})


      const [vehicleColor, setVehicleColor]= useState('')
      const [vehiclePlate,setVehiclePlate] = useState('')
      const [vehicleCapacity, setVehicleCapacity]=useState('')
      const [VehicleType, setVehicleType] = useState('')
      const {captain ,setCaptain} = React.useContext(CaptainDataContext)
  
      const submitHandler=async(e)=>{
          e.preventDefault()
          const captainData={
              fullname:{
                  firstname:firstName,
                  lastname:lastName
              },
              email:email,
              password:password,
              vehicle:{
                color:vehicleColor,
                plate:vehiclePlate,
                capacity:vehicleCapacity,
                vehicleType:VehicleType
              }
          }

          const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/captains/register`,captainData)

          if(response.status===201){
            const data = response.data
            setCaptain(data.captain)
            localStorage.setItem('token',data.token)
            navigate('/captain-home')
          }
          
          setemail('')
          setfirstName('')
          setlastName('')
          setpassword('')
          setVehicleColor('')
          setVehiclePlate('')
          setVehicleCapacity('')
          setVehicleType('')
      }
  return (
    
      <div className='py-5 px-5 h-screen flex flex-col justify-between'>
        <div>
        <img className='w-16 mb-5 ' src="https://freelogopng.com/images/all_img/1659761100uber-logo-png.png" alt="" />

        <div>
            <form onSubmit={(e)=>{
                submitHandler(e)
            }}>

            <h3 className='text-lg mb-2 font-medium'>What's our Captain's name</h3>
            <div className='flex gap-4 mb-6'>
            <input 
            required 
           
            className='bg-[#eeeeee] w-1/2  rounded px-4 py-2 border  text-lg placeholder:text-base'
            type="text" 
            placeholder='First name' 
            value={firstName}
            onChange={(e)=>{
                setfirstName(e.target.value)
            }}
            />
            <input 
            required 
            className='bg-[#eeeeee] w-1/2  rounded px-4 py-2 border text-lg placeholder:text-base'
            type="text" 
            placeholder='Last name'
            value={lastName}
            onChange={(e)=>{
                setlastName(e.target.value)
            }}
            />
           </div>
            <h3 className='text-base mb-2 font-medium'>What's our Captain's email</h3>
            <input 
            required
            value={email}
            onChange={(e)=>{
                setemail(e.target.value)
            }} 
           
            className='bg-[#eeeeee] mb-6 rounded px-4 py-2 border w-full text-base placeholder:text-sm'
            type="text" 
            placeholder='email@example.com' 
            />
            
            <h3 className='tex-base font-medium mb-2'>Enter Password</h3>
            <input 
            className='bg-[#eeeeee] mb-7 rounded px-4 py-2 border w-full text-lg placeholder:text-base'
            value={password}
            onChange={(e)=>{
                setpassword(e.target.value)
            }}
            required type="Password" 
            placeholder ='password' />
            
            
            <h3 className='text-base mb-2 font-medium'>Vehicle Information</h3>
            <div className='flex gap-4 mb-6'>
                <input 
                    required
                    className='bg-[#eeeeee] w-1/2 rounded px-4 py-2 border text-lg placeholder:text-base'
                    type="text" 
                    placeholder='Vehicle Color' 
                    value={vehicleColor}
                    onChange={(e) => setVehicleColor(e.target.value)}
                />
                <input 
                    required
                    className='bg-[#eeeeee] w-1/2 rounded px-4 py-2 border text-lg placeholder:text-base'
                    type="text" 
                    placeholder='Vehicle Plate' 
                    value={vehiclePlate}
                    onChange={(e) => setVehiclePlate(e.target.value)}
                />
            </div>
            <div className='flex gap-4 mb-6'>
                <input 
                    required
                    className='bg-[#eeeeee] w-1/2 rounded px-4 py-2 border text-lg placeholder:text-base'
                    type="number" 
                    placeholder='Vehicle Capacity' 
                    value={vehicleCapacity}
                    onChange={(e) => setVehicleCapacity(e.target.value)}
                />
                <select 
                    required
                    className='bg-[#eeeeee] w-1/2 rounded px-4 py-2 border text-lg'
                    value={VehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                >
                    <option value="">Select Vehicle Type</option>
                    <option value="car">Car</option>
                    <option value="auto">Auto</option>
                    <option value="motorcycle">Moto</option>
                </select>
            </div>

            <button 
            className='bg-[#111] text-white font-semibold mb-3 rounded px-4 py-2 border w-full text-lg placeholder:text-base'>
                Create Captain Account
            </button>
            <p className='text-center'>Already have a account?<Link to='/captain-login' className='text-blue-600'>Login here </Link></p>
        </form>
        </div>
        </div>
        <div>
           <p className='text-[10px] lead'>This site is protected by reCAPTCHA and <span className='underline'>the Google Privacy Policy</span> and <span className='underline'>Terms of Service apply</span>.
            </p>
        </div>
        
    </div>
    
  )
}

export default CaptainSignup
