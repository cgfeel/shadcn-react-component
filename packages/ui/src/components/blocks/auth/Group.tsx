import type { VariantProps } from "class-variance-authority"
import type { FC, PropsWithChildren } from "react"

import { cva } from "class-variance-authority"

const styles = cva(
  [
    "relative",
    "flex-1",
    "flex",
    "group-data-[layout=full]/auth-container:h-screen",
  ],
  {
    variants: {
      layout: {
        center: ["justify-center", "items-center"],
        start: ["justify-start", "items-start"],
      },
    },
    defaultVariants: {
      layout: "center",
    },
  }
)

const AuthGroup: FC<PropsWithChildren<AuthGroupProps>> = ({
  children,
  className,
  layout,
}) => {
  return <div className={styles({ className, layout })}>{children}</div>
}

export default AuthGroup

interface AuthGroupProps extends VariantProps<typeof styles> {
  className?: string
}
