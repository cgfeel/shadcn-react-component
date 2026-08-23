import type { VariantProps } from "class-variance-authority"
import type { FC, PropsWithChildren } from "react"

import { cva } from "class-variance-authority"

const defaultLayout = "center"
const container = cva(
  ["flex", "justify-center", "items-center", "group/auth-container"],
  {
    variants: {
      layout: {
        center: [],
        full: ["h-screen"],
      },
    },
    defaultVariants: {
      layout: defaultLayout,
    },
  }
)

const Container: FC<PropsWithChildren<ContainerProps>> = ({
  children,
  layout = defaultLayout,
}) => {
  return (
    <div className={container({ layout })} data-layout={layout}>
      {children}
    </div>
  )
}

export default Container

type ContainerProps = VariantProps<typeof container>
