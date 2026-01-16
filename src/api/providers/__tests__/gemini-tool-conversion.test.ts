import { describe, it, expect } from "vitest"
import { convertOpenAIToolToGeminiFunction } from "../../../services/continuedev/core/llm/openai-adapters/util/gemini-types"

describe("convertOpenAIToolToGeminiFunction", () => {
	it("should convert OpenAI tool with nested object schema to Gemini format", () => {
		const openaiTool = {
			type: "function" as const,
			function: {
				name: "test_tool",
				description: "A test tool",
				parameters: {
					type: "object",
					properties: {
						nested: {
							type: "object",
							properties: {
								value: {
									type: "string",
									description: "A string value",
								},
							},
						},
					},
					required: [],
				},
			},
		}

		const result = convertOpenAIToolToGeminiFunction(openaiTool)

		expect(result.name).toBe("test_tool")
		expect(result.description).toBe("A test tool")
		expect(result.parameters).toBeDefined()
		expect(result.parameters?.type).toBe("OBJECT")
		expect(result.parameters?.properties?.nested?.type).toBe("OBJECT")
		expect(result.parameters?.properties?.nested?.properties?.value?.type).toBe("STRING")
	})

	it("should handle array items with proper type conversion", () => {
		const openaiTool = {
			type: "function" as const,
			function: {
				name: "array_tool",
				description: "Tool with array parameter",
				parameters: {
					type: "object",
					properties: {
						items: {
							type: "array",
							items: {
								type: "string",
							},
						},
					},
					required: [],
				},
			},
		}

		const result = convertOpenAIToolToGeminiFunction(openaiTool)

		expect(result.parameters?.properties?.items?.type).toBe("ARRAY")
		expect(result.parameters?.properties?.items?.items?.type).toBe("STRING")
	})
})
