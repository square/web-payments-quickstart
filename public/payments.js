// expects https://web.squarecdn.com/v0/square.js to be loaded first
if (!window.Square) {
  throw new Error('Square.js failed to load properly');
}
