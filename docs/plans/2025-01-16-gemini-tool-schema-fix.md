# Fix Gemini Tool Schema Conversion for gemini-3-pro-preview

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix the 400 error when using gemini-3-pro-preview model by properly converting OpenAI-style tool schemas to Gemini-compatible format.

**Architecture:** The issue is in `src/api/providers/gemini.ts` where tool declarations are created. Currently it passes `parametersJsonSchema` directly from OpenAI-style tools, but Gemini API requires a different schema format. The fix uses existing `convertOpenAIToolToGeminiFunction` from `gemini-types.ts`.

**Tech Stack:** TypeScript, Google GenAI SDK, @google/genai

---

## Issue Context

**Issue #5093:** 400 Error with gemini-3-pro-preview: "Proto field is not repeating, cannot start list"

The error occurs because tool parameters use OpenAI JSON Schema format (with lowercase "type": "string", "object", etc.) but Gemini API expects uppercase enum values ("STRING", "OBJECT", etc.) without "type" as a field name in the Proto schema.

Example error:

```
Unknown name "type" at 'tools[0].function_declarations[0].parameters.properties[0].value.items.properties[0].value':
Proto field is not repeating, cannot start list.
```

---

## Task 1: Verify the current issue

**Files:**

- Read: `src/api/providers/gemini.ts:176-198`
- Read: `src/services/continuedev/core/llm/openai-adapters/util/gemini-types.ts:117-151`

**Step 1: Read current tool declaration code**

The problem is at lines 184-189 in `gemini.ts`:

```typescript
if (metadata?.tools && metadata.tools.length > 0) {
	tools.push({
		functionDeclarations: metadata.tools.map((tool) => ({
			name: (tool as any).function.name,
			description: (tool as any).function.description,
			parametersJsonSchema: (tool as any).function.parameters, // WRONG FORMAT
		})),
	})
}
```

**Step 2: Verify the converter function exists**

The `convertOpenAIToolToGeminiFunction` at `gemini-types.ts:117-151` correctly converts OpenAI tools to Gemini format, using `parameters` (not `parametersJsonSchema`) and proper type conversion.

---

## Task 2: Fix tool schema conversion in gemini.ts

**Files:**

- Modify: `src/api/providers/gemini.ts:1-30` (add import)
- Modify: `src/api/providers/gemini.ts:176-198` (fix conversion)

**Step 1: Add import for the converter function**

Add at the top of `src/api/providers/gemini.ts` around line 26 with other imports:

```typescript
import { convertOpenAIToolToGeminiFunction } from "../../services/continuedev/core/llm/openai-adapters/util/gemini-types"
```

Find the existing import block around line 26:

```typescript
import { convertAnthropicMessageToGemini } from "../transform/gemini-format"
```

Add the new import right after it:

```typescript
import { convertAnthropicMessageToGemini } from "../transform/gemini-format"
import { convertOpenAIToolToGeminiFunction } from "../../services/continuedev/core/llm/openai-adapters/util/gemini-types"
```

**Step 2: Replace the tool declaration mapping**

Replace lines 182-189 in `src/api/providers/gemini.ts`:

Current code:

```typescript
if (metadata?.tools && metadata.tools.length > 0) {
	tools.push({
		functionDeclarations: metadata.tools.map((tool) => ({
			name: (tool as any).function.name,
			description: (tool as any).function.description,
			parametersJsonSchema: (tool as any).function.parameters,
		})),
	})
}
```

New code:

```typescript
if (metadata?.tools && metadata.tools.length > 0) {
	tools.push({
		functionDeclarations: metadata.tools.map((tool) => {
			const converted = convertOpenAIToolToGeminiFunction(tool)
			return {
				name: converted.name,
				description: converted.description,
				...(converted.parameters ? { parameters: converted.parameters } : {}),
			}
		}),
	})
}
```

**Step 3: Commit**

```bash
git add src/api/providers/gemini.ts
git commit -m "fix(gemini): use proper schema conversion for tool declarations

Fixes #5093 - Use convertOpenAIToolToGeminiFunction to properly
convert OpenAI-style tool schemas to Gemini-compatible format.

The previous code passed parametersJsonSchema directly which caused
400 errors with gemini-3-pro-preview due to incompatible schema format."
```

---

## Task 3: Add unit test for the conversion

**Files:**

- Create: `src/api/providers/__tests__/gemini-tool-conversion.test.ts`

**Step 1: Write the test file**

Create `src/api/providers/__tests__/gemini-tool-conversion.test.ts`:

```typescript
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
```

**Step 2: Run the test**

```bash
npm test -- src/api/providers/__tests__/gemini-tool-conversion.test.ts
```

Expected: PASS

**Step 3: Commit**

```bash
git add src/api/providers/__tests__/gemini-tool-conversion.test.ts
git commit -m "test(gemini): add unit tests for tool schema conversion"
```

---

## Task 4: Add integration test

**Files:**

- Modify: `src/api/transform/__tests__/gemini-format.spec.ts` (if exists) or create new test

**Step 1: Check existing test file**

```bash
ls -la src/api/transform/__tests__/gemini-format.spec.ts
```

**Step 2: Add integration test if file exists, otherwise create new**

Add to `src/api/transform/__tests__/gemini-format.spec.ts`:

```typescript
describe("Gemini tool integration", () => {
	it("should properly convert complex tool schemas", () => {
		const mockTool = {
			type: "function" as const,
			function: {
				name: "read_file",
				description: "Read a file",
				parameters: {
					type: "object" as const,
					properties: {
						path: {
							type: "string" as const,
							description: "File path",
						},
					},
					required: ["path"],
				},
			},
		}

		const result = convertOpenAIToolToGeminiFunction(mockTool)

		// Verify Gemini format (uppercase types, no 'type' in wrong places)
		expect(result.parameters?.type).toBe("OBJECT")
		expect(result.parameters?.properties?.path?.type).toBe("STRING")
	})
})
```

**Step 3: Run tests**

```bash
npm test -- src/api/transform/__tests__/gemini-format.spec.ts
```

**Step 4: Commit**

```bash
git add src/api/transform/__tests__/gemini-format.spec.ts
git commit -m "test(gemini): add integration tests for tool schema conversion"
```

---

## Task 5: Run full test suite

**Step 1: Run all tests**

```bash
npm test
```

Expected: All tests pass

**Step 2: Run TypeScript type checking**

```bash
npm run typecheck
```

Expected: No type errors

---

## Task 6: Manual testing verification

**Step 1: Build the extension**

```bash
npm run build
```

**Step 2: Test with gemini-3-pro-preview**

Since we can't run actual API calls in unit tests, the fix should be verified by:

1. Loading the extension in VS Code
2. Setting model to `gemini-3-pro-preview`
3. Sending a message that would trigger tool use
4. Verifying no 400 error occurs

**Note:** This requires valid API credentials and should be tested by the reporter of issue #5093.

---

## Summary

This fix addresses the root cause of #5093 by using the existing `convertOpenAIToolToGeminiFunction` converter instead of passing raw OpenAI schemas to Gemini API.

**Key changes:**

1. Import `convertOpenAIToolToGeminiFunction` from gemini-types.ts
2. Replace direct `parametersJsonSchema` usage with proper conversion
3. Use `parameters` (not `parametersJsonSchema`) in the output

**Why this works:**

- Gemini API uses Proto-based schemas with uppercase enum types (STRING, OBJECT, etc.)
- OpenAI uses JSON Schema with lowercase types (string, object, etc.)
- The converter handles this translation properly
