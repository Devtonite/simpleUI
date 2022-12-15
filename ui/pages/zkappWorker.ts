import {
  Mina,
  isReady,
  PublicKey,
  PrivateKey,
  Field,
  fetchAccount,
  shutdown,
} from 'snarkyjs'
import {simpleVal} from "../../contracts/src/simpleVal"

type Transaction = Awaited<ReturnType<typeof Mina.transaction>>

const state = {

  simpleVal: null as null | typeof simpleVal,
  zkapp: null as null | simpleVal,
  transaction: null as null | Transaction,
}

const functions = {

  loadSnarkyJS: async (args:{}) => {
    console.log('Loading SnarkyJS');
    await isReady
    console.log('SnarkyJS Load Complete.');
  },

  setActiveInstanceToBerkeley: async (args: {}) => {
    const Berkeley = Mina.Network(
      "https://proxy.berkeley.minaexplorer.com/graphql"
    );
    Mina.setActiveInstance(Berkeley);
  },

  // startLocalMina: async (args:{}) => {
  //   console.log('Starting Local Mina Blockchain...');
  //   const local = Mina.LocalBlockchain()
  //   Mina.setActiveInstance(local)
  //   console.log('Started Local Mina Blockchain');
  // },

  // stopLocalMina: async (args:{}) => {
  //   console.log('Shutting Down Local Mina Blockchain...');
  //   await shutdown()
  //   console.log('Shutdown Complete.')
  // },

  loadContract: async (args:{}) => {
    const {simpleVal} = await import('../../contracts/build/src/simpleVal.js')
    state.simpleVal = simpleVal
  },

  compileContract:async (args:{}) => {
    await state.simpleVal!.compile()
  },

  fetchAccount: async (args: { publicKey58: string }) => {
    const publicKey = PublicKey.fromBase58(args.publicKey58)
    return await fetchAccount({ publicKey })
  },
  
  initZkappInstance: async (args: { publicKey58: string }) => {
    const publicKey = PublicKey.fromBase58(args.publicKey58);
    state.zkapp = new state.simpleVal!(publicKey);
  },

  getSimpleVal: async (args: {}) => {
    const currentNum = await state.zkapp!.simpleVal.get();
    return JSON.stringify(currentNum.toJSON());
  },

  createIncrementTxn: async (args: {}) => {
    const transaction = await Mina.transaction(() => {
        state.zkapp!.increment();
      }
    );
    state.transaction = transaction;
  },

  createDecrementTxn: async (args: {}) => {
    const transaction = await Mina.transaction(() => {
        state.zkapp!.decrement();
      }
    );
    state.transaction = transaction;
  },

  proveTxn: async (args: {}) => {
    await state.transaction!.prove();
  },

  getTransactionJSON: async (args: {}) => {
    return state.transaction!.toJSON();
  },
}

export type WorkerFunctions = keyof typeof functions;

export type ZkappWorkerRequest = {
  id: number,
  fn: WorkerFunctions,
  args: any
}

export type ZkappWorkerReponse = {
  id: number,
  data: any
}

if (process.browser) {
  addEventListener('message', async (event: MessageEvent<ZkappWorkerRequest>) => {

    const returnData = await functions[event.data.fn](event.data.args);
    const message: ZkappWorkerReponse = {
      id: event.data.id,
      data: returnData,
    }
    postMessage(message)
  })
}

