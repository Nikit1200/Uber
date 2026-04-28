import React, { useState } from 'react'
import { Link , useNavigate } from 'react-router-dom'
import axios from 'axios'
import { UserDataContext } from '../context/UserDataContext'


const UserSignup = () => {

    const [email, setemail] = useState('')
    const [password, setpassword] = useState('')
    const [firstName, setfirstName] = useState('')
    const [lastName, setlastName] = useState('')
    const navigate = useNavigate()
    const { setUser } = React.useContext(UserDataContext)

    const submitHandler=async(e)=>{
        e.preventDefault()
        const newUser={
            fullname:{
                firstname:firstName,
                lastname:lastName
            },
            email:email.trim().toLowerCase(),
            password:password
        
        }

        try{
            const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/users/register`,newUser)
            if(response.status === 201){
                const data= response.data
                
                setUser(data.user)
                localStorage.setItem('token',data.token)
                navigate('/home')

            }
        }catch(error){
            console.log(error)
        }
        setemail('')
        setfirstName('')
        setlastName('')
        setpassword('')
    }
  return (
    
        <div className='p-7 h-screen flex flex-col justify-between'>
        <div>
        <img className='w-16 mb-5 ' src="https://freelogopng.com/images/all_img/1659761100uber-logo-png.png" alt="" />

        <div>
            <form onSubmit={(e)=>{
                submitHandler(e)
            }}>

            <h3 className='text-lg mb-2 font-medium'>What's your name</h3>
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
            <h3 className='text-base mb-2 font-medium'>What's your email</h3>
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
            <button 
            className='bg-[#111] text-white font-semibold mb-3 rounded px-4 py-2 border w-full text-lg placeholder:text-base'>
                Creat Account
            </button>
            <p className='text-center'>Already have a account?<Link to='/login' className='text-blue-600'>Login here </Link></p>
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

export default UserSignup
