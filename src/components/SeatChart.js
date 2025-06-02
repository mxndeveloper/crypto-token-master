import { useEffect, useState, useCallback } from 'react'
import PropTypes from 'prop-types'
import Seat from './Seat'
import close from '../assets/close.svg'

const SeatChart = ({ occasion, tokenMaster, provider, setToggle }) => {
  const [seatsTaken, setSeatsTaken] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const getSeatsTaken = useCallback(async () => {
    try {
      const seats = await tokenMaster.getSeatsTaken(occasion.id)
      setSeatsTaken(seats)
      setError(null)
    } catch (err) {
      setError('Failed to load seat data')
      console.error(err)
    }
  }, [tokenMaster, occasion.id])

  const buyHandler = useCallback(async (seat) => {
    setIsLoading(true)
    setError(null)
    setSuccess(false)
    
    try {
      const signer = provider.getSigner()
      const gasEstimate = await tokenMaster
        .connect(signer)
        .estimateGas.mint(occasion.id, seat, { value: occasion.cost })

      const tx = await tokenMaster
        .connect(signer)
        .mint(occasion.id, seat, { 
          value: occasion.cost,
          gasLimit: gasEstimate.mul(120).div(100)
        })

      await tx.wait()
      setSuccess(true)
      getSeatsTaken()
    } catch (err) {
      setError(err.reason || 'Purchase failed')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [tokenMaster, provider, occasion, getSeatsTaken])

  useEffect(() => {
    getSeatsTaken()
  }, [getSeatsTaken])

  return (
    <div className="occasion">
      <div className="occasion__seating">
        <h1>{occasion.name} Seating Map</h1>

        <button 
          onClick={() => !isLoading && setToggle(false)} 
          className="occasion__close"
          disabled={isLoading}
        >
          <img src={close} alt="Close" />
        </button>

        {error && <div className="error-banner">{error}</div>}
        {success && <div className="success-banner">Ticket purchased successfully!</div>}

        <div className="occasion__stage">
          <strong>STAGE</strong>
        </div>

        {/* Left Section - 25 seats (5x5 grid) */}
        {seatsTaken.length > 0 && Array(25).fill(1).map((_, i) =>
          <Seat
            i={i}
            step={1}
            columnStart={0}
            maxColumns={5}
            rowStart={2}
            maxRows={5}
            seatsTaken={seatsTaken}
            buyHandler={buyHandler}
            disabled={isLoading}
            key={`left-${i}`}
          />
        )}

        <div className="occasion__spacer--1">
          <strong>WALKWAY</strong>
        </div>

        {/* Center Section - Dynamic width */}
        {seatsTaken.length > 0 && Array(Number(occasion.maxTickets) - 50).fill(1).map((_, i) =>
          <Seat
            i={i}
            step={26}
            columnStart={6}
            maxColumns={15}
            rowStart={2}
            maxRows={15}
            seatsTaken={seatsTaken}
            buyHandler={buyHandler}
            disabled={isLoading}
            key={`center-${i}`}
          />
        )}

        <div className="occasion__spacer--2">
          <strong>WALKWAY</strong>
        </div>

        {/* Right Section - 25 seats (5x5 grid) */}
        {seatsTaken.length > 0 && Array(25).fill(1).map((_, i) =>
          <Seat
            i={i}
            step={(Number(occasion.maxTickets) - 24)}
            columnStart={22}
            maxColumns={5}
            rowStart={2}
            maxRows={5}
            seatsTaken={seatsTaken}
            buyHandler={buyHandler}
            disabled={isLoading}
            key={`right-${i}`}
          />
        )}
      </div>

      {isLoading && (
        <div className="overlay">
          <div className="loader">Processing transaction...</div>
        </div>
      )}
    </div>
  )
}

SeatChart.propTypes = {
  occasion: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    maxTickets: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    cost: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
  }).isRequired,
  tokenMaster: PropTypes.object.isRequired,
  provider: PropTypes.object.isRequired,
  setToggle: PropTypes.func.isRequired
}

export default SeatChart