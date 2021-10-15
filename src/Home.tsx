import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Countdown from "react-countdown";
import { Button, CircularProgress, Snackbar } from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import { BrowserRouter } from 'react-router-dom';

import './App.css';
import twitter from './twitter.svg';
import discord from './discord.svg';
import elGif from './images/elGif.gif'
import halloween from './images/halloween.jpg'
import mountainBear from './images/mountainBear.jpg'
import sailorBear from './images/sailorBear.jpg'
import rainbowBear from './images/rainbowBear.jpg'

import * as anchor from "@project-serum/anchor";

import { LAMPORTS_PER_SOL } from "@solana/web3.js";

import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { WalletDialogButton } from "@solana/wallet-adapter-material-ui";

import {
  CandyMachine,
  awaitTransactionSignatureConfirmation,
  getCandyMachineState,
  mintOneToken,
  shortenAddress,
} from "./candy-machine";

const ConnectButton = styled(WalletDialogButton)`front-size: 1em; margin: 1em; color: black; border: 2px solid ${props => props.theme.main};`;

const CounterText = styled.span``; // add your styles here

const MintContainer = styled.div`color: red;`; // add your styles here

const MintButton = styled(WalletDialogButton)`front-size: 1em; margin: 2em; color: green; border: 2px solid ${props => props.theme.main};`; // add your styles here

export interface HomeProps {
  candyMachineId: anchor.web3.PublicKey;
  config: anchor.web3.PublicKey;
  connection: anchor.web3.Connection;
  startDate: number;
  treasury: anchor.web3.PublicKey;
  txTimeout: number;
}

