import PropTypes from 'prop-types'
import { TYPOGRAPHY, LAYOUT } from '../constants/styles'

/**
 * Standardized section title component with separator line
 * Provides consistent styling for all page section headers
 */
const SectionTitle = ({ children, className = '' }) => {
  return (
    <>
      {/* Horizontal separator line */}
      <div className={LAYOUT.SEPARATOR}></div>
      
      {/* Section title with consistent typography */}
      <h2 className={`${TYPOGRAPHY.SECTION_TITLE} ${className}`}>
        {children}
      </h2>
    </>
  )
}

SectionTitle.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string
}

export default SectionTitle
