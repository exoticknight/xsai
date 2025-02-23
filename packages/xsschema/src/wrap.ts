import type { StandardSchemaV1 } from '@standard-schema/spec'

export const wrapArray = async <T extends StandardSchemaV1>(schema: T): never | Promise<T> => {
  const vendor = schema['~standard'].vendor
  try {
    // eslint-disable-next-line ts/no-unsafe-assignment
    const { array } = await import(vendor)
    // eslint-disable-next-line ts/no-unsafe-return, ts/no-unsafe-call
    return array(schema)
  }
  catch {
    throw new Error(`xsschema: Unsupported schema vendor "${vendor}"`)
  }
}

export const wrapObject = async <T extends StandardSchemaV1>(schema: T, name: string): never | Promise<T> => {
  const vendor = schema['~standard'].vendor
  try {
    // eslint-disable-next-line ts/no-unsafe-assignment
    const { object } = await import(vendor)
    // eslint-disable-next-line ts/no-unsafe-return, ts/no-unsafe-call
    return object({
      [name]: schema,
    })
  }
  catch {
    throw new Error(`xsschema: Unsupported schema vendor "${vendor}"`)
  }
}
