import type { FC, PropsWithChildren } from "react"

import { cva } from "class-variance-authority"

const style = cva([
  "flex",
  "justify-center",
  "items-center",
  "group-data-[layout=full]/auth-container:flex-1",
  "group-data-[layout=full]/auth-container:h-screen",
])

const Wrapper: FC<PropsWithChildren<WrapperProps>> = ({
  children,
  className,
}) => {
  return <div className={style({ className })}>{children}</div>
}

export default Wrapper

interface WrapperProps {
  className?: string
}
