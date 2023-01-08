import * as Web3 from '@solana/web3.js';
import * as fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();


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

async function main() {
    const connection = new Web3.Connection(Web3.clusterApiUrl('devnet'))
    //devnet pe connect ho rha
    const keypair = await initializekeypair(connection);
    //keypair generate mere func se
    console.log("Public key: ", keypair.publicKey.toBase58());
    //generated keypair aur connection ka use karke rpc calls via we talked to the nodes.
    await Airdropifbroke(keypair, connection);
}


main()
    .then(() => {
        console.log("Finished successfully")
        process.exit(0)
    })
    .catch((error) => {
        console.log(error)
        process.exit(1)
    })
