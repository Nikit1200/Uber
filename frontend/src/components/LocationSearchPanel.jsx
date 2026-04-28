import React from 'react'

const LocationSearchPanel = ({ suggestions = [], loading = false, error = '', onSelect = () => {} }) => {
  return (
    <div>
        {loading && (
            <div className='px-3 py-4 text-sm text-gray-500'>
                Loading suggestions...
            </div>
        )}

        {!loading && error && (
            <div className='px-3 py-4 text-sm text-red-500'>
                {error}
            </div>
        )}

        {!loading && !error && suggestions.length === 0 && (
            <div className='px-3 py-6 text-sm text-gray-500'>
                Start typing to see location suggestions
            </div>
        )}

        {!loading && !error && suggestions.map((elem, idx) => {
            return (
                <div
                    key={elem.place_id || idx}
                    onClick={() => onSelect(elem.description)}
                    className='flex gap-4 border-2 p-3 border-gray-50 active:border-black rounded-xl items-center my-4 justify-start'
                >
                    <h2 className='bg-[#eee] h-8 flex items-center justify-center w-12'><i className="ri-map-pin-line"></i></h2>
                    <h4 className='font-medium'>{elem.description}</h4>
                </div>
            )
        })}
    </div>
  )
} 
export default LocationSearchPanel
