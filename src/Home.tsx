import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Countdown from "react-countdown";
import { Button, CircularProgress, Snackbar, ThemeProvider } from "@material-ui/core";
// import { white } from '@material-ui/core/colors';
import {createTheme} from '@mui/material/styles';
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
import richTitle from './RichTitle.png'
import Bandana_Black from './images/traits/accessories/Bandana_Black.jpg'
import Bandana_Red from './images/traits/accessories/Bandana_Red.jpg'
import Joint from './images/traits/accessories/Joint.jpg'
import Pipe from './images/traits/accessories/Pipe.jpg'
import Mic from './images/traits/accessories/Mic.jpg'
import Chain from './images/traits/drip/Chain.jpg'
import Piercings from './images/traits/drip/Piercings.jpg'
import Laser from './images/traits/drip/Laser.png'
import Angry from './images/traits/expressions/Angry.jpg'
import Crying_Laughing from './images/traits/expressions/Crying_Laughing.jpg'
import Crying from './images/traits/expressions/Crying.jpg'
import Eyes_Closed from './images/traits/expressions/Eyes_Closed.jpg'
import Grimace from './images/traits/expressions/Grimace.jpg'
import Happy from './images/traits/expressions/Happy.jpg'
import Surprised from './images/traits/expressions/Surprised.jpg'
import Tattoos from './images/traits/expressions/Tattoos.jpg'
import BlueShirt from './images/traits/shirts/Blue_Shirt.png'
import Boo from './images/traits/shirts/Boo.png'
import Dress_Shirt_Cardigan from './images/traits/shirts/Dress_Shirt_Cardigan.png'
import Dress_Shirt from './images/traits/shirts/Dress_Shirt.png'
import Hawaiian_Shirt_Orange from './images/traits/shirts/Hawaiian_Shirt_Orange.png'
import Hoodie_Grey from './images/traits/shirts/Hoodie_Grey.png'
import Hoodie_Misfits from './images/traits/shirts/Hoodie_Misfits.png'
import Inmate from './images/traits/shirts/Inmate.png'
import Jersey from './images/traits/shirts/Jersey.png'
import Rainbow_Shirt from './images/traits/shirts/Rainbow_Shirt.png'
import Thrasher_Hoodie from './images/traits/shirts/Thrasher_Hoodie.png'
import Wife_Beater from './images/traits/shirts/Wife_Beater.png'
import Xmas_Sweater from './images/traits/shirts/Xmas_Sweater.png'
import Aviator_Hat from './images/traits/hats/Aviator_Hat.png'
import Ball_Cap from './images/traits/hats/Ball_Cap.png'
import Beanie_Red from './images/traits/hats/Beanie_Red.png'
import Bucket_Hat_Black from './images/traits/hats/Bucket_Hat_Black.png'
import Bucket_Hat_Yellow from './images/traits/hats/Bucket_Hat_Yellow.png'
import Cowboy_Hat from './images/traits/hats/Cowboy_Hat.png'
import Pilot_Hat from './images/traits/hats/Pilot_Hat.png'
import Forest from './images/traits/backgrounds/Forest.jpg'
import Halloween from './images/traits/backgrounds/Halloween.jpg'
import Mountains from './images/traits/backgrounds/Mountains.jpg'
import Mug from './images/traits/backgrounds/Mug.jpg'
import Rick from './images/traits/backgrounds/Rick.jpg'
import Trippy from './images/traits/backgrounds/Trippy.jpg'
import rarityChart from './images/rarityChart.png'
import GlassesReading from './images/traits/glasses/Glasses_Reading.png'
import GlassesRound from './images/traits/glasses/Glasses_Round.png'
import PitVipers from './images/traits/glasses/Pit_Vipers.png'

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

import { createMuiTheme } from '@material-ui/core/styles';
import { Grid, Row, Col } from 'react-flexbox-grid';

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

 declare global {
   interface ThemeOptions {
       themeName?: string  // optional
   }
 }

 export type buttonType = typeof palette;

 export const palette = {
  primary: "#3f51b5",
  secondary: "#f50057",
 }

 const buttonColor = palette;

 


