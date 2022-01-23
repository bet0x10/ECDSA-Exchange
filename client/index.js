import "./index.scss";
import {ec as EC} from "../node_modules/elliptic/lib/elliptic.js"
import * as SHA256 from "../node_modules/crypto-js/sha256.js"

const server = "http://localhost:3042";

document.getElementById("exchange-address").addEventListener('input', ({ target: {value} }) => {
  if(value === "") {
    document.getElementById("balance").innerHTML = 0;
    return;
  }

  fetch(`${server}/balance/${value}`).then((response) => {
    return response.json();
  }).then(({ balance }) => {
    document.getElementById("balance").innerHTML = balance;
  });
});

document.getElementById("transfer-amount").addEventListener('click', () => {
  const sender = document.getElementById("exchange-address").value;
  const amount = document.getElementById("send-amount").value;
  const recipient = document.getElementById("recipient").value;

  const privatekey = document.getElementById("privatekey").value;

  const ec = new EC('secp256k1');
  const key = ec.keyFromPrivate(privatekey);

  let transactionData = {sender, amount, recipient};
  let transactionHash = SHA256(JSON.stringify(transactionData)).toString();

  const signatureRaw = key.sign(transactionHash);
  const signature = {
    r: signatureRaw.r.toString(16),
    s: signatureRaw.s.toString(16)
  }

  const body = JSON.stringify({
    transactionData, signature
  });

  const request = new Request(`${server}/send`, { method: 'POST', body });

  fetch(request, { headers: { 'Content-Type': 'application/json' }}).then(response => {
    return response.json();
  }).then(({ balance }) => {
    document.getElementById("balance").innerHTML = balance;
  });
});
