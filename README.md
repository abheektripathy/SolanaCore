# SolanaCore
putting all my enhancements and assignments from solana core here. cc buildspace :)


okay so how transactions work in general- 

you have your basic- `pub key, pvt key`

to do a transaction: 

send x sol to y account

you need apna acc `pub key`, amount and `other acc pub key` and then you send it through with a `rpc`, now to prove that you’re the one doing the transaction you need to `sign it,` and that happens using `your pvt key.` 

once the txn is signed it can go through.

plus a small gas fees. to approve txn

you have proved by signing that you actually own the acc and you’re doing the txn.

txn graph



**account types sol:**

- [ ]  DATA ACC
    - [ ]  system owned
    - [ ]  pda
- [ ]  NATIVE
    
    stores vote/stake waali cheeze
    
- [ ]  CONTRACT/PROGRAM
    
    yeh toh apna contract hai aur kya.
    
    `metadata of every acc`
    
    | lamports | The number of lamports owned by this account |
    | --- | --- |
    | owner | The program owner of this account |
    | executable | Whether this account can process instructions (is executable) |
    | data | The raw data byte array stored by this account |
    | rent_epoch | The next epoch that this account will owe rent |
    
    how does it work then?
    
    ![Untitled](SolanaCore%203d8f44c42d7e47729bd5b7e128cbae92/Untitled%201.png)
    
    so you have your `executables accounts`(smart contracts written on rust) `deployed` to the network.
    
    you can access those deployed smart contracts using `json rpc calls via a client,` you can use the `js sdk` for `next.js apps` for example
    
    if you have your own smart contract then also, you can use the sdk to access uske functions in frontend.
    
    interesting right?
    
    making rpc call to get balance of a account using solana js sdk
    
    ```tsx
    import * as web3 from '@solana/web3.js'
    
    const [balance, setBalance] = useState(0)
    const [address, setAddress] = useState('')
    
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
    ```
    
     
    
    ### `okay writing to sol`
    
    you can generate key pairs via this func
    
    but first import
    
    ```tsx
    import * as Web3 from '@solana/web3.js';
    import * as fs from 'fs';
    import dotenv from 'dotenv';
    dotenv.config();
    ```
    
    `initialisekeypair()`
    
    ```tsx
    async function initializekeypair(connection: Web3.Connection): Promise<Web3.Keypair>{
        //(connection: Web3.Connection) yeh paramater jo chahiye fucntion ke liye uska type define kar rha bc typesafety.
        if(!process.env.PRIVATE_KEY) {
            console.log("No private key found in .env file, generating 🛠️");
            const signer = Web3.Keypair.generate();
    
            console.log("Saving private key to .env file 🗝️");
            fs.writeFileSync('.env',`PRIVATE_KEY=[${signer.secretKey.toString()}]`);
    
            return signer;
        }
    
        //PRIVATE_KEY mein pvt key generated jaayegi  usko secure karne ke liye we parse it as number array
        //
    
        const secret = JSON.parse(process.env.PRIVATE_KEY ?? "") as number[];
        
        const secretKey = Uint8Array.from(secret);
        
        const keypairFromSecret = Web3.Keypair.fromSecretKey(secretKey);
        //secret key se generate horha pura pair
        return keypairFromSecret;
    }
    ```
    
    checks paisa hai agar nahi toh `requestsairdrop()`
    
    creates txn
    
    confirms txn
    
    ```tsx
    async function Airdropifbroke( // just a way of defining parameters
        signer: Web3.Keypair, connection: Web3.Connection) {
    
            const balance = await connection.getBalance(signer.publicKey);
            console.log("Balance: ", balance/Web3.LAMPORTS_PER_SOL, 'SOL');
            //balance check krega 
    
            if(balance/Web3.LAMPORTS_PER_SOL <1) {
                console.log("Airdropping SOL to account 🚀");
                
                //this is the sig, which requests the airsrop
                const airdropSignature = await connection.requestAirdrop(
                    signer.publicKey,
                    1*Web3.LAMPORTS_PER_SOL
                );
    
                    //this here gets latest
                const latestblockhash = await connection.getLatestBlockhash();
    
                //this here confirms the transaction
                await connection.confirmTransaction({
                    blockhash: latestblockhash.blockhash,
                    lastValidBlockHeight: latestblockhash.lastValidBlockHeight,
                    signature: airdropSignature
                });
    
                const newBalance = await connection.getBalance(signer.publicKey);
                console.log('New balance is 🎉', newBalance / Web3.LAMPORTS_PER_SOL, 'SOL');
               
            } else{
                console.log("Account already has SOL 💰, bich dont be greedy");
            }
    
    }
    ```
    
    and in the main function we’re gonna first make a connection to rpc then use `initialisekeypair()` to make a account and `requestairdrop()` to get sol into that account
    
    ```tsx
    async function main() {
        const connection = new Web3.Connection(Web3.clusterApiUrl('devnet'))
        //devnet pe connect ho rha
        const keypair = await initializekeypair(connection);
        //keypair generate mere func se
        console.log("Public key: ", keypair.publicKey.toBase58());
        //generated keypair aur connection ka use karke rpc calls via we talked to the nodes.
        await Airdropifbroke(keypair, connection);
    }
    ```
