import preprocessingService from '../services/preprocessingService.js';

const sampleInput = [
    {
        content: "  <div><h1>Header</h1><p>  Hello &nbsp; World!  </p><ul><li>Item 1</li><li>Item 2</li></ul></div>  ",
        metadata: {
            category: "culture",
            topic: "diversity"
        }
    }
];

console.log("Original Input:", JSON.stringify(sampleInput, null, 2));

const processed = preprocessingService.preprocessDocuments(sampleInput);

console.log("Processed Output:", JSON.stringify(processed, null, 2));

// verification checks
const outputContent = processed[0].content;
if (outputContent.includes("<div>") || outputContent.includes("&nbsp;")) {
    console.error("FAIL: HTML or entities not removed");
    process.exit(1);
}
if (outputContent.includes("  ")) {
    console.error("FAIL: Extra spaces not removed");
    process.exit(1);
}
if (!outputContent.includes("Hello World!")) {
    console.error("FAIL: Content missing or malformed");
    process.exit(1);
}

console.log("SUCCESS: Preprocessing verification passed!");
