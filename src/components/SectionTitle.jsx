import PropTypes from 'prop-types'
import { TYPOGRAPHY, LAYOUT } from '../constants/styles'

const SectionTitle = ({ children, className = '' }) => {
  return (
    <>
      <div className={LAYOUT.SEPARATOR}></div>
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
