import { Link } from 'react-router-dom'
import ApperIcon from '../components/ApperIcon'

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-8">
          <ApperIcon name="FileX" className="w-24 h-24 text-surface-400 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-surface-900 dark:text-surface-50 mb-2">
            404 - Page Not Found
          </h1>
          <p className="text-lg text-surface-600 dark:text-surface-300 mb-8">
            The page you're looking for doesn't exist.
          </p>
        </div>
        
        <Link
          to="/"
          className="inline-flex items-center px-6 py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition-colors"
        >
          <ApperIcon name="Home" className="w-5 h-5 mr-2" />
          Back to Home
        </Link>
      </div>
    </div>
  )
}

export default NotFound