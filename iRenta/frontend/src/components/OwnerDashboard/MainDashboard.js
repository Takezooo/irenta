import React from 'react'

const MainDashboard = () => {
  return (
    <div className="pt-20 pb-4 flex flex-col gap-2 sm:ml-64">
      <div className="flex gap-2">
        <div className="flex justify-between p-4 w-full h-full bg-blue-900 text-white rounded-md shadow overflow-hidden">
          <div> 
            <h3 className="mb-4">Active Listing</h3>
            <h1 className="mb-4 text-3xl font-bold">3</h1>
          </div>
          <div>
            <h3 className="mb-4 text-gray-300">Manage Listings</h3>
          </div>
        </div>

        <div className="flex justify-between p-4 w-full h-full bg-blue-900 text-white rounded-md shadow overflow-hidden">
          <div> 
            <h3 className="mb-4">Total Tenants</h3>
            <h1 className="mb-4 text-3xl font-bold">5</h1>
          </div>
          <div>
            <h3 className="mb-4 text-gray-300">Manage Tenants</h3>
          </div>
        </div>

      </div>

      <div className="flex gap-2 h-56 w-full flex-wrap space-between">
        <div className="flex-1 justify-between p-4 h-full bg-gray-100 text-black rounded-md shadow overflow-hidden">
          <div> 
            <h3 className="mb-4">Active Listing</h3>
            <h1 className="mb-4 text-3xl font-bold">3</h1>
          </div>
        </div>
        <div className="flex-1 justify-between p-4 h-full bg-gray-100 text-black rounded-md shadow overflow-hidden">
          <div> 
            <h3 className="mb-4">Active Listing</h3>
            <h1 className="mb-4 text-3xl font-bold">3</h1>
          </div>
        </div>
        <div className="flex-1 justify-between p-4 h-full bg-gray-100 text-black rounded-md shadow overflow-hidden">
          <div> 
            <h3 className="mb-4">Active Listing</h3>
            <h1 className="mb-4 text-3xl font-bold">3</h1>
          </div>
        </div>
      </div>
       
    </div>
  )
}

export default MainDashboard