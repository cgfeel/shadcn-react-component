export const layouts = ["full", "center"] as const
export const variants = ["spread", "standalone"] as const

export const isItem = <T extends readonly unknown[]>(
  val: unknown,
  items: T
): val is T[number] => items.map(String).includes(String(val ?? ""))
