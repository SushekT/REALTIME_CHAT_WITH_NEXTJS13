'use client'

import { Loader2, LogOut } from 'lucide-react'
import { signOut } from 'next-auth/react'
import {ButtonHTMLAttributes, FC, useState} from 'react'
import toast from 'react-hot-toast'
import Button from './ui/Button'

interface SignOutButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {

}

const SignOutButton: FC<SignOutButtonProps> = ({ ...props }) => {
    const [isSignOut, setIsSignOut] = useState<boolean>(false)
  return (
    <Button {...props} variant='ghost' onClick={async() =>{
        setIsSignOut(true)
        try {
            await signOut()
        } catch(error) {
            toast.error('There is problem going on while signing out')
        } finally{
            setIsSignOut(false)
        }
    }}>
        {isSignOut ? (
            <Loader2 className='animate-spin h-4 w-4' />
        ):
        (
            <LogOut className='w-4 h-4' />
        )}
    </Button>
  )
}


export default SignOutButton
