"use client";

import classes from './page.module.css'

import { useState } from "react";
import { useSocket } from "../context/SocketProvider";

export default function Page() {
  const [message, setMessage] = useState('');
  const {sendMessage, messages} = useSocket();

  return (
    <div>
      <div>
        <h1>All message will appear here</h1>
      </div>
      <div>
        <input type="text" onChange={e=> setMessage(e.target.value)} className={classes["chat-input"]} />
        <button onClick={e => sendMessage(message)} className={classes["button"]}>Send</button>
      </div>
      <div>
        {messages.map((e) => (
          <li key={Math.random()}>{e}</li>  
        ))}
      </div>
    </div>
  )
}