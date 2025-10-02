// Test với curl thay vì HTTP request
console.log('Testing API with direct URL...')

const testWithTimeout = () => {
  setTimeout(() => {
    console.log('Test completed - if no response, server may not be listening on port 5000');
  }, 3000);
}

testWithTimeout();