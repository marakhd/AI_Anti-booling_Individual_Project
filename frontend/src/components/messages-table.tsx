"use client"

import { useEffect,useState } from "react"
import {
Table,
TableBody,
TableCell,
TableHead,
TableHeader,
TableRow
} from "@/components/ui/table"

import { Badge } from "@/components/ui/badge"

export default function MessagesTable(){

  const [messages,setMessages] = useState<any[]>([])

  useEffect(()=>{

    const token = localStorage.getItem("token")

    fetch("http://localhost:8000/messages",{
      headers:{
        Authorization:`Bearer ${token}`
      }
    })
    .then(r=>r.json())
    .then(setMessages)

  },[])

  return(

<Table>

<TableHeader>

<TableRow>
<TableHead>User</TableHead>
<TableHead>Chat</TableHead>
<TableHead>Message</TableHead>
<TableHead>Toxicity</TableHead>
</TableRow>

</TableHeader>

<TableBody>

{messages.map(m=>(

<TableRow key={m.id}>

<TableCell>{m.user}</TableCell>

<TableCell>{m.chat}</TableCell>

<TableCell>{m.text}</TableCell>

<TableCell>

<Badge variant={
  m.toxicity > 0.7
  ? "destructive"
  : "secondary"
}>

{m.toxicity.toFixed(2)}

</Badge>

</TableCell>

</TableRow>

))}

</TableBody>

</Table>

  )
}