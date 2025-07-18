// Test script to verify canvas installation
import { createCanvas } from 'canvas';

console.log('🧪 Testing canvas installation...');

try {
  const canvas = createCanvas(200, 100);
  const ctx = canvas.getContext('2d');
  
  // Test basic canvas operations
  ctx.fillStyle = 'blue';
  ctx.fillRect(10, 10, 100, 50);
  
  console.log('✅ Canvas module is working correctly!');
  console.log('   Canvas dimensions:', canvas.width, 'x', canvas.height);
  
  // Test if we can generate a buffer
  const buffer = canvas.toBuffer('image/png');
  console.log('✅ Canvas buffer generation works!');
  console.log('   Buffer size:', buffer.length, 'bytes');
  
} catch (error) {
  console.error('❌ Canvas module error:', error.message);
  console.error('   Error details:', error);
}

console.log('🏁 Canvas test completed');
