import type { VariantProps } from "class-variance-authority"
import type { FC, PropsWithChildren } from "react"

import { cva } from "class-variance-authority"

const style = cva([], {
  variants: {
    layout: {
      center: [],
      full: ["h-screen"],
    },
  },
  defaultVariants: {
    layout: "center",
  },
})

const Wrapper: FC<PropsWithChildren<WrapperProps>> = ({ children }) => {
  return <div className={style()}>{children}</div>
}

export default Wrapper

type WrapperProps = VariantProps<typeof style>
