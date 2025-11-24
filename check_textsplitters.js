
try {
  const textSplitters = await import('@langchain/textsplitters');
  console.log('Found @langchain/textsplitters');
  console.log(Object.keys(textSplitters));
} catch (e) {
  console.log('Could not import @langchain/textsplitters:', e.message);
}
