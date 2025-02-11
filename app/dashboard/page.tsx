"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/firebaseConfig';
import withAuth from '@/app/hoc/withAuth';
import clsx from 'clsx';

const Dashboard = () => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div>
      <h1>Dashboard</h1>
      <h2>Just main page and nothing</h2>
    </div>
  );
};

export default withAuth(Dashboard);