import * as bip39 from "bip39";
var { wordList } = require("../wordList.js");
import React, { useEffect, useState } from "react";
import Slider from "react-input-slider";
const defaultBetValue = 0;
const maxBetValue = 1000;
const maxGuessValue = 5;
import prettyNum from "pretty-num";

export default function Home() {
  const [seed, setSeed] = useState("");
  const [entropyBits, setEntropyBits] = useState("");
  const [hexString, setHexString] = useState("");
  // setLastWordArray
  const [lastWordArray, setLastWordArray] = useState([]);
  // setWinStatus
  const [winStatus, setWinStatus] = useState(null);
  // setActiveWord
  const [activeWord, setActiveWord] = useState("");
  // setGameOver
  const [gameOver, setGameOver] = useState(false);
  // betValue
  const [betValue, setBetValue] = useState(defaultBetValue);
  // guessIndex
  const [guessIndex, setGuessIndex] = useState(0);
  // setGuessArray
  const [guessArray, setGuessArray] = useState([]);

  useEffect(() => {
    let mnemonic = bip39.generateMnemonic();
    setSeed(mnemonic);
    let mnemonicArray = mnemonic.split(" ");
    let localBinary = "";
    for (let i = 0; i < mnemonicArray.length; i++) {
      let index = wordList.indexOf(mnemonicArray[i]);
      let binary = index.toString(2);
      let paddedBinary = binary.padStart(11, "0");
      localBinary += paddedBinary;
    }
    setEntropyBits(localBinary.slice(0, -4));
  }, []);

  useEffect(() => {
    if (winStatus != null) {
      setGameOver(true);
    }
  }, [winStatus]);

  useEffect(() => {
    let hexString = "";
    chunkArrayOfBits(entropyBits, 4).map((nibble) => {
      hexString += parseInt(nibble, 2).toString(16);
    });
    setHexString(hexString);
    // Get last seven digits of entropyBits
    let lastSeven = entropyBits.slice(-7);
    console.log("lastSeven");
    // create a array 1-15 of binary strings
    let binaryArray = [];
    for (let i = 0; i < 16; i++) {
      binaryArray.push(i.toString(2).padStart(4, "0"));
    }
    let lastWordCandidates = [];
    binaryArray
      .map((binary) => lastSeven + binary)
      .map((binary) => {
        // convert binary to decimal, map to wordList
        let decimal = parseInt(binary, 2);
        let word = wordList[decimal];
        lastWordCandidates.push(word);
      });
    setLastWordArray(lastWordCandidates);
  }, [entropyBits]);

  useEffect(() => {
    let binaryString = "";
    for (let i = 0; i < hexString.length; i++) {
      let binaryHex = parseInt(hexString[i], 16).toString(2);
      let paddedBinaryHex = binaryHex.padStart(4, "0");
      binaryString += paddedBinaryHex;
    }
    let binaryArray = [];
    for (let i = 0; i < 16; i++) {
      let paddedBinary = i.toString(2).padStart(4, "0");
      binaryArray.push(paddedBinary);
    }
    binaryArray.map((b) => {
      let potentialBinary = binaryString + b;
      let sections = chunkArrayOfBits(potentialBinary, 11);
      let potentialSeed = [];
      sections.map((section) => {
        let decimal = parseInt(section, 2);
        potentialSeed.push(wordList[decimal]);
      });
      if (bip39.validateMnemonic(potentialSeed.join(" "))) {
        setSeed(potentialSeed.join(" "));
        setEntropyBits(binaryString);
      }
    });
  }, [hexString]);

  const chunkArrayOfBits = (arr, size) => {
    return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
      arr.slice(i * size, i * size + size)
    );
  };
  const changeHex = async ({ index }) => {
    await new Promise((resolve) => setTimeout(resolve, 10));
    let hexAlpabet = [
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "a",
      "b",
      "c",
      "d",
      "e",
      "f",
    ];
    let hexName = hexAlpabet[Math.floor(Math.random() * hexAlpabet.length)];
    let newHexString = hexString;
    newHexString =
      newHexString.substring(0, index) +
      hexName +
      newHexString.substring(index + 1);
    setHexString(newHexString);
  };
  const checkAnswer = ({ word = "zoo", wagerAmount = 10 }) => {
    console.log(betValue == 0);
    if (betValue == 0) {
      return seed.split(" ").pop() == word;
    } else {
      console.log("Generate invoice for " + wagerAmount);
    }
  };

  const recordLoss = ({ word }) => {
    let newGuessIndex = guessIndex + 1;
    setGuessIndex(newGuessIndex);
    setGuessArray([...guessArray, word]);
    if (newGuessIndex == maxGuessValue) {
      setWinStatus(false);
    } else {
      console.log("Guess index: " + newGuessIndex);
      console.log("# of guesses remaining", maxGuessValue - newGuessIndex);
    }
  };
  return (
    <>
      <div className="flex flex-row justify-center">
        <div className="w-5/6 p-3">
          {/* <p className='text-2xl pt-10 pb-10'>{entropyBits}</p> */}
          {winStatus ? (
            <p className="text-2xl pt-10 pb-10 text-center text-6xl text-green-400 font-bold">
              WINNER
            </p>
          ) : null}
          {winStatus == false && gameOver ? (
            <p className="text-2xl pt-10 pb-10 text-center text-6xl text-red-400 font-bold">
              LOSER
            </p>
          ) : null}
          {!gameOver ? (
            <p className="text-2xl pt-10 pb-10 text-center text-6xl text-sky-400 font-bold">
              PICK ANY WORD
            </p>
          ) : null}
          <div className="grid grid-cols-4 grid-rows-4">
            {lastWordArray.map((word) => (
              <p
                onMouseOver={() => setActiveWord(word)}
                className={
                  (activeWord == word && gameOver == false) ||
                  guessArray.includes(word)
                    ? `text-2xl pt-10 pb-10 float-left p-2 text-center cursor-pointer ${
                        guessArray.includes(word) ? "bg-red-300" : "bg-white"
                      } text-black`
                    : "text-2xl pt-10 pb-10 float-left p-2 text-center cursor-none"
                }
                onClick={() =>
                  checkAnswer({
                    word,
                    wagerAmount: Number(betValue / 100) * maxBetValue,
                  })
                    ? setWinStatus(true)
                    : recordLoss({ word })
                }
              >
                {word}
              </p>
            ))}
          </div>

          <div>
            {/* Container for seed words, centered */}
            <div className="flex flex-row justify-center mt-10">
              {seed.split(" ").map((word, index) => {
                return index < 5 || gameOver == true ? (
                  <p className="float-left p-2 text-3xl">{word}</p>
                ) : (
                  <p className="float-left p-2 text-3xl">_____</p>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-row justify-center">
        <div className="w-full">
          <p className="text-center text-3xl mt-10">
            {/* ToFixed */}
            {prettyNum((Number(betValue / 100) * maxBetValue).toFixed(0), {
              thousandsSeparator: ",",
            })}
          </p>
          <div className="flex flex-row justify-center p-5">
            {/* 5/6 width */}
            <div className="w-3/5">
              <Slider
                axis="x"
                x={betValue}
                min={10}
                max={maxBetValue}
                styles={{
                  track: {
                    width: "100%",
                  },
                }}
                defaultValue={1000}
                onChange={({ x }) => setBetValue(x)}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
