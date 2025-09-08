// test-runner.ts
import { runAllTests } from './test';

async function main() {
    console.log("🚀 Interview Evaluator Test Runner");
    console.log("===================================");
    
    try {
        const summary = await runAllTests();
        
        if (summary.success) {
            console.log("\n🎉 All tests completed successfully!");
            console.log(`✅ ${summary.passedTests}/${summary.totalTests} tests passed`);
            console.log(`⏱️ Total execution time: ${summary.totalDuration}ms`);
            process.exit(0);
        } else {
            console.log("\n💥 Some tests failed!");
            console.log(`❌ ${summary.failedTests}/${summary.totalTests} tests failed`);
            console.log(`⏱️ Total execution time: ${summary.totalDuration}ms`);
            
            // List failed tests
            const failedTests = summary.results.filter(r => !r.passed);
            if (failedTests.length > 0) {
                console.log("\nFailed Tests:");
                failedTests.forEach(test => {
                    console.log(`   - ${test.testName}: ${test.error || 'Unknown error'}`);
                });
            }
            
            process.exit(1);
        }
        
    } catch (error) {
        console.error("\n💥 Test runner failed:");
        
        if (error instanceof Error) {
            console.error(`Error: ${error.message}`);
            
            // Provide troubleshooting tips for common issues
            if (error.message.includes("tool_use_failed")) {
                console.error("\n🔧 Troubleshooting Suggestions:");
                console.error("  1. Check if Groq API key is valid and active");
                console.error("  2. Verify model 'llama-3.3-70b-versatile' is available");
                console.error("  3. Check your internet connection");
                console.error("  4. Try reducing the input conversation length");
                console.error("  5. Check Groq API rate limits and quotas");
            } else if (error.message.includes("Environment")) {
                console.error("\n🔧 Environment Setup Required:");
                console.error("  1. Create a .env file in your project root");
                console.error("  2. Add: GROQ_API_KEY=your_groq_api_key_here");
                console.error("  3. Make sure the .env file is in the correct location");
            } else if (error.message.includes("Network")) {
                console.error("\n🔧 Network Issues:");
                console.error("  1. Check your internet connection");
                console.error("  2. Try again in a few minutes");
                console.error("  3. Check if Groq services are operational");
            }
        } else {
            console.error(`Unknown error: ${error}`);
        }
        
        process.exit(1);
    }
}

// Handle uncaught exceptions
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

// Run the test suite
if (require.main === module) {
    main();
}

export { main as runTestSuite };
