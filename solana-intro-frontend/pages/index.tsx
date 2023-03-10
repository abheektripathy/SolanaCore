import type { NextPage } from 'next'
import { useState } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import AddressForm from '../components/AddressForm'
import * as web3 from '@solana/web3.js'

const Home: NextPage = () => {
  const [balance, setBalance] = useState(0)
  const [address, setAddress] = useState('')
  const [exec, setExec] = useState(false)


  const keypairmera = web3.Keypair.generate()
  console.log(keypairmera.publicKey.toBase58())

  const keypairtera = web3.Keypair.generate()


  const Transac = new web3.Transaction()

  const sendSol = web3.SystemProgram.transfer( {
    fromPubkey: keypairmera.publicKey,
    toPubkey: keypairtera.publicKey,
    lamports: 100000
    
  })

  const addressSubmittedHandler = (address: string) => {
   try {
    const key = new web3.PublicKey(address);
    setAddress(address) 

    //connects to solana blockchain using rpc call
    const connection = new web3.Connection(web3.clusterApiUrl('devnet'))
    //now, uses connection to call getbalance() func from contract and then setbalance
    connection.getBalance(key).then((balance) => {
      //converts from lamports to sol
      setBalance(balance / web3.LAMPORTS_PER_SOL)
      
    })


    
   } catch (error) {
    setAddress('Invalid Address')
    setBalance(0)
    alert(error)
    
   }
   
    
  }

  //i cannot figure out how to display executable data , i can get it into console.log

const execornot = async (address:string) => {
  
  const key2 = new web3.PublicKey(address);
  
  const connection2 = new web3.Connection(web3.clusterApiUrl('devnet'))
  
  const resp = connection2.getAccountInfo(key2)
  const data = await resp.then((data)=>{
    const oka  = data?.executable
    setExec(//@ts-ignore
      data?.executable)
    console.log(oka)
    return data?.executable

  })




  
}



  

  return (
    <div className={styles.App}>
      <header className={styles.AppHeader}>
        <p>
          Start Your Solana Journey
        </p>
        <AddressForm handler={addressSubmittedHandler} />
        <p>{`Address: ${address}`}</p>
        <p>{`Balance: ${balance} SOL`}</p>
        <button onClick={() => execornot(address)}>executee</button>
        <p></p>
      </header>
    </div>
  )
}

export default Home
