import PropTypes from 'prop-types'
import Card from './Card'
import { TYPOGRAPHY } from '../constants/styles'

/**
 * Specialized card component for displaying team member and mentor profiles
 * Includes photo, name, and biography with consistent styling
 */
const PersonCard = ({ 
  name, 
  image, 
  alt, 
  biography, 
  gradient,
  border 
}) => {
  return (
    <Card gradient={gradient} border={border}>
      {/* Person name */}
      <h3 className={TYPOGRAPHY.CARD_TITLE}>{name}</h3>
      
      {/* Divider line */}
      <div className="w-full h-px bg-gray-400 mb-4 sm:mb-6"></div>
      
      {/* Profile photo */}
      <div className="w-full h-60 sm:h-72 lg:h-80 mb-4 sm:mb-6">
        <img 
          src={image} 
          alt={alt} 
          className="w-full h-full object-cover object-center rounded-xl sm:rounded-2xl"
        />
      </div>
      
      {/* Biography content - supports both string and array of paragraphs */}
      <div className="flex-1">
        {Array.isArray(biography) ? (
          biography.map((paragraph, index) => (
            <p key={index} className={`${TYPOGRAPHY.BODY_TEXT} ${index > 0 ? 'mt-4' : ''}`}>
              {paragraph}
            </p>
          ))
        ) : (
          <p className={TYPOGRAPHY.BODY_TEXT}>{biography}</p>
        )}
      </div>
    </Card>
  )
}

PersonCard.propTypes = {
  name: PropTypes.string.isRequired,
  image: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  biography: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string)
  ]).isRequired,
  gradient: PropTypes.string,
  border: PropTypes.string
}

export default PersonCard
