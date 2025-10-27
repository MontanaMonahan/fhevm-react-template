// Contract Configuration
const CONTRACT_ADDRESS = "0x504CC797e32F745517E5ee3Fe30e2aB4570E7c5C"; // Replace with actual deployed contract address

// Simplified Contract ABI (only essential functions)
const CONTRACT_ABI = [
    {
        "inputs": [],
        "name": "getContractStats",
        "outputs": [
            {"internalType": "uint32", "name": "sourcesCount", "type": "uint32"},
            {"internalType": "uint32", "name": "batchesCount", "type": "uint32"},
            {"internalType": "uint32", "name": "verificationsCount", "type": "uint32"},
            {"internalType": "uint256", "name": "contractDeployed", "type": "uint256"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [{"internalType": "address", "name": "", "type": "address"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "address", "name": "producer", "type": "address"}],
        "name": "isAuthorizedProducer",
        "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "address", "name": "inspector", "type": "address"}],
        "name": "isCertifiedInspector",
        "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "uint32", "name": "_farmId", "type": "uint32"},
            {"internalType": "uint32", "name": "_coordinates", "type": "uint32"},
            {"internalType": "uint64", "name": "_harvestDate", "type": "uint64"},
            {"internalType": "uint32", "name": "_quality", "type": "uint32"}
        ],
        "name": "registerFoodSource",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "uint32", "name": "_sourceId", "type": "uint32"},
            {"internalType": "uint32", "name": "_processingId", "type": "uint32"},
            {"internalType": "uint64", "name": "_processDate", "type": "uint64"},
            {"internalType": "uint32", "name": "_temperature", "type": "uint32"},
            {"internalType": "uint32", "name": "_humidity", "type": "uint32"}
        ],
        "name": "createProductBatch",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "uint32", "name": "_batchId", "type": "uint32"},
            {"internalType": "uint32", "name": "_inspectorId", "type": "uint32"},
            {"internalType": "uint64", "name": "_inspectionDate", "type": "uint64"},
            {"internalType": "uint32", "name": "_safetyScore", "type": "uint32"},
            {"internalType": "bool", "name": "_passed", "type": "bool"}
        ],
        "name": "verifyBatch",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "address", "name": "producer", "type": "address"}],
        "name": "authorizeProducer",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "address", "name": "inspector", "type": "address"}],
        "name": "certifyInspector",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "uint32", "name": "batchId", "type": "uint32"}],
        "name": "getBatchInfo",
        "outputs": [
            {"internalType": "address", "name": "producer", "type": "address"},
            {"internalType": "bool", "name": "authenticated", "type": "bool"},
            {"internalType": "uint256", "name": "created", "type": "uint256"},
            {"internalType": "uint256", "name": "verifierCount", "type": "uint256"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "uint32", "name": "batchId", "type": "uint32"}],
        "name": "getBatchVerifiers",
        "outputs": [{"internalType": "address[]", "name": "", "type": "address[]"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "uint32", "name": "sourceId", "type": "uint32"}],
        "name": "getSourceStatus",
        "outputs": [
            {"internalType": "bool", "name": "verified", "type": "bool"},
            {"internalType": "uint256", "name": "timestamp", "type": "uint256"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "uint32", "name": "verificationId", "type": "uint32"}],
        "name": "getVerificationInfo",
        "outputs": [
            {"internalType": "bool", "name": "publiclyVerified", "type": "bool"},
            {"internalType": "uint256", "name": "recordTime", "type": "uint256"}
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

// Global variables
let userAccount = null;
let isConnected = false;
let provider = null;
let signer = null;
let contract = null;

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    setupTabNavigation();
});

// Initialize the application
async function initializeApp() {
    try {
        if (typeof window.ethereum !== 'undefined') {
            // Check if already connected
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
                await connectWallet();
            }
        } else {
            showNotification('Please install MetaMask to use this application', 'error');
        }
    } catch (error) {
        console.error('Initialization error:', error);
        showNotification('Failed to initialize application', 'error');
    }
}

