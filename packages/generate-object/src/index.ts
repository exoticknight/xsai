import type { GenerateTextOptions, GenerateTextResult } from '@xsai/generate-text'
import type { Infer, InferIn, Schema } from 'xsschema'

import { generateText } from '@xsai/generate-text'
import { toJSONSchema, validate, wrapArray, wrapObject } from 'xsschema'

export interface GenerateObjectOptions<T extends Schema> extends GenerateTextOptions {
  schema: T
  schemaDescription?: string
  schemaName?: string
}

type GenerateResult<O> = GenerateTextResult & { object: O }

type OptionOutput = 'array' | 'no-schema' | 'object'

export async function generateObject<T extends Schema>(options: GenerateObjectOptions<T> & { output: 'array' }): Promise<GenerateResult<Array<Infer<T>>>>
export async function generateObject<T extends Schema>(options: GenerateObjectOptions<T> & { output: 'object' }): Promise<GenerateResult<Infer<T>>>
export async function generateObject<T extends Schema>(options: GenerateObjectOptions<T> & { output: 'no-schema' }): Promise<GenerateResult<Infer<T>>>
export async function generateObject<T extends Schema>(options: GenerateObjectOptions<T>): Promise<GenerateResult<Infer<T>>>
export async function generateObject<T extends Schema>(options: GenerateObjectOptions<T> & { output?: OptionOutput }) {
  const { schema: rawSchema } = options

  let wrappedSchema = rawSchema
  if (options.output === 'array') {
    wrappedSchema = await wrapObject(await wrapArray(options.schema), 'elements')
  }

  const schema = await toJSONSchema(wrappedSchema)

  const rawRet = await generateText({
    ...options,
    response_format: {
      json_schema: {
        description: options.schemaDescription,
        name: options.schemaName ?? 'json_schema',
        schema,
        strict: true,
      },
      type: 'json_schema',
    },
    schema,
    schemaDescription: options.schemaDescription,
    schemaName: options.schemaName,
  })

  const { finishReason, messages, steps, text, toolCalls, toolResults, usage } = rawRet

  const ret: Infer<T> = await validate(wrappedSchema, JSON.parse(text!) as InferIn<T>)

  if (options.output === 'array') {
    return {
      finishReason,
      messages,
      object: (ret as { elements: Array<Infer<T>> }).elements,
      steps,
      toolCalls,
      toolResults,
      usage,
    }
  }

  return {
    finishReason,
    messages,
    object: ret,
    steps,
    text,
    toolCalls,
    toolResults,
    usage,
  }
}
