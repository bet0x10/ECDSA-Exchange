const express = require('express');
const app = express();
const cors = require('cors');
const port = 3042;

const SHA256 = require('crypto-js/sha256');
const EC = require('elliptic').ec;

const ec = new EC('secp256k1');

// localhost can have cross origin errors
// depending on the browser you use!
app.use(cors());
app.use(express.json());

const n = 3; //Number of accounts

const privateKeys = {};
const balances = {};

for (let i of Array(n).keys()) {
  // Generate keys
  const key = ec.genKeyPair();

  let publicKey = key.getPublic().encode('hex');
  let privateKey = key.getPrivate().toString(16);
  let publicKeyAccount = publicKey.substring(0,40);

  privateKeys[publicKeyAccount] = {
    "publicKey": publicKey,
    "privateKey": privateKey
  };

  balances[publicKeyAccount] = 100;

  console.log("Account ", i+1, );
  console.log("Public key  :", publicKeyAccount);
  console.log("Private key :", privateKey);
  console.log("Balance     :", balances[publicKeyAccount]);
  console.log("----------------");

}


app.get('/balance/:address', (req, res) => {
  const {address} = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post('/send', (req, res) => {
  console.log(req.body);

  const signature = req.body.signature;

  const transactionData = req.body.transactionData;
  const {sender, recipient, amount} = req.body.transactionData;

  //retrieve public key from sender
  const key = ec.keyFromPublic(privateKeys[sender].publicKey, "hex");

  const transactionHash = SHA256(JSON.stringify(transactionData)).toString();

  const verification = key.verify(transactionHash, signature);
  console.log(verification);
  
  if(!verification) return;


  balances[sender] -= amount;
  balances[recipient] = (balances[recipient] || 0) + Number(amount);
  res.send({ balance: balances[sender] });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});
