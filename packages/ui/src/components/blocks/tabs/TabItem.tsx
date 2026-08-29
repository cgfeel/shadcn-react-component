import type { FC, PropsWithChildren } from "react"

import { cva } from "class-variance-authority"
import { useContext } from "react"
import { ContainerContext } from "./Container"

const style = cva(["relative pb-2 text-sm", "text-gray-400"], {
  variants: {
    active: {
      true: "text-black",
    },
  },
})

const TabItem: FC<PropsWithChildren<TabItemProps>> = ({
  children,
  className,
  name,
}) => {
  const { current } = useContext(ContainerContext)
  return (
    <button
      className={style({ active: current === name, className })}
      data-tab-name={name}
    >
      {children}
    </button>
  )
}

export default TabItem

interface TabItemProps {
  className?: string
  name?: string
}
