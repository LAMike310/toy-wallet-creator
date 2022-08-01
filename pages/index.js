import * as bip39 from 'bip39';
var {wordList} = require('../wordList.js')
import React, { useEffect, useState } from 'react';
export default function Home() {
    const [seed, setSeed] = useState('');
    const [entropyBits, setEntropyBits] = useState('');
    const [hexString, setHexString] = useState('');

    useEffect(() => {
        let mnemonic = bip39.generateMnemonic();
        setSeed(mnemonic);  
        let mnemonicArray = mnemonic.split(' ');
        let localBinary = ''
        for(let i = 0; i < mnemonicArray.length; i++) {
            let index = wordList.indexOf(mnemonicArray[i]);
            let binary = index.toString(2);
            let paddedBinary = binary.padStart(11, '0');
            localBinary += paddedBinary;
        }
        setEntropyBits(localBinary.slice(0, -4))
    }, []);

    useEffect(() => {
        let hexString = '';
        chunkArrayOfBits(entropyBits,  4).map((nibble) => {
            hexString += parseInt(nibble, 2).toString(16);
        })
        setHexString(hexString);
    }, [entropyBits]);

    useEffect(() => {
        let binaryString = '';
        for(let i = 0; i < hexString.length; i++) {
            let binaryHex = parseInt(hexString[i], 16).toString(2);
            let paddedBinaryHex = binaryHex.padStart(4, '0');
            binaryString += paddedBinaryHex;
        }
        let binaryArray = [];
        for(let i = 0; i < 16; i++) {
            let paddedBinary = i.toString(2).padStart(4, '0');
            binaryArray.push(paddedBinary);
        }
        binaryArray.map(b => {
            let potentialBinary = binaryString + b;
            let sections = chunkArrayOfBits(potentialBinary, 11);
            let potentialSeed = [];
            sections.map(section => {
                let decimal = parseInt(section, 2);
                potentialSeed.push(wordList[decimal]);
            })
            if(bip39.validateMnemonic(potentialSeed.join(' '))) {
                setSeed(potentialSeed.join(' '))
                setEntropyBits(binaryString);
            }
        })
    }, [hexString]);

    const chunkArrayOfBits = (arr, size) => {
        return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
        arr.slice(i * size, i * size + size)
        );
    }
    const changeHex = async ({ index }) => {
        await new Promise(resolve => setTimeout(resolve, 10));
        let hexAlpabet = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];
        let hexName = hexAlpabet[Math.floor(Math.random() * hexAlpabet.length)];
        let newHexString = hexString;
        newHexString = newHexString.substring(0, index) + hexName + newHexString.substring(index + 1);
        setHexString(newHexString);
    }

  return (
    <div className='flex flex-row justify-center'>     
        <div className='w-5/6 p-3'>
            <p className='text-2xl pt-10 pb-10'>{entropyBits}</p>
            <div className="text-center w-full pb-10">
                {
                    hexString.split('').map((nibble, index) => <span className='p-4 cursor-pointer text-4xl text-center' onMouseOver={() => changeHex({index})}>{nibble}</span>)
                }      
            </div> 
            <textarea className='w-full p-3 text-2xl text-center pt-10' value={seed} />
        </div>   
    </div>
  )
}
