// SeatChart.js (unchanged from previous version)
// ... [previous SeatChart.js implementation remains exactly the same] ...

// Seat.js with enhanced styling
import PropTypes from 'prop-types'

const Seat = ({ i, step, columnStart, maxColumns, rowStart, maxRows, seatsTaken, buyHandler, disabled }) => {
  const seatNumber = i + step
  const isTaken = seatsTaken.find(seat => Number(seat) === seatNumber)

  const handleClick = () => {
    if (!isTaken && !disabled) {
      buyHandler(seatNumber)
    }
  }

  return (
    <div
      onClick={handleClick}
      className={
        `seat 
         ${isTaken ? 'seat--taken' : 'seat--available'} 
         ${disabled ? 'seat--disabled' : ''}`
      }
      style={{
        gridColumn: `${((i % maxColumns) + 1) + columnStart}`,
        gridRow: `${Math.ceil(((i + 1) / maxRows)) + rowStart}`,
        cursor: isTaken || disabled ? 'not-allowed' : 'pointer'
      }}
      aria-label={`Seat ${seatNumber} - ${isTaken ? 'Taken' : 'Available'}`}
    >
      {seatNumber}
    </div>
  )
}

Seat.propTypes = {
  i: PropTypes.number.isRequired,
  step: PropTypes.number.isRequired,
  columnStart: PropTypes.number.isRequired,
  maxColumns: PropTypes.number.isRequired,
  rowStart: PropTypes.number.isRequired,
  maxRows: PropTypes.number.isRequired,
  seatsTaken: PropTypes.array.isRequired,
  buyHandler: PropTypes.func.isRequired,
  disabled: PropTypes.bool
}

export default Seat