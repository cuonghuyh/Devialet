import React from 'react';

/**
 * Demo component showcasing Tailwind CSS usage
 * Đây là component demo để show các tính năng của Tailwind
 */
const TailwindDemo = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            🎨 Tailwind CSS Demo
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Các ví dụ component được xây dựng hoàn toàn bằng Tailwind utility classes
          </p>
        </div>

        {/* Buttons Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Buttons</h2>
          <div className="flex flex-wrap gap-4">
            <button className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200">
              Primary
            </button>
            <button className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200">
              Success
            </button>
            <button className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200">
              Danger
            </button>
            <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-6 rounded-lg transition-colors duration-200">
              Secondary
            </button>
            <button className="border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white font-medium py-2 px-6 rounded-lg transition-all duration-200">
              Outline
            </button>
          </div>
        </div>

        {/* Cards Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((item) => (
              <div 
                key={item}
                className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-100 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer"
              >
                <div className="bg-purple-500 text-white w-12 h-12 rounded-full flex items-center justify-center mb-4 text-xl font-bold">
                  {item}
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Card Title {item}
                </h3>
                <p className="text-gray-600 mb-4">
                  This is a beautiful card component built with Tailwind CSS utilities.
                </p>
                <button className="text-purple-600 hover:text-purple-800 font-medium flex items-center gap-2">
                  Learn more
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Form Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Form Elements</h2>
          <form className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="you@example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                placeholder="Your message here..."
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="terms"
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="terms" className="text-sm text-gray-600">
                I agree to the terms and conditions
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Submit Form
            </button>
          </form>
        </div>

        {/* Badges & Tags */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Badges & Tags</h2>
          <div className="flex flex-wrap gap-3">
            <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
              Blue Badge
            </span>
            <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
              Green Badge
            </span>
            <span className="bg-red-100 text-red-800 text-sm font-medium px-3 py-1 rounded-full">
              Red Badge
            </span>
            <span className="bg-yellow-100 text-yellow-800 text-sm font-medium px-3 py-1 rounded-full">
              Yellow Badge
            </span>
            <span className="bg-purple-100 text-purple-800 text-sm font-medium px-3 py-1 rounded-full">
              Purple Badge
            </span>
          </div>
        </div>

        {/* Alerts */}
        <div className="space-y-4">
          <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-900 p-4 rounded-lg">
            <div className="flex items-start">
              <svg className="w-6 h-6 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-medium">Info Alert</p>
                <p className="text-sm mt-1">This is an informational message built with Tailwind.</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border-l-4 border-green-500 text-green-900 p-4 rounded-lg">
            <div className="flex items-start">
              <svg className="w-6 h-6 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-medium">Success Alert</p>
                <p className="text-sm mt-1">Your action was completed successfully!</p>
              </div>
            </div>
          </div>

          <div className="bg-red-50 border-l-4 border-red-500 text-red-900 p-4 rounded-lg">
            <div className="flex items-start">
              <svg className="w-6 h-6 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-medium">Error Alert</p>
                <p className="text-sm mt-1">There was an error processing your request.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 text-sm">
            ✨ Tất cả components trên được xây dựng chỉ với Tailwind CSS utility classes
          </p>
          <p className="text-gray-500 text-xs mt-2">
            Không cần CSS tùy chỉnh! 🎉
          </p>
        </div>
      </div>
    </div>
  );
};

export default TailwindDemo;
