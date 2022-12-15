// import { simpleVal } from './simpleVal.js';
// import {
//   isReady,
//   shutdown,
//   Field,
//   Mina,
//   PrivateKey,
//   AccountUpdate,
// } from 'snarkyjs';

// (async function main() {

//   // waiting for SnarkyJS
//   await isReady;
//   console.log('SnarkyJS loaded');

//   // loading local mina blockchain
//   const Local = Mina.LocalBlockchain();
//   Mina.setActiveInstance(Local);
//   const deployerAccount = Local.testAccounts[0].privateKey;

//   const useProof = false;

//   if (useProof) {
//     simpleVal.compile();
//   }

//   // ----------------------------------------------------

//   // create a destination we will deploy the smart contract to
//   const zkAppPrivateKey = PrivateKey.random();
//   const zkAppAddress = zkAppPrivateKey.toPublicKey();

//   // create an instance of Square - and deploy it to zkAppAddress
//   const zkAppInstance = new simpleVal(zkAppAddress);
//   const deploy_txn = await Mina.transaction(deployerAccount, () => {
//     AccountUpdate.fundNewAccount(deployerAccount);
//     zkAppInstance.deploy({ zkappKey: zkAppPrivateKey });
//     //zkAppInstance.sign(zkAppPrivateKey);
//   });
//   await deploy_txn.send();

//   // get the initial state of Square after deployment
//   const num0 = zkAppInstance.simpleVal.get();
//   console.log('state after init:', num0.toString());

//   // ----------------------------------------------------

//   // ----------------------------------------------------

//   const txn1 = await Mina.transaction(deployerAccount, () => {
//     zkAppInstance.increment();
//     zkAppInstance.sign(zkAppPrivateKey);
//   });
//   await txn1.send();

//   const num1 = zkAppInstance.simpleVal.get();
//   console.log('state after txn1:', num1.toString());

//   // ----------------------------------------------------

//   console.log('Shutting down');

//   await shutdown();
// })();
