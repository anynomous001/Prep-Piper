"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testProblemSolvingEvaluator = testProblemSolvingEvaluator;
exports.testTechnicalSkillsEvaluator = testTechnicalSkillsEvaluator;
exports.testAggregatorMethod = testAggregatorMethod;
exports.testCompleteWorkflow = testCompleteWorkflow;
exports.testErrorHandling = testErrorHandling;
exports.runAllTests = runAllTests;
// test.ts
const index_1 = require("./index");
// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================
// Add this utility function at the top of test.ts
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function createFreshState() {
    return JSON.parse(JSON.stringify(index_1.initialState));
}
function logTestHeader(testName) {
    console.log("\n" + "=".repeat(80));
    console.log(`🧪 ${testName.toUpperCase()}`);
    console.log("=".repeat(80));
}
function logTestResult(testName, passed, duration) {
    const status = passed ? "✅ PASSED" : "❌ FAILED";
    console.log(`\n${status} | ${testName} | Duration: ${duration}ms`);
}
function validateScores(state) {
    const scores = [
        state.problem_solving_score,
        state.analytical_thinking_score,
        state.debugging_potential_score,
        state.technical_consistency_score,
        state.technical_depth_score,
        state.overall_score
    ];
    return scores.every(score => score >= 0 && score <= 10);
}
// =============================================================================
// INDIVIDUAL TEST FUNCTIONS
// =============================================================================
async function testProblemSolvingEvaluator(evaluator) {
    logTestHeader("Problem Solving Evaluator Test");
    const startTime = Date.now();
    let passed = false;
    let error = null;
    try {
        const state = createFreshState();
        console.log("📊 Initial State:");
        console.log(`   Position: ${state.position_evaluated_for}`);
        console.log(`   Conversation Length: ${state.interview_data.conversation_history.length}`);
        console.log("\n🚀 Running Problem Solving Evaluation...");
        const result = await evaluator.evaluateProblemSolvingSkill(state);
        console.log("\n📋 Results:");
        console.log(`   Problem Solving Score: ${result.problem_solving_score}/10`);
        console.log(`   Analytical Thinking Score: ${result.analytical_thinking_score}/10`);
        console.log(`   Debugging Potential Score: ${result.debugging_potential_score}/10`);
        console.log(`   Problem Instances Found: ${result.problem_solving_instances.length}`);
        console.log(`   Current Step: ${result.current_step}`);
        console.log(`   Errors: ${result.errors.length}`);
        if (result.problem_solving_instances.length > 0) {
            console.log("\n🔍 Problem Solving Instances:");
            result.problem_solving_instances.forEach((instance, index) => {
                console.log(`   ${index + 1}. ${instance.problem_statement.substring(0, 60)}...`);
                console.log(`      Quality: ${instance.approach_quality}/10`);
                console.log(`      Effectiveness: ${instance.solution_effectiveness}/10`);
                console.log(`      Clarity: ${instance.reasoning_clarity}/10`);
            });
        }
        // Validation
        const validationChecks = [
            result.current_step === "llm2_completed",
            result.problem_solving_score >= 0 && result.problem_solving_score <= 10,
            result.analytical_thinking_score >= 0 && result.analytical_thinking_score <= 10,
            result.debugging_potential_score >= 0 && result.debugging_potential_score <= 10,
            Array.isArray(result.problem_solving_instances),
            typeof result.problem_solving_approach === 'string',
            result.errors.length === 0
        ];
        const passedChecks = validationChecks.filter(Boolean).length;
        console.log(`\n📊 Validation: ${passedChecks}/${validationChecks.length} checks passed`);
        passed = passedChecks === validationChecks.length;
    }
    catch (err) {
        error = err instanceof Error ? err.message : String(err);
        console.error("❌ Error:", error);
    }
    const duration = Date.now() - startTime;
    logTestResult("Problem Solving Evaluator", passed, duration);
    return { testName: "Problem Solving Evaluator", passed, duration, error };
}
async function testTechnicalSkillsEvaluator(evaluator) {
    logTestHeader("Technical Skills Evaluator Test");
    const startTime = Date.now();
    let passed = false;
    let error = null;
    try {
        const state = createFreshState();
        console.log("🚀 Running Technical Skills Evaluation...");
        const result = await evaluator.evaluateTechnicalSkills(state);
        console.log("\n📋 Results:");
        console.log(`   Technical Skills Assessed: ${result.technical_skills.length}`);
        console.log(`   Technical Consistency Score: ${result.technical_consistency_score}/10`);
        console.log(`   Technical Depth Score: ${result.technical_depth_score}/10`);
        console.log(`   Technical Strengths: ${result.technical_strengths.length}`);
        console.log(`   Knowledge Gaps: ${result.technical_knowledge_gaps.length}`);
        console.log(`   Current Step: ${result.current_step}`);
        console.log(`   Errors: ${result.errors.length}`);
        if (result.technical_skills.length > 0) {
            console.log("\n🔍 Technical Skills Assessment:");
            result.technical_skills.forEach((skill, index) => {
                console.log(`   ${index + 1}. ${skill.skill_name}`);
                console.log(`      Level: ${skill.proficiency_level}`);
                console.log(`      Confidence: ${skill.confidence}`);
                console.log(`      Evidence Count: ${skill.evidence.length}`);
            });
        }
        if (result.technical_strengths.length > 0) {
            console.log("\n💪 Technical Strengths:", result.technical_strengths.join(", "));
        }
        if (result.technical_knowledge_gaps.length > 0) {
            console.log("\n📚 Knowledge Gaps:", result.technical_knowledge_gaps.join(", "));
        }
        // Validation
        const validationChecks = [
            result.current_step === "llm1_completed",
            result.technical_consistency_score >= 0 && result.technical_consistency_score <= 10,
            result.technical_depth_score >= 0 && result.technical_depth_score <= 10,
            Array.isArray(result.technical_skills),
            Array.isArray(result.technical_strengths),
            Array.isArray(result.technical_knowledge_gaps),
            result.technical_skills.every(skill => typeof skill.skill_name === 'string' &&
                ['beginner', 'intermediate', 'advanced', 'expert'].includes(skill.proficiency_level) &&
                Array.isArray(skill.evidence) &&
                ['low', 'medium', 'high', 'very_high'].includes(skill.confidence)),
            result.errors.length === 0
        ];
        const passedChecks = validationChecks.filter(Boolean).length;
        console.log(`\n📊 Validation: ${passedChecks}/${validationChecks.length} checks passed`);
        passed = passedChecks === validationChecks.length;
    }
    catch (err) {
        error = err instanceof Error ? err.message : String(err);
        console.error("❌ Error:", error);
    }
    const duration = Date.now() - startTime;
    logTestResult("Technical Skills Evaluator", passed, duration);
    return { testName: "Technical Skills Evaluator", passed, duration, error };
}
async function testAggregatorMethod(evaluator) {
    logTestHeader("Aggregator Method Test");
    const startTime = Date.now();
    let passed = false;
    let error = null;
    try {
        const state = createFreshState();
        console.log("1️⃣ Running Problem Solving Evaluation (prerequisite)...");
        await evaluator.evaluateProblemSolvingSkill(state);
        console.log("2️⃣ Running Technical Skills Evaluation (prerequisite)...");
        await evaluator.evaluateTechnicalSkills(state);
        console.log("3️⃣ Running Result Aggregation...");
        const result = await evaluator.aggregator(state);
        console.log("\n📊 Final Results:");
        console.log(`   Overall Score: ${result.overall_score}/10`);
        console.log(`   Key Strengths: ${result.key_strengths.length}`);
        console.log(`   Critical Weaknesses: ${result.critical_weaknesses.length}`);
        console.log(`   Evaluation Timestamp: ${result.evaluation_timestamp}`);
        console.log(`   Candidate ID: ${result.candidate_id}`);
        console.log(`   Current Step: ${result.current_step}`);
        console.log(`   Errors: ${result.errors.length}`);
        console.log("\n💪 Key Strengths:");
        result.key_strengths.forEach((strength, index) => {
            console.log(`   ${index + 1}. ${strength}`);
        });
        console.log("\n⚠️ Critical Weaknesses:");
        result.critical_weaknesses.forEach((weakness, index) => {
            console.log(`   ${index + 1}. ${weakness}`);
        });
        // Validation
        const validationChecks = [
            result.current_step === "completed",
            result.overall_score >= 0 && result.overall_score <= 10,
            result.evaluation_timestamp !== null,
            result.candidate_id !== null,
            Array.isArray(result.key_strengths),
            Array.isArray(result.critical_weaknesses),
            result.key_strengths.length > 0 || result.critical_weaknesses.length > 0,
            result.overall_score > 0
        ];
        const passedChecks = validationChecks.filter(Boolean).length;
        console.log(`\n📊 Validation: ${passedChecks}/${validationChecks.length} checks passed`);
        passed = passedChecks === validationChecks.length;
    }
    catch (err) {
        error = err instanceof Error ? err.message : String(err);
        console.error("❌ Error:", error);
    }
    const duration = Date.now() - startTime;
    logTestResult("Aggregator Method", passed, duration);
    return { testName: "Aggregator Method", passed, duration, error };
}
async function testCompleteWorkflow(evaluator) {
    logTestHeader("Complete Workflow Test");
    const startTime = Date.now();
    let passed = false;
    let error = null;
    try {
        const state = createFreshState();
        console.log("🔄 Running Complete Evaluation Workflow...");
        console.log("   Step 1/3: Problem Solving Evaluation");
        await evaluator.evaluateProblemSolvingSkill(state);
        console.log("   Step 2/3: Technical Skills Evaluation");
        await evaluator.evaluateTechnicalSkills(state);
        console.log("   Step 3/3: Result Aggregation");
        const result = await evaluator.aggregator(state);
        console.log("\n🎯 Workflow Summary:");
        console.log("   Problem Solving:");
        console.log(`     Score: ${result.problem_solving_score}/10`);
        console.log(`     Instances: ${result.problem_solving_instances.length}`);
        console.log(`     Analytical: ${result.analytical_thinking_score}/10`);
        console.log(`     Debugging: ${result.debugging_potential_score}/10`);
        console.log("   Technical Skills:");
        console.log(`     Skills Assessed: ${result.technical_skills.length}`);
        console.log(`     Consistency: ${result.technical_consistency_score}/10`);
        console.log(`     Depth: ${result.technical_depth_score}/10`);
        console.log(`     Strengths: ${result.technical_strengths.length}`);
        console.log(`     Gaps: ${result.technical_knowledge_gaps.length}`);
        console.log("   Final Assessment:");
        console.log(`     Overall Score: ${result.overall_score}/10`);
        console.log(`     Key Strengths: ${result.key_strengths.length}`);
        console.log(`     Weaknesses: ${result.critical_weaknesses.length}`);
        console.log(`     Status: ${result.current_step}`);
        console.log(`     Total Errors: ${result.errors.length}`);
        // Comprehensive validation
        const workflowSuccess = (result.current_step === "completed" &&
            result.overall_score > 0 &&
            result.problem_solving_score > 0 &&
            result.technical_skills.length > 0 &&
            result.errors.length === 0 &&
            validateScores(result));
        passed = workflowSuccess;
    }
    catch (err) {
        error = err instanceof Error ? err.message : String(err);
        console.error("❌ Error:", error);
    }
    const duration = Date.now() - startTime;
    logTestResult("Complete Workflow", passed, duration);
    return { testName: "Complete Workflow", passed, duration, error };
}
async function testErrorHandling(evaluator) {
    logTestHeader("Error Handling Test");
    const startTime = Date.now();
    let passed = false;
    let error = null;
    try {
        console.log("🚨 Testing with incomplete data...");
        const incompleteState = {
            ...createFreshState(),
            technical_skills: [],
            technical_consistency_score: 0
        };
        const result = await evaluator.aggregator(incompleteState);
        console.log("📋 Error Handling Results:");
        console.log(`   Errors Generated: ${result.errors.length}`);
        console.log(`   Current Step: ${result.current_step}`);
        if (result.errors.length > 0) {
            console.log("   Errors:");
            result.errors.forEach((err, index) => {
                console.log(`     ${index + 1}. ${err}`);
            });
        }
        const hasExpectedError = result.errors.some(err => err.includes("Missing required evaluation data") ||
            err.includes("Not all LLM evaluations completed"));
        passed = hasExpectedError;
    }
    catch (err) {
        error = err instanceof Error ? err.message : String(err);
        console.error("❌ Error:", error);
    }
    const duration = Date.now() - startTime;
    logTestResult("Error Handling", passed, duration);
    return { testName: "Error Handling", passed, duration, error };
}
// =============================================================================
// MAIN TEST SUITE
// =============================================================================
// =============================================================================
// MAIN TEST SUITE WITH RATE LIMIT HANDLING
// =============================================================================
async function runAllTests() {
    console.log("\n🎯 STARTING COMPREHENSIVE INTERVIEW EVALUATOR TEST SUITE");
    console.log("Date:", new Date().toISOString());
    console.log("Model: llama-3.3-70b-versatile");
    console.log("⏱️ Rate Limit Protection: 2-second delays between tests");
    // Environment check
    if (!(0, index_1.loadEnvironment)()) {
        console.error("❌ Environment setup failed - missing API keys");
        throw new Error("Environment configuration required");
    }
    console.log("✅ Environment loaded successfully");
    const evaluator = new index_1.InterviewEvaluator();
    console.log("✅ Evaluator instance created");
    const results = [];
    const overallStartTime = Date.now();
    try {
        // Run tests with delays to avoid rate limiting
        console.log("\n🚀 Running tests sequentially with rate limit protection...");
        // Test 1: Problem Solving Evaluator
        console.log("⏳ Running Problem Solving Evaluator...");
        results.push(await testProblemSolvingEvaluator(evaluator));
        console.log("⏱️ Waiting 10 seconds before next test...");
        await sleep(10000);
        // Test 2: Technical Skills Evaluator
        console.log("⏳ Running Technical Skills Evaluator...");
        results.push(await testTechnicalSkillsEvaluator(evaluator));
        console.log("⏱️ Waiting 20 seconds before next test...");
        await sleep(20000);
        // Test 3: Aggregator Method
        console.log("⏳ Running Aggregator Method...");
        results.push(await testAggregatorMethod(evaluator));
        console.log("⏱️ Waiting 30 seconds before next test...");
        await sleep(30000);
        // Test 4: Complete Workflow
        console.log("⏳ Running Complete Workflow...");
        results.push(await testCompleteWorkflow(evaluator));
        console.log("⏱️ Waiting 10 seconds before next test...");
        await sleep(10000);
        // Test 5: Error Handling
        console.log("⏳ Running Error Handling...");
        results.push(await testErrorHandling(evaluator));
        const overallDuration = Date.now() - overallStartTime;
        // Generate summary
        const passed = results.filter(r => r.passed).length;
        const total = results.length;
        const success = passed === total;
        console.log("\n" + "=".repeat(80));
        console.log("📊 TEST SUMMARY");
        console.log("=".repeat(80));
        console.log(`Overall Status: ${success ? '✅ SUCCESS' : '❌ FAILED'}`);
        console.log(`Tests Passed: ${passed}/${total}`);
        console.log(`Total Duration: ${overallDuration}ms (including delays)`);
        console.log(`Actual Test Time: ${overallDuration - (4 * 2000)}ms (excluding delays)`);
        console.log("\nDetailed Results:");
        results.forEach(result => {
            const status = result.passed ? "✅" : "❌";
            console.log(`   ${status} ${result.testName} (${result.duration}ms)`);
            if (result.error) {
                console.log(`      Error: ${result.error}`);
            }
        });
        if (!success) {
            console.log("\n❌ Some tests failed. Check the detailed logs above.");
        }
        else {
            console.log("\n🎉 All tests passed successfully!");
            console.log("🛡️ Rate limiting handled with 2-second delays between tests");
        }
        return {
            success,
            totalTests: total,
            passedTests: passed,
            failedTests: total - passed,
            totalDuration: overallDuration,
            results
        };
    }
    catch (err) {
        console.error("\n💥 Test suite crashed:", err);
        throw err;
    }
}
//# sourceMappingURL=test.js.map