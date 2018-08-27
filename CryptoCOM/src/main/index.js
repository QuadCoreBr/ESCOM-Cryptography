import {app, BrowserWindow, ipcMain, dialog} from 'electron'

const fs = require('fs')
const path = require('path')
const _ = require('lodash')
const math = require('mathjs')


/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
    global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
    ? `http://localhost:9080`
    : `file://${__dirname}/index.html`

function createWindow() {
    /**
     * Initial window options
     */
    mainWindow = new BrowserWindow({
        height: 900,
        useContentSize: true,
        width: 800
    })

    mainWindow.loadURL(winURL)
    mainWindow.maximize()

    mainWindow.on('closed', () => {
        mainWindow = null
    })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow()
    }
})

process.on('exit', function() {
    self.proc.disconnect();
    self.proc.kill();
});
/************* PRACTICE ZERO ***************/
ipcMain.on('p0:fileSelector:requestedPlainText', (event, configurations) => {
    console.log('Event received to open a plain file selector and emmit the path')
    dialog.showOpenDialog(mainWindow, {
        title: "Select the plain text file",
        filters: [{name: 'Text files', extensions: ['txt']}],
        properties: ['openFile']
    }, (fileNames) => {
        if (fileNames === undefined) {
            console.log("No file selected")
            return
        }
        if (fileNames) {
            fs.readFile(fileNames[0].toString(), (err, data) => {
                if (err) {
                    throw err;
                }
                fs.writeFile(cipheredFileName, shiftedText.join('').toString('utf8'), 'utf8', (err) => {
                    if (err) {
                        throw  err;
                    }
                    event.sender.send('p0:fileSelector:plainTextSelected', {
                        fileName: fileNames[0],
                        contents: data.toString('utf8'),
                        cipheredFileName: cipheredFileName,
                        cipheredContents: shiftedText.join('').toString('utf8')
                    })
                })
            })
        }
    })
})
ipcMain.on('p0:fileSelector:requestedEncryptedText', (event, configurations) => {
    console.log('Event received to open a file selector and emmit the decrypted path')
    dialog.showOpenDialog(mainWindow, {
        title: "Select the encrypted text file",
        filters: [{name: 'Text files', extensions: ['txt']}],
        properties: ['openFile']
    }, (fileNames) => {
        if (fileNames === undefined) {
            console.log("No file selected")
            return
        }
        if (fileNames) {
            fs.readFile(fileNames[0].toString(), (err, data) => {
                if (err) {
                    throw err;
                }
                fs.writeFile(decryptedFileName, shiftedText.join('').toString('utf8'), 'utf8', (err) => {
                    if (err) {
                        throw err
                    }
                    event.sender.send('p0:fileSelector:cipheredTextSelected', {
                        fileName: fileNames[0],
                        contents: data.toString('utf8'),
                        decryptedFileName: decryptedFileName,
                        decryptedContents: shiftedText.join('').toString('utf8')
                    })
                })
            })
        }
    })
})
/****** PRACTICE ONE ************/
ipcMain.on('fileSelector:requestedPlainText', (event, configurations) => {
    console.log('Event received to open a plain file selector and emmit the path')
    dialog.showOpenDialog(mainWindow, {
        title: "Select the plain text file",
        filters: [{name: 'Text files', extensions: ['txt']}],
        properties: ['openFile']
    }, (fileNames) => {
        if (fileNames === undefined) {
            console.log("No file selected")
            return
        }
        if (fileNames) {
            fs.readFile(fileNames[0].toString(), (err, data) => {
                if (err) {
                    throw err;
                }
                var removedAccents = data.toString('utf8').normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/\r?\n|\r/g, '').replace(/\s/g, '').replace(/[^A-Za-z]/g, '')
                var alphabet = [];
                for (var i = 97; i < 123; i++) {
                    alphabet.push(String.fromCharCode(i))
                }
                var shiftedText = [];
                for (var i = 0; i < removedAccents.length; i++) {
                    shiftedText.push(String.fromCharCode(alphabet[(_.indexOf(alphabet, removedAccents.charAt(i)) + configurations.shiftNumber) % configurations.alphabetLength].charCodeAt(0) - 32))
                }
                var cipheredFileName = path.parse(fileNames[0]).dir + '/' + path.parse(fileNames[0]).name + '_encrypted.txt'
                fs.writeFile(cipheredFileName, shiftedText.join('').toString('utf8'), 'utf8', (err) => {
                    if (err) {
                        throw  err;
                    }
                    event.sender.send('fileSelector:plainTextSelected', {
                        fileName: fileNames[0],
                        contents: data.toString('utf8'),
                        cipheredFileName: cipheredFileName,
                        cipheredContents: shiftedText.join('').toString('utf8')
                    })
                })
            })
        }
    })
})
ipcMain.on('fileSelector:requestedEncryptedText', (event, configurations) => {
    console.log('Event received to open a file selector and emmit the decrypted path')
    dialog.showOpenDialog(mainWindow, {
        title: "Select the encrypted text file",
        filters: [{name: 'Text files', extensions: ['txt']}],
        properties: ['openFile']
    }, (fileNames) => {
        if (fileNames === undefined) {
            console.log("No file selected")
            return
        }
        if (fileNames) {
            fs.readFile(fileNames[0].toString(), (err, data) => {
                if (err) {
                    throw err;
                }
                var removedAccents = data.toString('utf8').normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/\r?\n|\r/g, '').replace(/\s/g, '').replace(/[^A-Za-z]/g, '')
                var alphabet = [];
                for (var i = 65; i < 91; i++) {
                    alphabet.push(String.fromCharCode(i))
                }
                var shiftedText = [];
                var keyToDecrypt = configurations.alphabetLength - configurations.shiftNumber;
                for (var i = 0; i < removedAccents.length; i++) {
                    shiftedText.push(String.fromCharCode(alphabet[(_.indexOf(alphabet, removedAccents.charAt(i)) + keyToDecrypt) % (configurations.alphabetLength)].charCodeAt(0) + 32))
                }
                var decryptedFileName = path.parse(fileNames[0]).dir + '/' + path.parse(fileNames[0]).name + '_decrypted.txt'
                fs.writeFile(decryptedFileName, shiftedText.join('').toString('utf8'), 'utf8', (err) => {
                    if (err) {
                        throw err
                    }
                    event.sender.send('fileSelector:cipheredTextSelected', {
                        fileName: fileNames[0],
                        contents: data.toString('utf8'),
                        decryptedFileName: decryptedFileName,
                        decryptedContents: shiftedText.join('').toString('utf8')
                    })
                })
            })
        }
    })
})
/******* PRACTICE TWO *********/
ipcMain.on('p2:fileSelector:requestedPlainText', (event, configurations) => {
    console.log('Event received to open a plain file selector and emmit the path', configurations)
    dialog.showOpenDialog(mainWindow, {
        title: "Select the plain text file",
        filters: [{name: 'Text files', extensions: ['txt']}],
        properties: ['openFile']
    }, (fileNames) => {
        if (fileNames === undefined) {
            console.log("No file selected")
            return
        }
        if (fileNames) {
            fs.readFile(fileNames[0].toString(), (err, data) => {
                if (err) {
                    throw err;
                }
                var rejected = false
                var removedAccents = data.toString('utf8').normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/\r?\n|\r/g, '').replace(/\s/g, '').replace(/[^A-Za-z]/g, '')
                var alphabet = []
                var shiftedText = []
                //AlphabetRange must be a string like this 'a-z'
                for (var i = configurations.alphabetRange.charCodeAt(0); i <= configurations.alphabetRange.charCodeAt(2); i++) {
                    alphabet.push(String.fromCharCode(i))
                }
                var alpha = configurations.alphaNumber
                var beta = configurations.betaNumber
                for (i = 0; i < removedAccents.length; i++) {
                    let indexOfChar = _.indexOf(alphabet, removedAccents.charAt(i))
                    if (indexOfChar === -1) {
                        rejected = true
                        event.sender.send('p2:fileSelector:plainTextSelected', {
                            fileName: fileNames[0],
                            contents: data.toString('utf8'),
                            cipheredFileName: "NA",
                            cipheredContents: "Error, one or more characters doesn't belong to the alphabet: " + removedAccents.charAt(i),
                            rejected: rejected
                        })
                        break
                    }
                    let cFormula = (alpha * indexOfChar + beta) % configurations.alphabetLength
                    let charCiphered = String.fromCharCode(alphabet[cFormula].charCodeAt(0) - 32)
                    shiftedText.push(charCiphered)
                }
                if (!rejected) {
                    var cipheredFileName = path.parse(fileNames[0]).dir + '/' + path.parse(fileNames[0]).name + '_encrypted.txt'
                    fs.writeFile(cipheredFileName, shiftedText.join('').toString('utf8'), 'utf8', (err) => {
                        if (err) {
                            throw  err;
                        }
                        event.sender.send('p2:fileSelector:plainTextSelected', {
                            fileName: fileNames[0],
                            contents: data.toString('utf8'),
                            cipheredFileName: cipheredFileName,
                            cipheredContents: shiftedText.join('').toString('utf8')
                        })
                    })
                }

            })
        }
    })
})
ipcMain.on('p2:fileSelector:requestedEncryptedText', (event, configurations) => {
    console.log('Event received to open a file selector and emmit the decrypted path', configurations)
    dialog.showOpenDialog(mainWindow, {
        title: "Select the encrypted text file",
        filters: [{name: 'Text files', extensions: ['txt']}],
        properties: ['openFile']
    }, (fileNames) => {
        if (fileNames === undefined) {
            console.log("No file selected")
            return
        }
        if (fileNames) {
            fs.readFile(fileNames[0].toString(), (err, data) => {
                if (err) {
                    throw err;
                }
                var rejected = false
                var removedAccents = data.toString('utf8').normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/\r?\n|\r/g, '').replace(/\s/g, '').replace(/[^A-Za-z]/g, '')
                var alphabet = []
                var shiftedText = []
                var coprimesWithAlpha = []
                var multiplicativeInverseIndex = []
                var availableMultiplicativeInverse = []
                //AlphabetRange must be a string like this 'a-z'
                for (var i = configurations.alphabetRange.charCodeAt(0); i <= configurations.alphabetRange.charCodeAt(2); i++) {
                    alphabet.push(String.fromCharCode(i - 32))
                }
                console.log('alphabet: ', alphabet)
                //Check if numbers are coprimes using the GCD formula
                for (var i = 1; i < configurations.alphabetLength; i++) {
                    if (math.gcd(configurations.alphabetLength, i) === 1) {
                        coprimesWithAlpha.push(i)
                        availableMultiplicativeInverse.push(i)
                    }
                }
                //Iterate with every coprime and find the inverse multiplicative for each number in the array
                for (var i = 0; i < coprimesWithAlpha.length; i++) {
                    let j = 0
                    while (availableMultiplicativeInverse.length > 0 && j < configurations.alphabetLength) {
                        if ((coprimesWithAlpha[i] * availableMultiplicativeInverse[j]) % configurations.alphabetLength === 1) {
                            let multiplicativeInverseElement = {}
                            multiplicativeInverseElement.number = coprimesWithAlpha[i]
                            multiplicativeInverseElement.multiplicativeInverse = availableMultiplicativeInverse[j]
                            multiplicativeInverseIndex.push(multiplicativeInverseElement)
                            multiplicativeInverseElement = {}
                            multiplicativeInverseElement.number = availableMultiplicativeInverse[j]
                            multiplicativeInverseElement.multiplicativeInverse = coprimesWithAlpha[i]
                            multiplicativeInverseIndex.push(multiplicativeInverseElement)
                            availableMultiplicativeInverse.splice(availableMultiplicativeInverse.indexOf(availableMultiplicativeInverse[j]), 1)
                            break
                        }
                        j++
                    }
                }
                var multiplicativeInverseIndex = _.sortBy(_.uniqBy(multiplicativeInverseIndex, 'number'), 'number')
                console.log(_.sortBy(_.uniqBy(multiplicativeInverseIndex, 'number'), 'number'))
                var alpha = configurations.alphaNumber
                var beta = configurations.betaNumber
                var inverseAlpha = _.find(multiplicativeInverseIndex, {number: alpha}).multiplicativeInverse
                var inverseBeta = configurations.alphabetLength - beta
                for (i = 0; i < removedAccents.length; i++) {
                    let indexOfChar = _.indexOf(alphabet, removedAccents.charAt(i))
                    if (indexOfChar === -1) {
                        rejected = true
                        event.sender.send('p2:fileSelector:cipheredTextSelected', {
                            fileName: fileNames[0],
                            contents: data.toString('utf8'),
                            decryptedFileName: "NA",
                            decryptedContents: "Error, one or more characters doesn't belong to the alphabet: " + removedAccents.charAt(i),
                            rejected: rejected
                        })
                        break
                    }
                    let cFormula = inverseAlpha * (indexOfChar + inverseBeta) % configurations.alphabetLength
                    let charCiphered = String.fromCharCode(alphabet[cFormula].charCodeAt(0) + 32)
                    shiftedText.push(charCiphered)
                }
                if (!rejected) {
                    var decryptedFileName = path.parse(fileNames[0]).dir + '/' + path.parse(fileNames[0]).name + '_decrypted.txt'
                    fs.writeFile(decryptedFileName, shiftedText.join('').toString('utf8'), 'utf8', (err) => {
                        if (err) {
                            throw err
                        }
                        event.sender.send('p2:fileSelector:cipheredTextSelected', {
                            fileName: fileNames[0],
                            contents: data.toString('utf8'),
                            decryptedFileName: decryptedFileName,
                            decryptedContents: shiftedText.join('').toString('utf8')
                        })
                    })
                }

            })
        }
    })
})
/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