// Setup event listeners
function setupEventListeners() {
    // Connect wallet
    document.getElementById('connectWallet').addEventListener('click', connectWallet);

    // Forms
    document.getElementById('registerForm').addEventListener('submit', handleRegisterSource);
    document.getElementById('batchForm').addEventListener('submit', handleCreateBatch);
    document.getElementById('verifyForm').addEventListener('submit', handleVerifyBatch);

    // Permission management
    document.getElementById('authorizeProducer').addEventListener('click', handleAuthorizeProducer);
    document.getElementById('certifyInspector').addEventListener('click', handleCertifyInspector);

    // Tracking
    document.getElementById('trackBatch').addEventListener('click', handleTrackBatch);
    document.getElementById('trackSource').addEventListener('click', handleTrackSource);
    document.getElementById('trackVerification').addEventListener('click', handleTrackVerification);
}

// Setup tab navigation
function setupTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');

            // Remove active class from all tabs and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked tab and corresponding content
            button.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
}

// Connect wallet
async function connectWallet() {
    try {
        if (typeof window.ethereum === 'undefined') {
            showNotification('Please install MetaMask', 'error');
            return;
        }

        // Initialize ethers provider
        provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        signer = provider.getSigner();
        userAccount = await signer.getAddress();
        isConnected = true;

        // Initialize contract
        contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

        // Update UI
        document.getElementById('connectWallet').textContent = 'Connected';
        document.getElementById('connectWallet').disabled = true;
        document.getElementById('walletAddress').textContent = `${userAccount.slice(0, 6)}...${userAccount.slice(-4)}`;

        // Load data
        await loadDashboardData();
        await updateUserRole();

        showNotification('Wallet connected successfully', 'success');
    } catch (error) {
        console.error('Wallet connection error:', error);
        showNotification('Failed to connect wallet', 'error');
    }
}

// Load dashboard data
async function loadDashboardData() {
    try {
        if (!isConnected || !contract) return;

        // Get contract stats
        const stats = await contract.getContractStats();
        document.getElementById('totalSources').textContent = stats.sourcesCount.toString();
        document.getElementById('totalBatches').textContent = stats.batchesCount.toString();
        document.getElementById('totalVerifications').textContent = stats.verificationsCount.toString();
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        // Set default values
        document.getElementById('totalSources').textContent = '0';
        document.getElementById('totalBatches').textContent = '0';
        document.getElementById('totalVerifications').textContent = '0';
    }
}

// Update user role
async function updateUserRole() {
    try {
        if (!isConnected || !userAccount || !contract) return;

        // Check if owner
        const owner = await contract.owner();
        if (owner.toLowerCase() === userAccount.toLowerCase()) {
            document.getElementById('userRole').textContent = 'Owner';
            return;
        }

        // Check if authorized producer
        const isProducer = await contract.isAuthorizedProducer(userAccount);
        if (isProducer) {
            document.getElementById('userRole').textContent = 'Producer';
            return;
        }

        // Check if certified inspector
        const isInspector = await contract.isCertifiedInspector(userAccount);
        if (isInspector) {
            document.getElementById('userRole').textContent = 'Inspector';
            return;
        }

        document.getElementById('userRole').textContent = 'User';
    } catch (error) {
        console.error('Error updating user role:', error);
        document.getElementById('userRole').textContent = 'User';
    }
}

// Send transaction using ethers.js
async function sendTransaction(methodName, params = []) {
    try {
        if (!isConnected || !contract) {
            throw new Error('Wallet not connected');
        }

        showNotification(`Sending transaction: ${methodName}...`, 'info');

        // Call contract method
        const tx = await contract[methodName](...params);

        showNotification(`Transaction sent: ${tx.hash.slice(0, 10)}...`, 'info');

        // Wait for transaction
        const receipt = await tx.wait();

        showNotification(`Transaction confirmed!`, 'success');
        return receipt;
    } catch (error) {
        console.error(`Transaction error (${methodName}):`, error);
        throw error;
    }
}

