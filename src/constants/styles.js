/**
 * Centralized style constants for consistent theming across the application
 * Reduces code duplication and ensures design consistency
 */

// Reusable gradient styles for backgrounds
export const GRADIENTS = {
  // Modern metallic gray gradient - used for most cards and sections
  METALLIC_GRAY: 'bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300',
  // Warm orange/amber gradient - used for special highlights
  ORANGE_AMBER: 'bg-gradient-to-tr from-orange-50 via-amber-25 to-yellow-50/50'
}

// Consistent border styles matching gradient themes
export const BORDERS = {
  GRAY: 'border-gray-300',           // Matches metallic gray theme
  ORANGE: 'border-orange-100/30',    // Matches orange/amber theme
  SLATE: 'border-slate-100/30'       // Alternative neutral option
}

// Reusable card component styles with glass morphism effect
export const CARD_STYLES = {
  // Base card styling with backdrop blur and transparency
  BASE: 'relative bg-white/85 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl transition-all duration-300',
  // Hover effects for interactive cards
  HOVER: 'hover:shadow-3xl hover:-translate-y-1',
  // Standard padding for card content
  PADDING: 'p-4 sm:p-6 lg:p-8'
}

// Typography styles for consistent text hierarchy
export const TYPOGRAPHY = {
  // Main section titles (h2 elements)
  SECTION_TITLE: 'text-2xl sm:text-3xl lg:text-4xl font-medium text-left text-gray-900 mb-12 lg:mb-16 leading-tight',
  // Card titles and subsection headers (h3 elements)
  CARD_TITLE: 'text-lg sm:text-xl font-medium text-left text-gray-700 mb-4 sm:mb-6',
  // Body text for paragraphs and content
  BODY_TEXT: 'text-gray-700 leading-relaxed text-justify text-sm sm:text-base'
}

// Layout and container styles for consistent spacing
export const LAYOUT = {
  // Standard section background and padding
  SECTION: 'bg-gray-50 py-12 lg:py-16',
  // Responsive container with consistent max-width and padding
  CONTAINER: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  // Horizontal separator line for section divisions
  SEPARATOR: 'w-full h-px bg-black mb-6 lg:mb-8'
}
