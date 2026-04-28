import React, { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserDataContext } from '../context/UserDataContext'
import axios from 'axios'

const UserLogin = () => {
    const [email, setemail] = useState('')
    const [password, setpassword] = useState('')

    const { setUser } = useContext(UserDataContext)
    const navigate = useNavigate()

    const submitHandler =async(e)=>{
        e.preventDefault();
        const userData={
            email:email.trim().toLowerCase(),
            password:password
        }

        try{
            const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/users/login`, userData)

            if(response.status===200){
            const data = response.data
            setUser(data.user)
            localStorage.setItem('token',data.token)
            navigate('/home')
            }
        }catch(error){
            console.log(error)
        }
        setemail('')
        setpassword('')
    }
  return (
    <div className='p-7 h-screen flex flex-col justify-between'>
        <div>
        <img className='w-16 mb-2 ' src="https://freelogopng.com/images/all_img/1659761100uber-logo-png.png" alt="" />

        <div>
            <form onSubmit={(e)=>{
                submitHandler(e)
            }}>
            <h3 className='text-xl mb-2 font-medium'>What's your email</h3>
            <input 
            required 
            value={email}
            onChange={(e)=>{
                setemail(e.target.value);
            }}
            className='bg-[#eeeeee] mb-7 rounded px-4 py-2 border w-full text-lg placeholder:text-base'
            type="email" 
            placeholder='email@example.com' 
            />
            <h3 className='tex-xl font-medium mb-2'>Enter Password</h3>
            <input 
            className='bg-[#eeeeee] mb-7 rounded px-4 py-2 border w-full text-lg placeholder:text-base'
            value={password}
            onChange={(e)=>{
                setpassword(e.target.value);
            }}
            required type="Password" 
            placeholder ='password' />
            <button 
            className='bg-[#111] text-white font-semibold mb-3 rounded px-4 py-2 border w-full text-lg placeholder:text-base'>
                Login
            </button>
            <p className='text-center'>New here?<Link to='/signup' className='text-blue-600'>Create new Account </Link></p>
        </form>
        </div>
        </div>
        <div>
            <Link to='/captain-login' className='bg-[#10b461] flex items-center  text-white font-semibold mb-5 rounded px-4 py-2 border w-full text-lg placeholder:text-base'>Sign in as Captain</Link>
        </div>
        
    </div>
  )
}

export default UserLogin
