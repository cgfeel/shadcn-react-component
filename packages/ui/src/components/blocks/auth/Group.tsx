import type { FC, PropsWithChildren } from "react"

import { cva } from "class-variance-authority"

const styles = cva([
  "relative",
  "flex-1",
  "min-h-0",
  "group-data-[layout=full]/auth-container:h-screen",
])

const AuthGroup: FC<PropsWithChildren> = ({ children }) => {
  return <div className={styles()}>{children}</div>
}

export default AuthGroup
