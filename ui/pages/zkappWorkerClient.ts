import {
  fetchAccount,
  PublicKey,
  PrivateKey,
  Field,
} from 'snarkyjs'

import type { ZkappWorkerRequest, ZkappWorkerReponse, WorkerFunctions } from './zkappWorker';

export default class ZkappWorkerClient{

  worker: Worker;
  promises: { [id: number]: { resolve: (res: any) => void, reject: (err: any) => void } };
  nextId: number;

  constructor() {
    this.worker = new Worker(new URL('./zkappWorker.ts', import.meta.url))
    this.promises = {};
    this.nextId = 0;

    this.worker.onmessage = (event: MessageEvent<ZkappWorkerReponse>) => {
      this.promises[event.data.id].resolve(event.data.data);
      delete this.promises[event.data.id];
    };
  }

  _call(fn: WorkerFunctions, args: any) {
    return new Promise((resolve, reject) => {
      this.promises[this.nextId] = { resolve, reject }

      const message: ZkappWorkerRequest = {
        id: this.nextId,
        fn,
        args,
      };

      this.worker.postMessage(message);

      this.nextId++;
    });
  }

  loadSnarkyJS(){
    return this._call('loadSnarkyJS', {});
  }

  setActiveInstanceToBerkeley(){
    return this._call('setActiveInstanceToBerkeley', {});
  }

  // startLocalMina(){
  //   return this._call('startLocalMina', {});
  // }

  // stopLocalMina(){
  //   return this._call('stopLocalMina', {});
  // }

  loadContract(){
    return this._call('loadContract', {});
  }

  compileContract(){
    return this._call('compileContract', {});
  }

  fetchAccount({ publicKey }: { publicKey: PublicKey }): ReturnType<typeof fetchAccount>{
    const result = this._call('fetchAccount', { publicKey58: publicKey.toBase58() });
    return (result as ReturnType<typeof fetchAccount>);
  }

  initZkappInstance(publicKey: PublicKey) {
    return this._call('initZkappInstance', { publicKey58: publicKey.toBase58() });
  }

  async getSimpleVal(): Promise<Field> {
    const result = await this._call('getSimpleVal', {});
    return Field.fromJSON(JSON.parse(result as string));
  }

  createIncrementTxn() {
    return this._call('createIncrementTxn', {});
  }

  createDecrementTxn() {
    return this._call('createDecrementTxn', {});
  }

  proveTxn() {
    return this._call('proveTxn', {});
  }

  async getTransactionJSON() {
    const result = await this._call('getTransactionJSON', {});
    return result;
  }

}