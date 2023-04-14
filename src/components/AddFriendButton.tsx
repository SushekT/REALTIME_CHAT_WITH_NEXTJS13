"use client";

import { addFriendValidator } from "@/lib/validations/add-friend";
import axios, { AxiosError } from "axios";
import { useForm } from 'react-hook-form'
import { FC, useState } from "react";
import { z } from "zod";
import { zodResolver } from '@hookform/resolvers/zod'
import Button from "./ui/Button";


interface AddFriendButtonProps {}

type FormData = z.infer<typeof addFriendValidator>

const AddFriendButton: FC<AddFriendButtonProps> = ({}) => {
  const [showSuccessState, setShowSuccessState] = useState<boolean>()

  const { register, handleSubmit, setError, formState: {errors} } = useForm<FormData>({
    resolver: zodResolver(addFriendValidator),
  })

  const addFriend = async(email:string) => {
    try {
        const validatedEmail = addFriendValidator.parse({ email })

        await axios.post('/api/friends/add', {
            email: validatedEmail,
        })
        setShowSuccessState(true)
    } catch (error){
        if (error instanceof z.ZodError){
            setError('email', {message:error.message})
            return 
        }

        if (error instanceof AxiosError){
            setError('email', {message: error.response?.data})
            return 
        }
        setError('email', {message: 'Something went wrong !!!'})
    }
  }

  const onSubmit = (data: FormData) =>{
    addFriend(data.email)
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)} className='max-w-sm'>
      <label
        htmlFor="email"
        className="block text-sm font-medium loading-6 text-gray-900"
      >
        Add Friend By E-Mail
      </label>

      <div className="mt-2 flex gap-4">
        <input
          {...register('email')}
          type="text"
          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading"
          placeholder="example@example.com"
        />
        <Button>Add</Button>
      </div>
      <p className="mt-1 text-sm text-red-600">{ errors.email?.message}</p>
      { showSuccessState ? (
        <p className="mt-1 text-sm text-green-600">Cool! Friend Request Sent!</p>
      ): null}
    </form>
  );
};

export default AddFriendButton;
