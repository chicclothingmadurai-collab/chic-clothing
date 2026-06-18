export function Button({ children, className = "", ...props }) {
  return (
    <button
      className={`px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Input({
  label,
  error,
  className = "",
  ...props
}) {
  return (
    <div>
      {label && (
        <label className="block mb-1 text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <input
        className={`w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black ${className}`}
        {...props}
      />

      {error && (
        <p className="text-red-500 text-sm mt-1">
          {error}
        </p>
      )}
    </div>
  );
}

export function EmptyState({
  title = "No Data Found",
  description = ""
}) {
  return (
    <div className="text-center py-12">
      <h2 className="text-xl font-semibold">
        {title}
      </h2>

      {description && (
        <p className="text-gray-500 mt-2">
          {description}
        </p>
      )}
    </div>
  );
}

export function Spinner() {
  return (
    <div className="flex justify-center items-center py-12">
      <div className="w-10 h-10 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
    </div>
  );
}

export function ErrorMessage({
  message,
  onRetry
}) {
  return (
    <div className="text-center py-12">
      <p className="text-red-500 mb-4">
        {message}
      </p>

      {onRetry && (
        <Button onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}

export function PageContainer({ children }) {
  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {children}
    </div>
  );
}