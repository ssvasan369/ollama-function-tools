import { Ollama } from "ollama";
import { toolsString, executeFunction } from "./tools";

const ollama = new Ollama({ host: 'http://127.0.0.1:11434' });

const systemPrompt = `You are a helpful assistant that takes a question and finds the most appropriate tool or tools to execute, along with the parameters required to run the tool. Respond as JSON using the following schema: {"functionName": "function name", "parameters": [{"parameterName": "name of parameter", "parameterValue": "value of parameter"}]}. The tools are: ${toolsString}`;

const promptAndAnswer = async (prompt: string) => {
    try {
        const response = await ollama.generate({
            model: "llama3.1:latest",
            system: systemPrompt,
            prompt,
            stream: false,
            format: "json",
        });

        const responseData = response.response.trim();
        const responseObject = JSON.parse(responseData);

        // Ensure that the response contains a valid function name and parameters
        if (responseObject.functionName && responseObject.parameters) {
            executeFunction(responseObject.functionName, responseObject.parameters);
        } else {
            console.error("Invalid response format:", responseObject);
        }
    } catch (error) {
        console.error("Error processing prompt:", prompt, error);
    }
};

// List of prompts to process
const prompts = [
    "What is the weather in London?",
    "What is the weather at 41.881832, -87.640406?",
    "Who is the current CEO of Tesla?",
    "What is located at 41.881832, -87.640406?",
];

// Process each prompt sequentially
const processPrompts = async () => {
    for (const prompt of prompts) {
        console.log(`\nProcessing: ${prompt}\n`);
        await promptAndAnswer(prompt);
    }
};

processPrompts();
