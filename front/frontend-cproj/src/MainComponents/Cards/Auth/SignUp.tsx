import React from "react";
import '../../../Css/Cards/Auth/SignUp.css'
import { useState } from "react";

export default function Login(){
    const [username,setUsername]=useState<string>("");
    const[email,setEmail]=useState<string>("");
    const [password,setPassword]=useState<string>("");
    const handleEvent=(e:React.FormEvent<HTMLFormElement>)=>{
        e.preventDefault();
        console.log("Username",username);
        console.log("Email:", email);
        console.log("Password:", password); 
        getData();
    }
    async function getData(){
        const url="http://localhost:8000/users/register";
        const userData={username,email,password}
        try{
            const resp=await fetch(url,{method :"POST",headers: {
          "Content-Type": "application/json",
        },body: JSON.stringify(userData),});
            if(!resp.ok){
                throw new Error(`Response status: ${resp.status}`);
            }
            const res=await resp.json;
            console.log(res);
        }
        catch(error){
            console.log(error);
        };
        
    }
    function changeUsername(e:React.ChangeEvent<HTMLInputElement>){
        setUsername(e.target.value);
    }
    function changeEmail(e:React.ChangeEvent<HTMLInputElement>){    
        setEmail(e.target.value);
        
    }
    function changePass(e:React.ChangeEvent<HTMLInputElement>){
        setPassword(e.target.value);
    }
    return(
        <div className="SignUpBox">
            
            <form onSubmit={handleEvent} className="SignUpForm">
                <h2 className="Header">SignUp</h2>
                <div className="inputFields">
                    <input type="text" placeholder="Username" value={username} onChange={changeUsername} />
                    <input type="email" placeholder="Email" value={email} onChange={changeEmail}/>
                    <input type="password" placeholder="password" value={password} onChange={changePass}/>
                    <button type="submit" className="signUp-button">Sign In</button>
                </div>

            </form>
        </div>
    )
}