// Handle register source
async function handleRegisterSource(event) {
    event.preventDefault();

    try {
        if (!isConnected) {
            showNotification('Please connect wallet first', 'error');
            return;
        }

        const farmId = document.getElementById('farmId').value;
        const coordinates = document.getElementById('coordinates').value;
        const harvestDate = document.getElementById('harvestDate').value;
        const quality = document.getElementById('quality').value;

        await sendTransaction('registerFoodSource', [farmId, coordinates, harvestDate, quality]);

        showNotification('Food source registered successfully!', 'success');
        document.getElementById('registerForm').reset();
        await loadDashboardData();
    } catch (error) {
        console.error('Register source error:', error);
        showNotification(`Failed to register source: ${error.message}`, 'error');
    }
}

// Handle create batch
async function handleCreateBatch(event) {
    event.preventDefault();

    try {
        if (!isConnected) {
            showNotification('Please connect wallet first', 'error');
            return;
        }

        const sourceId = document.getElementById('sourceId').value;
        const processingId = document.getElementById('processingId').value;
        const processDate = document.getElementById('processDate').value;
        const temperature = document.getElementById('temperature').value;
        const humidity = document.getElementById('humidity').value;

        await sendTransaction('createProductBatch', [sourceId, processingId, processDate, temperature, humidity]);

        showNotification('Product batch created successfully!', 'success');
        document.getElementById('batchForm').reset();
        await loadDashboardData();
    } catch (error) {
        console.error('Create batch error:', error);
        showNotification(`Failed to create batch: ${error.message}`, 'error');
    }
}

// Handle verify batch
async function handleVerifyBatch(event) {
    event.preventDefault();

    try {
        if (!isConnected) {
            showNotification('Please connect wallet first', 'error');
            return;
        }

        const batchId = document.getElementById('batchId').value;
        const inspectorId = document.getElementById('inspectorId').value;
        const inspectionDate = document.getElementById('inspectionDate').value;
        const safetyScore = document.getElementById('safetyScore').value;
        const passed = document.getElementById('passed').checked;

        await sendTransaction('verifyBatch', [batchId, inspectorId, inspectionDate, safetyScore, passed]);

        showNotification('Batch verified successfully!', 'success');
        document.getElementById('verifyForm').reset();
        await loadDashboardData();
    } catch (error) {
        console.error('Verify batch error:', error);
        showNotification(`Failed to verify batch: ${error.message}`, 'error');
    }
}

// Handle authorize producer
async function handleAuthorizeProducer() {
    try {
        if (!isConnected) {
            showNotification('Please connect wallet first', 'error');
            return;
        }

        const address = document.getElementById('producerAddress').value;
        if (!isValidAddress(address)) {
            showNotification('Invalid address format', 'error');
            return;
        }

        await sendTransaction('authorizeProducer', [address]);

        showNotification('Producer authorized successfully!', 'success');
        document.getElementById('producerAddress').value = '';
    } catch (error) {
        console.error('Authorize producer error:', error);
        showNotification(`Failed to authorize producer: ${error.message}`, 'error');
    }
}

// Handle certify inspector
async function handleCertifyInspector() {
    try {
        if (!isConnected) {
            showNotification('Please connect wallet first', 'error');
            return;
        }

        const address = document.getElementById('inspectorAddress').value;
        if (!isValidAddress(address)) {
            showNotification('Invalid address format', 'error');
            return;
        }

        await sendTransaction('certifyInspector', [address]);

        showNotification('Inspector certified successfully!', 'success');
        document.getElementById('inspectorAddress').value = '';
    } catch (error) {
        console.error('Certify inspector error:', error);
        showNotification(`Failed to certify inspector: ${error.message}`, 'error');
    }
}

