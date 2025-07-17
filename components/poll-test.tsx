/**
 * Simple test to debug poll creation issue
 * Add this to a page and test poll creation manually
 */

"use client"

export function PollTestComponent() {
  const testPollCreation = async () => {
    console.log('🧪 Testing poll creation manually...')
    
    const testData = {
      title: "Test Poll Discussion",
      content: "", // Empty content to test if polls work without content
      content_type: "poll",
      category_id: null,
      poll: {
        question: "What is your favorite color?",
        allowMultipleSelections: false,
        isAnonymous: false,
        expiresAt: null,
        options: [
          { text: "Red", emoji: "🔴" },
          { text: "Blue", emoji: "🔵" },
          { text: "Green", emoji: "🟢" }
        ]
      }
    }

    console.log('📤 Sending test data:', testData)

    try {
      const response = await fetch('/api/discussions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      })

      console.log('📥 Response status:', response.status)
      
      if (response.ok) {
        const result = await response.json()
        console.log('✅ Success! Result:', result)
      } else {
        const error = await response.text()
        console.log('❌ Error response:', error)
      }
    } catch (error) {
      console.error('❌ Request failed:', error)
    }
  }

  return (
    <div className="p-4 border border-gray-300 rounded bg-yellow-50">
      <h3 className="font-bold mb-2">Poll Creation Test</h3>
      <p className="text-sm text-gray-600 mb-4">
        Click the button below to test poll creation. Check the browser console for logs.
      </p>
      <button 
        onClick={testPollCreation}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Test Poll Creation
      </button>
    </div>
  )
}
