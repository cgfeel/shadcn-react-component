import type { FC, PropsWithChildren } from "react"

import { cva } from "class-variance-authority"

const style = cva(["w-full", "max-w-lg", "flex-col", "box-border", "p-6"])

const Items: FC<PropsWithChildren<ItemsProps>> = ({ children, className }) => {
  return <div className={style({ className })}>{children}</div>
}

export default Items

interface ItemsProps {
  className?: string
}
