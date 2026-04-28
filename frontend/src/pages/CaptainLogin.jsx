import React from 'react'
import {Link} from 'react-router-dom'
import {useState} from 'react'
import {useNavigate} from 'react-router-dom'
import axios from 'axios'
import {CaptainDataContext} from '../context/CaptainContext'

const CaptainLogin = () => {
        const [email, setemail] = useState('')
        const [password, setpassword] = useState('')
        const [errorMessage, setErrorMessage] = useState('')

        const {captain, setCaptain} =React.useContext(CaptainDataContext)
        const navigate = useNavigate()
        
    
    
    
        const submitHandler =async(e)=>{
            e.preventDefault();
            setErrorMessage('')

            const captain = {
                email:email.toLowerCase().trim(),
                password
            }

            try {
                const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/captains/login`,captain)
               
                if(response.status===200){
                    const data= response.data

                    setCaptain(data.captain)
                    localStorage.setItem('token',data.token)
                    navigate('/captain-home')
                }
            } catch (error) {
                setErrorMessage(
                    error.response?.data?.message || 'Unable to connect to the server. Please make sure the backend is running.'
                )
            }

            setemail('')
            setpassword('')
        }
  return (
    <div>
         <div className='p-7 h-screen flex flex-col justify-between'>
                <div>
                <img className='w-20 mb-2 ' src="https://freelogopng.com/images/all_img/1659761100uber-logo-png.png" alt="" />
        
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
                    className='bg-[#111] text-white font-semibold mb-3 rounded px-4 py-2 border w-full text-lg placeholder:text-base'>Login
                   </button>
                    {errorMessage && <p className='text-sm text-red-600 mb-3'>{errorMessage}</p>}
                    <p className='text-center'>Join a fleet?<Link to='/captain-signup' className='text-blue-600'>Register as Captain</Link></p>
                </form>
                </div>
                </div>
                <div>
                    <Link to='/captain-login' className='bg-[#d5622d] flex items-center  text-white font-semibold mb-5 rounded px-4 py-2 border w-full text-lg placeholder:text-base'>Sign in as User</Link>
                </div>
                
            </div>
    </div>
  )
}

export default CaptainLogin
