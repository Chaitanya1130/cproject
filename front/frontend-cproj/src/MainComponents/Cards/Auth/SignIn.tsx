import React from "react";
import { useState } from "react";

import { useNavigate } from "react-router-dom";


export default function SignIn(){ 
    const nav=useNavigate();
    const [username,setUsername]=useState<string>("");
    const [password,setPassword]=useState<string>("");
    const handleEvent=(e:React.FormEvent<HTMLFormElement>)=>{
        e.preventDefault();
        console.log("Username",username);
        console.log("Password:", password); 
        getData();
    }
    async function getData(){
        const url="http://localhost:8000/users/login";
        const userData={username,password}
        try{
            const resp=await fetch(url,{method :"POST",headers: {
          "Content-Type": "application/json",
        },body: JSON.stringify(userData),});
            if(!resp.ok){
                throw new Error(`Response status: ${resp.status}`);
            }
            const res=await resp.json();
            console.log(res);
            localStorage.setItem("token",res.token);
            localStorage.setItem("user",JSON.stringify(res.user));
            nav("/userhome");
    }
        catch(error){
            console.log(error);
        };
        
    }
        
    
    function changeUsername(e:React.ChangeEvent<HTMLInputElement>){
        setUsername(e.target.value);
    }

    function changePass(e:React.ChangeEvent<HTMLInputElement>){
        setPassword(e.target.value);
    }
return(
        <div className="SignUpBox">
            <form onSubmit={handleEvent} className="SignUpForm">
                <h2 className="Header">Sign In</h2>
                <div className="inputFields">
                    <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
                    <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    
                    <button type="submit" className="signIn-button">Sign In</button>
                </div>
            </form>
        </div>

    )
};