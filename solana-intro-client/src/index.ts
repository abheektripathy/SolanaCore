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
    signer: Web3.PublicKey, connection: Web3.Connection) {

        const balance = await connection.getBalance(signer);
        console.log("Balance: ", balance/Web3.LAMPORTS_PER_SOL, 'SOL');
        //balance check krega 

        if(balance/Web3.LAMPORTS_PER_SOL <1) {
            console.log("Airdropping SOL to account 🚀");
            
            //this is the sig, which requests the airsrop
            const airdropSignature = await connection.requestAirdrop(
                signer,
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

            const newBalance = await connection.getBalance(signer);
            console.log('New balance is 🎉', newBalance / Web3.LAMPORTS_PER_SOL, 'SOL');
           
        } else{
            console.log("Account already has SOL 💰, bich dont be greedy");
        }



}

//the address of the program/contract itself
const PROGRAM_ID = new Web3.PublicKey("ChT1B39WKLS8qUrkLvFDXMhEJ4F1XZzwUNHUt4AU9aVa")
//yeh neeche waala acc stores the acc ka public key jismein us smart comntract ka data hai
const PROGRAM_DATA_PUBLIC_KEY = new Web3.PublicKey("Ah9K7dQ8EHaZqcAsgBW8w37yN2eAy3koFmUn4x3CJtod")

//remember everything works in form of transactions on solana.
//ek transaction hota hai aur fir uske kaise carry out karna uska instruction
//instruction should have (The public keys of all the accounts the instruction will read/write) 
//and (The program id of the program that will execute the instruction)
//and (The data that the program will use to execute the instruction)
//remember here we're using a already written smart contract to call its funcs, which is frontend work.

async function ping(connection: Web3.Connection, pair: Web3.Keypair) {
    const transaction = new Web3.Transaction()
    const instruction = new Web3.TransactionInstruction({
        keys: [
            {
                //this contains key of the person who is doing the txn , 
                //since this write doesn't require a signature from the data account, we set isSigner to false.
                pubkey: PROGRAM_DATA_PUBLIC_KEY,
                isSigner: false,
                isWritable: true
            }
        ],
        //smart contract waala account bhi chahiye, bhai konse code/program ka use karke transact karna? yeh batata yeh.
        programId: PROGRAM_ID,
        //there's no data here.
    })

    transaction.add(instruction);
    //now we gotta sign the txn to prove ki hum he karrahe using secret key.
    const transactionSignature = await Web3.sendAndConfirmTransaction(connection, transaction, [pair])

    console.log(
        `Transaction https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`
        )



}

async function sendSol(connection : Web3.Connection, amount: number, to: Web3.PublicKey, sender: Web3.Keypair) {
    const transaction = new Web3.Transaction()

    const sendSolInstruction = Web3.SystemProgram.transfer(
        {
            fromPubkey: sender.publicKey,
            toPubkey: to, 
            lamports: amount*Web3.LAMPORTS_PER_SOL,
        }
    )

    transaction.add(sendSolInstruction)

    const sig = await Web3.sendAndConfirmTransaction(connection, transaction, [sender])
    console.log(`You can view your transaction on the Solana Explorer at:\nhttps://explorer.solana.com/tx/${sig}?cluster=devnet`);
}


async function main() {
    const connection = new Web3.Connection(Web3.clusterApiUrl('devnet'))
    //devnet pe connect ho rha
    //const keypair = await initializekeypair(connection);
    //keypair generate mere func se
    //console.log("Public key: ", keypair.publicKey.toBase58());
    //generated keypair aur connection ka use karke rpc calls via we talked to the nodes.
    const pubb = new Web3.PublicKey('651yky3ijgSPyPZ8L5s1izSbnh5xDHb4GSATk8JLbzsK')
    await Airdropifbroke(pubb, connection);

    //const transferkeypair =  Web3.Keypair.generate()
    //console.log(transferkeypair.publicKey.toBase58)

    //await ping(connection, keypair);
    //await sendSol(connection, 0.1,transferkeypair.publicKey, keypair)
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
