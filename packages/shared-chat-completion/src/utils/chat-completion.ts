import { clean, objCamelToSnake } from '@xsai/shared'

import type { ChatCompletionOptions, Tool } from '../types'

export const chatCompletion = async <T extends ChatCompletionOptions>(options: T) => await fetch(options.url, {
  body: JSON.stringify(clean({
    ...objCamelToSnake(options),
    abortSignal: undefined,
    headers: undefined,
    tools: (options.tools as Tool[] | undefined)?.map(tool => ({
      function: tool.function,
      type: 'function',
    })),
    url: undefined,
  })),
  headers: {
    'Content-Type': 'application/json',
    ...options.headers,
  },
  method: 'POST',
  signal: options.abortSignal,
})
