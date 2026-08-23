import type { FC, PropsWithChildren } from "react"

import { cva } from "class-variance-authority"

const container = cva(["h-screen", "flex", "justify-center", "items-center"])

const LoginContainer: FC<PropsWithChildren> = ({ children }) => {
  return <div className={container()}>{children}</div>
}

export default LoginContainer
