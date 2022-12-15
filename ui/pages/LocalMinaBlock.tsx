import React, { use } from 'react'
import styles from '../styles/Home.module.css';
import { useEffect, useState } from "react";
import ZkappWorkerClient from './zkappWorkerClient';

import {
  PublicKey,
  PrivateKey,
  Field,
} from 'snarkyjs'

let transactionFee = 0.1;

type Props = {}
export default function LocalMinaBlock({}: Props) {

  let [state, setState] = useState({
    zkappWorkerClient: null as null | ZkappWorkerClient,
    hasWallet: null as null | boolean,
    hasBeenSetup: false,
    accountExists: false,
    currentNum: null as null | Field,
    publicKey: null as null | PublicKey,
    zkappPublicKey: null as null | PublicKey,
    creatingTransaction: false,
  });

  useEffect(() => {
   (async () => {
    
    if(!state.hasBeenSetup){
      const zkappWorkerClient = new ZkappWorkerClient()
      await zkappWorkerClient.loadSnarkyJS()

      await zkappWorkerClient.setActiveInstanceToBerkeley();

      const mina = (window as any).mina;
      if (mina == null) {
        setState({ ...state, hasWallet: false });
        return;
      }

      const publicKeyBase58 : string = (await mina.requestAccounts())[0];
      const publicKey = PublicKey.fromBase58(publicKeyBase58);
      console.log('using key', publicKey.toBase58());

      console.log('checking if account exists...');
      const res = await zkappWorkerClient.fetchAccount({ publicKey: publicKey! });
      const accountExists = res.error == null;
      console.log(`Account Exists: ${accountExists}`)

      await zkappWorkerClient.loadContract();
      console.log('compiling contract...')
      await zkappWorkerClient.compileContract();
      console.log('contract compiled.')

      const zkappPublicKey = PublicKey.fromBase58('B62qph2VodgSo5NKn9gZta5BHNxppgZMDUihf1g7mXreL4uPJFXDGDA');
      await zkappWorkerClient.initZkappInstance(zkappPublicKey);

      console.log('getting zkApp state...');
      await zkappWorkerClient.fetchAccount({ publicKey: zkappPublicKey })
      const currentNum = await zkappWorkerClient.getSimpleVal();
      console.log('current state: ', currentNum.toString);

      setState({ 
        ...state, 
        zkappWorkerClient, 
        hasWallet: true,
        hasBeenSetup: true, 
        publicKey, 
        zkappPublicKey, 
        accountExists, 
        currentNum
    });

    }
   })()
  },[])

  
  useEffect(() => {
    (async () => {
      if (state.hasBeenSetup && !state.accountExists) {
        for (;;) {
          console.log('checking if account exists...');
          const res = await state.zkappWorkerClient!.fetchAccount({ publicKey: state.publicKey! })
          const accountExists = res.error == null;
          if (accountExists) {
            break;
          }
          await new Promise((resolve) => setTimeout(resolve, 5000));
        }
        setState({ ...state, accountExists: true });
      }
    })();
  }, [state.hasBeenSetup]);


  const onIncrementTxn = async () => {
    setState({ ...state, creatingTransaction: true });
    
    console.log('sending a transaction...');

    await state.zkappWorkerClient!.fetchAccount({ publicKey: state.publicKey! });
    await state.zkappWorkerClient!.createIncrementTxn();

    console.log('creating proof...');
    await state.zkappWorkerClient!.proveTxn();

    console.log('getting Transaction JSON...');
    const transactionJSON = await state.zkappWorkerClient!.getTransactionJSON()

    console.log('requesting send transaction...');
    const { hash } = await (window as any).mina.sendTransaction({
      transaction: transactionJSON,
      feePayer: {
        fee: transactionFee,
        memo: '',
      },
    });

    console.log(
      'See transaction at https://berkeley.minaexplorer.com/transaction/' + hash
    );

    setState({ ...state, creatingTransaction: false });
  }

  const onDecrementTxn = async () => {
    setState({ ...state, creatingTransaction: true });
    
    console.log('sending a transaction...');

    await state.zkappWorkerClient!.fetchAccount({ publicKey: state.publicKey! });
    await state.zkappWorkerClient!.createDecrementTxn();

    console.log('creating proof...');
    await state.zkappWorkerClient!.proveTxn();

    console.log('getting Transaction JSON...');
    const transactionJSON = await state.zkappWorkerClient!.getTransactionJSON()

    console.log('requesting send transaction...');
    const { hash } = await (window as any).mina.sendTransaction({
      transaction: transactionJSON,
      feePayer: {
        fee: transactionFee,
        memo: '',
      },
    });

    console.log(
      'See transaction at https://berkeley.minaexplorer.com/transaction/' + hash
    );

    setState({ ...state, creatingTransaction: false });
  }





  return (
    <div>
      <div className={styles.grid}>
        <div>Local Mina Blockchain:</div>
      </div>
    </div>
  )
}