const Home = (props: HomeProps) => {
  const [balance, setBalance] = useState<number>();
  const [isActive, setIsActive] = useState(false); // true when countdown completes
  const [isSoldOut, setIsSoldOut] = useState(false); // true when items remaining is zero
  const [isMinting, setIsMinting] = useState(false); // true when user got to press MINT

  const [itemsAvailable, setItemsAvailable] = useState(0);
  const [itemsRedeemed, setItemsRedeemed] = useState(0);
  const [itemsRemaining, setItemsRemaining] = useState(0);

  const [traitSelected, setTraitSelected] = React.useState("base");

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

  const handleTraitClick  = (id) => {
    setTraitSelected(id)
  }

  const blueButton = {
    color: '#4250ae',
    border: 2,
  } as const;


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
                  <Countdown date={startDate} onMount={({ completed }) => completed && setIsActive(true)} onComplete={() => setIsActive(true)} renderer={renderCounter} />
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

      <div className="App-First-Page">
        <div className="App">
          <header className="App-header">
            <h1 className="App-header-text">
              <img src={richTitle} className="App-header-image" alt=""/>
            </h1>
          </header>
          <p className="App-header-desc">
            Join the mysterious and crafty mastermind in his mission to reclaim the forest and cripple mankind.
          </p>
        </div>
        <div className="adopt-Recruit">
          <div className="adoptRow">
            <div className="adoptColumn">
              <h1 className="adopt-header-text">Who is Rich The Bear?</h1>
              <p className="adopt-desc">
                Deep in the forest lurks a cunning and mysterious mastermind whose sole goal is to protect his natural habitat from the encroachment of man.
              </p>
              <p className="adopt-desc">
                Humans have ruled long enough and their destructive reign has left the planet vulnerable, stained and in ruin.
                It's about time that nature fights back. Help Rich reclaim his home! 
              </p>
            </div>
            <div className="adoptColumn">
              <div className="aboutBox">
                <img src={elGif} alt="" className="adoptionBear" />
              </div>
            </div>
            </div>
        </div>
        <div className="aboutRow">
          <div className="aboutColumn">
            <div className="aboutBox">
              <div className="gallery">
                <figure className="gallery_item gallery_item_1">
                  <img src={halloween} className="gallery_img" alt="" />
                </figure>
                <figure className="gallery_item gallery_item_2">
                  <img src={rainbowBear} className="gallery_img" alt="" />
                </figure>
                <figure className="gallery_item gallery_item_3">
                  <img src={mountainBear} className="gallery_img" alt="" />
                </figure>
                <figure className="gallery_item gallery_item_4">
                  <img src={sailorBear} className="gallery_img" alt="" />
                </figure>
              </div>
            </div>
          </div>
          <div className="aboutColumn">
            <h1 className="who-text">Adopt a Recruit:</h1>
            <p className="who-desc">
                A master of disguises, RichTheBear has created 10,000 clones of himself to infiltrate human civilization 
                and undermine the establishment.
            </p>
            <p className="who-desc">
                Each bear is hand-drawn and designed by a female-led team whose goal is to empower women
                to explore, learn and participate in the quickly growing Blockchain industry.
            </p>
          </div>
        </div>

        <div className="traits">
          <header className="traits-header"><img style={{maxWidth: "100%"}} src={rarityChart} ></img></header>
            <div className="traits-nav">
              <Grid fluid>
                <Row style={{ justifyContent: "center" }}>
                  <Col><Button id="base" className="traits-button" style={{ color: traitSelected === "base" ? "white" : "black", backgroundColor: traitSelected === "base" ? "#3f51b5" : "white" }} variant="contained" onClick={() => handleTraitClick("base")}>Base</Button></Col>
                  <Col><Button id="shirts" className="traits-button" style={{ color: traitSelected === "shirts" ? "white" : "black", backgroundColor: traitSelected === "shirts" ? "#3f51b5" : "white" }} variant="contained" onClick={() => handleTraitClick("shirts")}>Shirts</Button></Col>
                  <Col><Button id="hats" className="traits-button" style={{ color: traitSelected === "hats" ? "white" : "black", backgroundColor: traitSelected === "hats" ? "#3f51b5" : "white" }} variant="contained" onClick={() => handleTraitClick("hats")}>Hats</Button></Col>
                  <Col><Button id="accessories" className="traits-button" style={{ color: traitSelected === "accessories" ? "white" : "black", backgroundColor: traitSelected === "accessories" ? "#3f51b5" : "white" }} variant="contained" onClick={() => handleTraitClick("accessories")}>Accessories</Button></Col>
                  <Col><Button id="background" className="traits-button" style={{ color: traitSelected === "background" ? "white" : "black", backgroundColor: traitSelected === "background" ? "#3f51b5" : "white" }} variant="contained" onClick={() => handleTraitClick("background")}>Background</Button></Col>
                </Row>
              </Grid>
            </div>
            <div className="traits-main">
                <div id="base" className="traits-wrap" style={{display: traitSelected !== "base" ? "none" : ""}}>
                <Grid fluid>
                    <Row style={{ justifyContent: "center" }}>    
                      <Col>
                        <img src={Angry} alt="" className="traits-img"></img>
                        <p className="traits-text">Angry: 35%</p>
                      </Col>
                      <Col>
                        <img src={Crying} alt="" className="traits-img"></img>
                        <p className="traits-text">Crying: 5%</p>
                      </Col>
                      <Col>
                        <img src={Crying_Laughing} alt="" className="traits-img"></img>
                        <p className="traits-text">Crying-Laughing: 3%</p>
                      </Col>
                      <Col>
                        <img src={Eyes_Closed} alt="" className="traits-img"></img>
                        <p className="traits-text">Eyes_Closed: 12%</p>
                      </Col>
                      <Col>
                        <img src={Grimace} alt="" className="traits-img"></img>
                        <p className="traits-text">Grimace: 15%</p>
                      </Col>
                      <Col>
                        <img src={Happy} alt="" className="traits-img"></img>
                        <p className="traits-text">Happy: 20%</p>
                      </Col>
                      <Col>
                        <img src={Surprised} alt="" className="traits-img"></img>
                        <p className="traits-text">Surprised: 10%</p>
                      </Col>
                      <Col>
                        <img src={Tattoos} alt="" className="traits-img"></img>
                        <p className="traits-text">Tattoos: 30%</p>
                      </Col>
                    </Row>
                  </Grid>
                </div>
                <div id="shirts" className="traits-wrap" style={{display: traitSelected !== "shirts" ? "none" : ""}}>
                <Grid fluid>
                    <Row style={{ justifyContent: "center" }}>
                      <Col>
                        <img src={BlueShirt} alt="" className="traits-img"></img>
                        <p className="traits-text">Blue Shirt: 15%</p>
                      </Col>
                      <Col>
                        <img src={Boo} alt="" className="traits-img"></img>
                        <p className="traits-text">Boo: 1%</p>
                      </Col>
                      <Col>
                        <img src={Dress_Shirt_Cardigan} alt="" className="traits-img"></img>
                        <p className="traits-text">Cardigan: 15%</p>
                      </Col>
                      <Col>
                        <img src={Dress_Shirt} alt="" className="traits-img"></img>
                        <p className="traits-text">Dress Shirt: 17%</p>
                      </Col>
                      <Col>
                        <img src={Hawaiian_Shirt_Orange} alt="" className="traits-img"></img>
                        <p className="traits-text">Hawaiian Shirt: 13%</p>
                      </Col>
                      <Col>
                        <img src={Hoodie_Misfits} alt="" className="traits-img"></img>
                        <p className="traits-text">Skull Hoodie: 3%</p>
                      </Col>
                      <Col>
                        <img src={Inmate} alt="" className="traits-img"></img>
                        <p className="traits-text">Inmate: 5%</p>
                      </Col>
                      <Col>
                        <img src={Jersey} alt="" className="traits-img"></img>
                        <p className="traits-text">Jersey: 6%</p>
                      </Col>
                      <Col>
                        <img src={Rainbow_Shirt} alt="" className="traits-img"></img>
                        <p className="traits-text">Rainbow Shirt: 1%</p>
                      </Col>
                      <Col>
                        <img src={Thrasher_Hoodie} alt="" className="traits-img"></img>
                        <p className="traits-text">Fire Hoodie: 7%</p>
                      </Col>
                      <Col>
                        <img src={Wife_Beater} alt="" className="traits-img"></img>
                        <p className="traits-text">Wife Beater: 15%</p>
                      </Col>
                      <Col>
                        <img src={Xmas_Sweater} alt="" className="traits-img"></img>
                        <p className="traits-text">Xmas Sweater: 2%</p>
                      </Col>
                    </Row>
                  </Grid>
                </div>
                <div id="hats" className="traits-wrap" style={{display: traitSelected !== "hats" ? "none" : ""}}>
                  <Grid fluid>
                    <Row style={{ justifyContent: "center" }}>
                      <Col>
                        <img src={Aviator_Hat} alt="" className="traits-img"></img>
                        <p className="traits-text">Aviator Hat: 3%</p>
                      </Col>
                      <Col>
                        <img src={Ball_Cap} alt="" className="traits-img"></img>
                        <p className="traits-text">Baseball Hat: 10%</p>
                      </Col>
                      <Col>
                        <img src={Beanie_Red} alt="" className="traits-img"></img>
                        <p className="traits-text">Beanie: 14%</p>
                      </Col>
                      <Col>
                        <img src={Bucket_Hat_Black} alt="" className="traits-img"></img>
                        <p className="traits-text">Black Bucket Hat: 20%</p>
                      </Col>
                      <Col>
                        <img src={Bucket_Hat_Yellow} alt="" className="traits-img"></img>
                        <p className="traits-text">Yellow Bucket Hat: 20%</p>
                      </Col>
                      <Col>
                        <img src={Cowboy_Hat} alt="" className="traits-img"></img>
                        <p className="traits-text">Cowboy Hat: 8%</p>
                      </Col>
                      <Col>
                        <img src={Pilot_Hat} alt="" className="traits-img"></img>
                        <p className="traits-text">Pilot Hat: 5%</p>
                      </Col>
                    </Row>
                  </Grid>
                </div>
                <div id="accessories" className="traits-wrap" style={{display: traitSelected !== "accessories" ? "none" : ""}}>
                  <Grid fluid>
                    <Row style={{ justifyContent: "center" }}>
                      <Col>
                        <img src={GlassesRound} alt="" className="traits-img"></img>
                        <p className="traits-text">Hippie Glasses: 10%</p>
                      </Col>
                      <Col>
                        <img src={GlassesReading} alt="" className="traits-img"></img>
                        <p className="traits-text">Reading Glasses: 10%</p>
                      </Col>
                      <Col>
                        <img src={PitVipers} alt="" className="traits-img"></img>
                        <p className="traits-text">Pit Vipers: 3%</p>
                      </Col>
                      <Col>
                        <img src={Mic} alt="" className="traits-img"></img>
                        <p className="traits-text">Mic: 1%</p>
                      </Col>
                      <Col>
                        <img src={Bandana_Black} alt="" className="traits-img"></img>
                        <p className="traits-text">Black Banadana: 10%</p>
                      </Col>
                      <Col>
                        <img src={Bandana_Red} alt="" className="traits-img"></img>
                        <p className="traits-text">Red Bandana: 10%</p>
                      </Col>
                      <Col>
                        <img src={Chain} alt="" className="traits-img"></img>
                        <p className="traits-text">Chain: 5%</p>
                      </Col>
                      <Col>
                        <img src={Piercings} alt="" className="traits-img"></img>
                        <p className="traits-text">Piercings: 5%</p>
                      </Col>
                      <Col>
                        <img src={Laser} alt="" className="traits-img"></img>
                        <p className="traits-text">Lasers: 3%</p>
                      </Col>
                      <Col>
                        <img src={Joint} alt="" className="traits-img"></img>
                        <p className="traits-text">Joint: 5%</p>
                      </Col>
                      <Col>
                        <img src={Pipe} alt="" className="traits-img"></img>
                        <p className="traits-text">Pipe: 5%</p>
                      </Col>
                    </Row>
                  </Grid>
                </div>
                <div id="background" className="traits-wrap" style={{display: traitSelected !== "background" ? "none" : ""}}>
                <Grid fluid>
                    <Row style={{ justifyContent: "center" }}>
                      <Col>
                        <img src={Mountains} alt="" className="traits-img"></img>
                        <p className="traits-text">Slopes: 15%</p>
                      </Col>
                      <Col>
                        <img src={Trippy} alt="" className="traits-img"></img>
                        <p className="traits-text">Trip City: 15%</p>
                      </Col>
                      <Col>
                        <img src={Halloween} alt="" className="traits-img"></img>
                        <p className="traits-text">Halloween: 10%</p>
                      </Col>
                      <Col>
                        <img src={Forest} alt="" className="traits-img"></img>
                        <p className="traits-text">Forest: 20%</p>
                      </Col>
                      <Col>
                        <img src={Mug} alt="" className="traits-img"></img>
                        <p className="traits-text">Mugshot: 20%</p>
                      </Col>
                      <Col>
                        <img src={Rick} alt="" className="traits-img"></img>
                        <p className="traits-text">Space Portal: 20%</p>
                      </Col>
                    </Row>
                  </Grid>
                </div>      
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
                  <p>Create an army of disguised colorful bears seeking revenge on humankind.</p>
                  <p className="roadmap"> Website:</p>
                  <p>Build a website from scratch to showcase RichTheBear and his clones.</p>
                  <p className="roadmap"> Discord:</p>
                  <p>Release our public Discord server run by women!</p>
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
                  <p>Be part of the minting process of 10,000 unique bear clones!</p>
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
                  <p>We plan on making all NFT creation tools available to the community and accessible to the next generation of talented artists.</p>
                  <p className="roadmap">Crypto Education and Women Involvement:</p>
                  <p>Actively recruit and teach women about crypto and blockchain technologies!</p>
                  <p className="roadmap">Donation:</p>
                  <p>Donate a portion of all profits to planting trees to combat climate change!!</p>
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