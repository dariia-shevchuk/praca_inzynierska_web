"use client"

import * as React from "react"
import { Check, ChevronsUpDown, GalleryVerticalEnd } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { auth, db } from "@/firebaseConfig"
import { doc, getDoc } from "firebase/firestore"
import { signOut } from "firebase/auth"
import { useRouter } from 'next/navigation';
import withAuth from '@/app/hoc/withAuth';
import clsx from 'clsx';
import { onAuthStateChanged } from "firebase/auth";

export function VersionSwitcher({
  versions,
  defaultVersion,
}: {
  versions: string[]
  defaultVersion: string
}) {
  const [selectedVersion, setSelectedVersion] = React.useState(defaultVersion)

  const [name, setName] = React.useState('');
  const [surname, setSurname] = React.useState('');
  
  const router = useRouter();

  const handleLogout = async () => {
      try {
        await signOut(auth);
        router.push('/login');
      } catch (error) {
        console.error('Error logging out:', error);
      }
    };
    
    React.useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          try {
            const teacherRef = doc(db, "users", user.uid);
            const teacherSnapshot = await getDoc(teacherRef);
            const teacher = teacherSnapshot.data();
    
            if (teacher) {
              setName(teacher.name);
              setSurname(teacher.surname);
            }
          } catch (error) {
            console.error("Error fetching teacher data:", error);
          }
        } else {
          setName("");
          setSurname("");
        }
      });
    
      return () => unsubscribe(); // Cleanup listener when component unmounts
    }, []);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <GalleryVerticalEnd className="size-4" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-semibold">{name} {surname}</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width]"
            align="start"
          >
            
              <DropdownMenuItem
                key="Log Out"
                onSelect={() => handleLogout()}
              >
                Log Out
              </DropdownMenuItem>
            
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
