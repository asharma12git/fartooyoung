import PropTypes from 'prop-types'
import { GRADIENTS, CARD_STYLES, BORDERS } from '../constants/styles'

/**
 * Reusable Card component with gradient background and consistent styling
 * Used throughout the application for content sections, team profiles, etc.
 */
const Card = ({ 
  children, 
  gradient = GRADIENTS.METALLIC_GRAY, 
  border = BORDERS.GRAY,
  className = '',
  hover = true,
  padding = 'p-8'
}) => {
  return (
    <div className="relative h-full">
      {/* Gradient background layer */}
      <div className={`absolute inset-0 ${gradient} rounded-3xl`}></div>
      
      {/* Content container with glass morphism effect */}
      <div className={`
        ${CARD_STYLES.BASE} 
        ${hover ? CARD_STYLES.HOVER : ''} 
        ${padding} 
        border ${border} 
        h-full flex flex-col
        ${className}
      `}>
        {children}
      </div>
    </div>
  )
}

Card.propTypes = {
  children: PropTypes.node.isRequired,
  gradient: PropTypes.string,
  border: PropTypes.string,
  className: PropTypes.string,
  hover: PropTypes.bool,
  padding: PropTypes.string
}

export default Card
