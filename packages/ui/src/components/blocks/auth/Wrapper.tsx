import type { FC, PropsWithChildren } from "react"

import { cva } from "class-variance-authority"

const style = cva([
  "flex",
  "justify-center",
  "items-center",
  "group-data-[layout=full]/auth-container:flex-1",
  "group-data-[layout=full]/auth-container:h-screen",
])

const Wrapper: FC<PropsWithChildren> = ({ children }) => {
  return <div className={style()}>{children}</div>
}

export default Wrapper