const Home = (props: HomeProps) => {
  const [balance, setBalance] = useState<number>();
  const [isActive, setIsActive] = useState(false); // true when countdown completes
  const [isSoldOut, setIsSoldOut] = useState(false); // true when items remaining is zero
  const [isMinting, setIsMinting] = useState(false); // true when user got to press MINT

  const [itemsAvailable, setItemsAvailable] = useState(0);
  const [itemsRedeemed, setItemsRedeemed] = useState(0);
  const [itemsRemaining, setItemsRemaining] = useState(0);

  const [alertState, setAlertState] = useState<AlertState>({
    open: false,
    message: "",
    severity: undefined,
  });

  const [startDate, setStartDate] = useState(new Date(props.startDate));

  const wallet = useAnchorWallet();
  const [candyMachine, setCandyMachine] = useState<CandyMachine>();

  const refreshCandyMachineState = () => {
    (async () => {
      if (!wallet) return;

      const {
        candyMachine,
        goLiveDate,
        itemsAvailable,
        itemsRemaining,
        itemsRedeemed,
      } = await getCandyMachineState(
        wallet as anchor.Wallet,
        props.candyMachineId,
        props.connection
      );

      setItemsAvailable(itemsAvailable);
      setItemsRemaining(itemsRemaining);
      setItemsRedeemed(itemsRedeemed);

      setIsSoldOut(itemsRemaining === 0);
      setStartDate(goLiveDate);
      setCandyMachine(candyMachine);
    })();
  };

  const onMint = async () => {
    try {
      setIsMinting(true);
      if (wallet && candyMachine?.program) {
        const mintTxId = await mintOneToken(
          candyMachine,
          props.config,
          wallet.publicKey,
          props.treasury
        );

        const status = await awaitTransactionSignatureConfirmation(
          mintTxId,
          props.txTimeout,
          props.connection,
          "singleGossip",
          false
        );

        if (!status?.err) {
          setAlertState({
            open: true,
            message: "Congratulations! Mint succeeded!",
            severity: "success",
          });
        } else {
          setAlertState({
            open: true,
            message: "Mint failed! Please try again!",
            severity: "error",
          });
        }
      }
    } catch (error: any) {
      // TODO: blech:
      let message = error.msg || "Minting failed! Please try again!";
      if (!error.msg) {
        if (error.message.indexOf("0x138")) {
        } else if (error.message.indexOf("0x137")) {
          message = `SOLD OUT!`;
        } else if (error.message.indexOf("0x135")) {
          message = `Insufficient funds to mint. Please fund your wallet.`;
        }
      } else {
        if (error.code === 311) {
          message = `SOLD OUT!`;
          setIsSoldOut(true);
        } else if (error.code === 312) {
          message = `Minting period hasn't started yet.`;
        }
      }

      setAlertState({
        open: true,
        message,
        severity: "error",
      });
    } finally {
      if (wallet) {
        const balance = await props.connection.getBalance(wallet.publicKey);
        setBalance(balance / LAMPORTS_PER_SOL);
      }
      setIsMinting(false);
      refreshCandyMachineState();
    }
  };

  useEffect(() => {
    (async () => {
      if (wallet) {
        const balance = await props.connection.getBalance(wallet.publicKey);
        setBalance(balance / LAMPORTS_PER_SOL);
      }
    })();
  }, [wallet, props.connection]);

  useEffect(refreshCandyMachineState, [
    wallet,
    props.candyMachineId,
    props.connection,
  ]);

  return (

    <BrowserRouter>
      <header className="Nav-bar">
          <div className="Nav-socials">
            <a href="https://discord.gg/rUcQMzF7Ry" target="_blank" rel="noopener noreferrer">
                <img src={discord} className="Social-logo" alt="Discord" />
            </a>
            <a href="https://twitter.com/RichtheBearNFTs" target="_blank" rel="noopener noreferrer">
                <img src={twitter} className="Social-logo" alt="Twitter" />
            </a>
          </div>
      <div className="Nav-links">
                            {/* {wallet && (<p className="walletText">Wallet {shortenAddress(wallet.publicKey.toBase58() || "")}</p>)}
                            {wallet && <p className="walletText">Balance: {(balance || 0).toLocaleString()} SOL</p>}
                            {wallet && <p className="walletText">Total Available: {itemsAvailable}</p>}
                            {wallet && <p className="walletText">Redeemed: {itemsRedeemed}</p>} */}
                            {wallet && <p className="walletText">Remaining Bears: {itemsRemaining}</p>}
                            <MintContainer>
                              {!wallet ? (<ConnectButton>Connect Wallet</ConnectButton>) : (
                                // <div className="walletContainer">
                                //   <div className="walletMain">
                                    <MintButton disabled={isSoldOut || isMinting || !isActive} onClick={onMint} variant="contained">
                                      {isSoldOut ? ("SOLD OUT") : isActive ? (isMinting ? (<CircularProgress />) : <div className="walletMint">MINT</div>) : (
                                        <Countdown date={startDate} onMount={({ completed }) => completed && setIsActive(true)} onComplete={() => setIsActive(true)} renderer={renderCounter}/>
                                      )}
                                    </MintButton>
                                //   </div>    
                                // </div>  
                              )}
                            </MintContainer>

                            <Snackbar open={alertState.open} autoHideDuration={6000} onClose={() => setAlertState({ ...alertState, open: false })}>
                              <Alert onClose={() => setAlertState({ ...alertState, open: false })} severity={alertState.severity}> {alertState.message} </Alert>
                            </Snackbar>        
      </div>
      </header>
    
      <div className="App">
            <header className="App-header">
                <h1 className="App-header-text">Welcome to the Forest</h1>
            </header>
            <p className="App-header-desc">
                Join Rich in his mission to reclaim the forest and protect his                       
            </p>
            <p className="App-header-desc">
                natural habitat from the enchroachment of man.
            </p> 
      </div>

      <div className="adopt-Recruit">
                <div className="adoptRow">
                    <div className="adoptColumn">
                        <h1 className="adopt-header-text">Adopt a Recruit:</h1>
                            <p className="adopt-desc">
                                Deep in the forest lurks a vengeful and deliberate bear. His sole purpose is to reclaim the forest and protect his natural habitat from the encroachment of man.
                            </p>
                            <p className="adopt-desc">
                                RichTheBear has crafted and breeded 10,000 clones of himself to infiltrate human civilization to slowly corrupt and cripple the establishment.
                            </p>                           
                    </div>
                    <div className="adoptColumn">
                        <div className="aboutBox">
                        <img src={elGif} alt="" className="adoptionBear"/>
                        </div>
                    </div>
                </div>
      </div>                                  

      <div className="App-First-Page">
            <div className="aboutRow">
                <div className="aboutColumn">
                    <div className="aboutBox">
                        <div className="gallery">
                            <figure className="gallery_item gallery_item_1">
                                <img src={halloween} className="gallery_img" alt=""/>
                            </figure>
                            <figure className="gallery_item gallery_item_2">
                                <img src={rainbowBear} className="gallery_img" alt=""/>
                            </figure>
                            <figure className="gallery_item gallery_item_3">
                                <img src={mountainBear} className="gallery_img" alt=""/>
                            </figure>
                            <figure className="gallery_item gallery_item_4">
                                <img src={sailorBear} className="gallery_img" alt=""/>
                            </figure>
                        </div>
                    </div>
                </div>
                <div className="aboutColumn">
                    <h1 className="who-text">Who Are They?</h1>
                        <p className="who-desc">
                            RichTheBear has crafted and breeded 10,000 clones of himself to infiltrate human civilization to slowly corrupt and cripple the establishment.
                        </p>
                        <p className="who-desc">
                            Explore even more bears and even adopt your own on Solana.
                        </p>
                </div>
            </div>

                <header>
                    <meta charSet="UTF-8"></meta>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0"></meta>
                    <title>Vertical Dark Timeline</title>
                    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"></link>
                </header>
                <body>
                    <div className="container">
                        <div className="timeline">
                            <div className="timeline-container primary">
                                <div className="timeline-icon">
                                    <i className="fa-li fa fa-check-square"></i>
                                </div>
                                <div className="timeline-body">
                                    <h4 className="timeline-title"><span className="badge">Completed</span></h4>
                                    <p className="roadmap">Artwork:</p>
                                    <p>Publish an army of vengeful bears seeking dedeption on humankind for nature's destruction.</p>
                                    
                                    <p className="roadmap"> Website:</p>
                                    <p>Publish an army of vengeful bears seeking dedeption on humankind for nature's destruction.</p>
                                    <p className="roadmap"> Discord:</p>
                                    <p>Released our public Discord server run by Women!</p>                                    
                                    <p className="timeline-subtitle">Summer 2021</p>
                                </div>
                            </div>
                            <div className="timeline-container danger">
                                <div className="timeline-icon">
                                      <i className="fa-li fa fa-square"></i>                
                                </div>
                                <div className="timeline-body">
                                    <h4 className="timeline-title"><span className="badge">Present</span></h4>
                                    <p className="roadmap">Minting:</p>
                                    <p>Be part of the minting process  of 10,000 unique bears!</p>
                                    <p className="timeline-subtitle">Fall 2021</p>
                                </div>
                            </div>
                            <div className="timeline-container success">
                                <div className="timeline-icon">
                                    <i className="fa-li fa fa-square"></i>
                                </div>
                                <div className="timeline-body">
                                    <h4 className="timeline-title"><span className="badge">Future</span></h4>
                                    <p className="roadmap">OpenSource:</p>
                                    <p>We plan on making all NFT creation tools available to the community and accessible to the next generation of talented artists!</p>
                                    <p className="roadmap">Crypto Education and Women Involvment:</p>
                                    <p>Actively teach, include and recruit women into crypto and blockchain technologies!</p>
                                    <p className="roadmap">Donation:</p>
                                    <p>Donate a portion of all profits to planting trees to combat climate change!!!</p>
                                    <p className="timeline-subtitle">Winter 2021</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </body>
                {/* </div> */}
        </div>
    </BrowserRouter>
  );
};

interface AlertState {
  open: boolean;
  message: string;
  severity: "success" | "info" | "warning" | "error" | undefined;
}

const renderCounter = ({ days, hours, minutes, seconds, completed }: any) => {
  return (
    <CounterText>
      {hours + (days || 0) * 24} hours, {minutes} minutes, {seconds} seconds
    </CounterText>
  );
};

export default Home;