// Dirección del contrato desplegado en Sepolia
const contractAddress = "0x512183f9ad28dcddf0e15ab080664e84c58a0fe7";

// ABI del contrato
const contractABI = [
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [],
        "name": "getBalance",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [
            {
                "internalType": "address payable",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_amount",
                "type": "uint256"
            }
        ],
        "name": "withdraw",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "stateMutability": "payable",
        "type": "receive"
    }
];

let provider, signer, contract;

// Conectar Wallet
async function connectWallet() {
    if (window.ethereum) {
        try {
            await window.ethereum.request({ method: "eth_requestAccounts" });
            provider = new ethers.providers.Web3Provider(window.ethereum);
            signer = provider.getSigner();
            const account = await signer.getAddress();
            document.getElementById("account").textContent = `Cuenta: ${account}`;
            contract = new ethers.Contract(contractAddress, contractABI, signer);
        } catch (error) {
            console.error("Error al conectar la wallet:", error);
        }
    } else {
        alert("Por favor, instala MetaMask para usar esta aplicación.");
    }
}

// Consultar balance del contrato
async function getBalance() {
    try {
        const balance = await contract.getBalance();
        document.getElementById("balance").textContent = `Balance del contrato: ${ethers.utils.formatEther(balance)} ETH`;
    } catch (error) {
        console.error("Error al consultar el balance:", error);
    }
}

// Depositar ETH en el contrato
async function deposit() {
    const amount = document.getElementById("amount").value;
    if (!amount || isNaN(amount)) {
        alert("Por favor, ingresa una cantidad válida en ETH.");
        return;
    }

    if (parseFloat(amount) <= 0) {
        alert("Por favor, ingresa una cantidad mayor a 0 ETH.");
        return;
    }

    try {
        // Obtener el balance disponible de la cuenta conectada
        const accountBalance = await signer.getBalance();
        const accountBalanceInETH = ethers.utils.formatEther(accountBalance);

        // Verificar si el monto a depositar es mayor que el balance disponible en la cuenta
        if (parseFloat(amount) > parseFloat(accountBalanceInETH)) {
            document.getElementById("output").textContent = "Error: El monto a depositar es mayor que el saldo disponible en tu cuenta.";
            return;
        }

        // Realizar el depósito
        const tx = await signer.sendTransaction({
            to: contractAddress,
            value: ethers.utils.parseEther(amount)
        });
        await tx.wait();
        document.getElementById("output").textContent = "Depósito realizado con éxito.";
        getBalance();
    } catch (error) {
        console.error("Error al depositar:", error);
        document.getElementById("output").textContent = "Error al depositar: " + error.message;
    }
}

// Retirar ETH del contrato
async function withdraw() {
    const amount = document.getElementById("amount").value;
    
    // Validar que la cantidad sea válida, mayor que 0 y un número
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
        alert("Por favor, ingresa una cantidad mayor a 0 ETH.");
        return;
    }

    try {
        // Obtener el balance actual del contrato
        const contractBalance = await contract.getBalance();
        const contractBalanceInETH = ethers.utils.formatEther(contractBalance);

        // Verificar si el monto a retirar es mayor que el balance disponible
        if (parseFloat(amount) > parseFloat(contractBalanceInETH)) {
            document.getElementById("output").textContent = "Error: El monto a retirar es mayor que el balance disponible.";
            return;
        }

        // Realizar el retiro
        const tx = await contract.withdraw(ethers.utils.parseEther(amount));
        await tx.wait();
        document.getElementById("output").textContent = "Retiro realizado con éxito.";
        getBalance();
    } catch (error) {
        console.error("Error al retirar:", error);
        document.getElementById("output").textContent = "Error al retirar: " + error.message;
    }
}