// Handle track batch
async function handleTrackBatch() {
    try {
        if (!isConnected || !contract) {
            showNotification('Please connect wallet first', 'error');
            return;
        }

        const batchId = document.getElementById('trackBatchId').value;
        if (!batchId) {
            showNotification('Please enter a batch ID', 'error');
            return;
        }

        // Get batch info from contract
        const batchInfo = await contract.getBatchInfo(batchId);
        const verifiers = await contract.getBatchVerifiers(batchId);

        const results = document.getElementById('trackingResults');
        results.innerHTML = `
            <div class="result-card">
                <h4>Batch #${batchId} Information</h4>
                <div class="result-item">
                    <span class="result-label">Producer:</span>
                    <span class="result-value">${batchInfo.producer}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Authenticated:</span>
                    <span class="result-value">${batchInfo.authenticated ? 'Yes' : 'No'}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Created:</span>
                    <span class="result-value">${new Date(batchInfo.created.toNumber() * 1000).toLocaleString()}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Verifier Count:</span>
                    <span class="result-value">${batchInfo.verifierCount.toString()}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Verifiers:</span>
                    <span class="result-value">${verifiers.length > 0 ? verifiers.join(', ') : 'None'}</span>
                </div>
            </div>
        `;
        showNotification('Batch information loaded', 'success');
    } catch (error) {
        console.error('Track batch error:', error);
        showNotification(`Failed to track batch: ${error.message}`, 'error');
    }
}

// Handle track source
async function handleTrackSource() {
    try {
        if (!isConnected || !contract) {
            showNotification('Please connect wallet first', 'error');
            return;
        }

        const sourceId = document.getElementById('trackSourceId').value;
        if (!sourceId) {
            showNotification('Please enter a source ID', 'error');
            return;
        }

        // Get source status from contract
        const sourceStatus = await contract.getSourceStatus(sourceId);

        const results = document.getElementById('trackingResults');
        results.innerHTML = `
            <div class="result-card">
                <h4>Source #${sourceId} Status</h4>
                <div class="result-item">
                    <span class="result-label">Verified:</span>
                    <span class="result-value">${sourceStatus.verified ? 'Yes' : 'No'}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Timestamp:</span>
                    <span class="result-value">${new Date(sourceStatus.timestamp.toNumber() * 1000).toLocaleString()}</span>
                </div>
            </div>
        `;
        showNotification('Source information loaded', 'success');
    } catch (error) {
        console.error('Track source error:', error);
        showNotification(`Failed to track source: ${error.message}`, 'error');
    }
}

// Handle track verification
async function handleTrackVerification() {
    try {
        if (!isConnected || !contract) {
            showNotification('Please connect wallet first', 'error');
            return;
        }

        const verificationId = document.getElementById('trackVerificationId').value;
        if (!verificationId) {
            showNotification('Please enter a verification ID', 'error');
            return;
        }

        // Get verification info from contract
        const verificationInfo = await contract.getVerificationInfo(verificationId);

        const results = document.getElementById('trackingResults');
        results.innerHTML = `
            <div class="result-card">
                <h4>Verification #${verificationId} Information</h4>
                <div class="result-item">
                    <span class="result-label">Publicly Verified:</span>
                    <span class="result-value">${verificationInfo.publiclyVerified ? 'Yes' : 'No'}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Record Time:</span>
                    <span class="result-value">${new Date(verificationInfo.recordTime.toNumber() * 1000).toLocaleString()}</span>
                </div>
            </div>
        `;
        showNotification('Verification information loaded', 'success');
    } catch (error) {
        console.error('Track verification error:', error);
        showNotification(`Failed to track verification: ${error.message}`, 'error');
    }
}

// Utility function to validate Ethereum address
function isValidAddress(address) {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
}

// Show notification
function showNotification(message, type = 'info') {
    const notifications = document.getElementById('notifications');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    notifications.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 5000);
}

// Handle network changes
if (typeof window.ethereum !== 'undefined') {
    window.ethereum.on('chainChanged', () => {
        window.location.reload();
    });

    window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
            // User disconnected
            document.getElementById('connectWallet').textContent = 'Connect Wallet';
            document.getElementById('connectWallet').disabled = false;
            document.getElementById('walletAddress').textContent = '';
            userAccount = null;
            isConnected = false;
        } else {
            // User switched accounts
            connectWallet();
        }
    });
}