function ShimmerCard() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
        {/* Image placeholder */}
        <div className="h-56 bg-gray-200"></div>

        <div className="p-5 space-y-4">
          {/* Name + Age */}
          <div className="h-5 bg-gray-200 rounded w-1/3"></div>

          {/* Location */}
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>

          {/* Bio lines */}
          <div className="h-3 bg-gray-200 rounded w-full"></div>
          <div className="h-3 bg-gray-200 rounded w-5/6"></div>

          {/* Action buttons */}
          <div className="flex justify-center gap-8 pt-5">
            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShimmerCard;
