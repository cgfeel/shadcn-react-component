import type { FC } from "react"

import { cva } from "class-variance-authority"
import { useCallback, useContext, useEffect, useRef } from "react"
import { ContainerContext } from "./Container"

const style = cva([
  "absolute",
  "bottom-0",
  "h-0.5",
  "bg-black",
  "pointer-events-none",
])

const Indicator: FC<IndicatorProps> = ({ className }) => {
  const { setHandle } = useContext(ContainerContext)
  const indicatorRef = useRef<HTMLSpanElement>(null)

  // 这里和容器中 indicatorRef 初始动画原理是一样的，不同的是这里负责移动动画
  const moveIndicator = useCallback((key: string, container: HTMLElement) => {
    const btn = container.querySelector(`button[data-tab-key="${key}"]`)
    if (btn instanceof HTMLElement && indicatorRef.current) {
      const parentRect = container.getBoundingClientRect()
      const rect = btn.getBoundingClientRect()

      gsap.to(indicatorRef.current, {
        left: rect.left - parentRect.left,
        width: rect.width,
        duration: 0.3,
        ease: "power2.out",
      })
    }
  }, [])

  useEffect(() => {
    setHandle(moveIndicator)
  }, [moveIndicator, setHandle])

  return (
    <span
      className={style({ className })}
      ref={indicatorRef}
      data-tab-indicator
    />
  )
}

export default Indicator

interface IndicatorProps {
  className?: string
}
