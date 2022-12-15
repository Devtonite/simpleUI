
import Head from 'next/head';
import Image from 'next/image';
import styles from '../styles/Home.module.css';
import { useEffect, useState } from 'react';
import LocalMinaBlock from './LocalMinaBlock';

import {
  Mina,
  isReady,
  PublicKey,
  fetchAccount,
} from 'snarkyjs';



export default function Home() {

  return (
    <div className={styles.container}>
      <Head>
        <title>SimpleVal ZkApp</title>
        <meta name="description" content="Built by Devtonite" />
        <link rel="icon" href="/updownIcon.png" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Increment or Decrement?
        </h1>
        <h3>You Decide.</h3>

        <LocalMinaBlock />

        <div className={styles.grid}>
          <a href="https://nextjs.org/docs" className={styles.card}>
            <h2>Documentation &rarr;</h2>
            <p>Find in-depth information about Next.js features and API.</p>
          </a>

          <a href="https://nextjs.org/learn" className={styles.card}>
            <h2>Learn &rarr;</h2>
            <p>Learn about Next.js in an interactive course with quizzes!</p>
          </a>

        </div>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://github.com/Devtonite/simpleUI"
          target="_blank"
          rel="noopener noreferrer"
        >
          Built by Devtonite. 
        </a>
      </footer>
    </div>
  );
}

