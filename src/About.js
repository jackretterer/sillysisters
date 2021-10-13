import React from 'react';
import './App.css';
import twitter from './twitter.svg';
import github from './github.svg';
import discord from './discord.svg';
import rich from './images/49.jpg'

function About() {
    return (
        <div className="App">
            <header className="App-header">
                <h1 className="App-header-text">RichTheBear</h1>
            </header>

            <div class="aboutRow">
                <div class="aboutColumn">
                    <div className="aboutBox">
                        <img src={rich} alt="" className="aboutBear"/>
                    </div>
                </div>
                <div class="aboutColumn">
                    <p className="Act-desc">
                        Deep in the forest lurks a vengeful and deliberate bear. His sole purpose is to reclaim the forest and protect his natural habitat from the encroachment of man.
                    </p>
                    <p className="Act-desc">
                        RichTheBear has crafted and breeded 10,000 clones of himself to infiltrate human civilization to slowly corrupt and cripple the establishment.
                    </p>
                </div>
            </div>

            <footer className="App-footer">
                <a href="https://discord.gg/rUcQMzF7Ry" target="_blank" rel="noopener noreferrer">
                    <img src={discord} className="Social-logo" alt="Discord" />
                </a>
                <a href="https://twitter.com/RichtheBearNFTs" target="_blank" rel="noopener noreferrer">
                    <img src={twitter} className="Social-logo" alt="Twitter" />
                </a>
            </footer>
        </div>
    );
}

export default About;