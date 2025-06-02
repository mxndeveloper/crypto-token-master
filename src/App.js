// App.js - Main Application Component
import { useEffect, useState } from 'react'
import { ethers } from 'ethers'

// Components
import Navigation from './components/Navigation'
import Sort from './components/Sort'
import Card from './components/Card'
import SeatChart from './components/SeatChart'

// ABIs - Application Binary Interface for smart contract
import TokenMaster from './abis/TokenMaster.json'

// Config - Network configuration
import config from './config.json'

/**
 * Main application component that manages:
 * - Blockchain connection
 * - Contract interaction
 * - Event display and ticket purchasing
 */
function App() {
  // State management for blockchain connection
  const [provider, setProvider] = useState(null) // Ethers.js provider instance
  const [account, setAccount] = useState(null) // Current user account

  // State for contract and events data
  const [tokenMaster, setTokenMaster] = useState(null) // Contract instance
  const [occasions, setOccasions] = useState([]) // List of all events

  // State for seat chart modal
  const [occasion, setOccasion] = useState({}) // Currently selected event
  const [toggle, setToggle] = useState(false) // Seat chart visibility

  /**
   * Initializes blockchain connection and loads contract data
   * - Sets up provider and contract instance
   * - Fetches all events from contract
   * - Sets up account change listener
   */
  const loadBlockchainData = async () => {
    try {
      // Initialize provider using MetaMask/injected provider
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      setProvider(provider)

      // Get network info to determine correct contract address
      const network = await provider.getNetwork()
      
      // Initialize contract instance
      const tokenMaster = new ethers.Contract(
        config[network.chainId].TokenMaster.address,
        TokenMaster,
        provider
      )
      setTokenMaster(tokenMaster)

      // Fetch all events from contract
      const totalOccasions = await tokenMaster.totalOccasions()
      const occasions = []

      // Retrieve each event's details
      for (let i = 1; i <= totalOccasions; i++) {
        const occasion = await tokenMaster.getOccasion(i)
        occasions.push(occasion)
      }

      setOccasions(occasions)

      // Set up listener for account changes
      window.ethereum.on('accountsChanged', async () => {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
        const account = ethers.utils.getAddress(accounts[0])
        setAccount(account)
      })
    } catch (error) {
      console.error('Error loading blockchain data:', error)
      // In production, add user-friendly error handling
    }
  }

  // Initialize blockchain connection on component mount
  useEffect(() => {
    loadBlockchainData()
    
    // Cleanup event listeners on unmount
    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged')
      }
    }
  }, [])

  return (
    <div className="app-container">
      <header className="app-header">
        <Navigation account={account} setAccount={setAccount} />
        <h2 className="header__title"><strong>Event</strong> Tickets</h2>
      </header>

      {/* Sorting controls for events */}
      <Sort />

      {/* Events listing */}
      <div className='cards'>
        {occasions.map((occasion, index) => (
          <Card
            occasion={occasion}
            id={index + 1}
            tokenMaster={tokenMaster}
            provider={provider}
            account={account}
            toggle={toggle}
            setToggle={setToggle}
            setOccasion={setOccasion}
            key={occasion.id} // Better to use event ID if available
          />
        ))}
      </div>

      {/* Seat selection modal */}
      {toggle && (
        <SeatChart
          occasion={occasion}
          tokenMaster={tokenMaster}
          provider={provider}
          setToggle={setToggle}
        />
      )}
    </div>
  )
}

export default App