"use client"

import type { ContextSafeFunc } from "@gsap/react"
import type { VariantProps } from "class-variance-authority"
import type { FC, PropsWithChildren, ReactNode } from "react"

import { useGSAP } from "@gsap/react"
import { cva } from "class-variance-authority"
import gsap from "gsap"
import { createContext, useCallback, useRef, useState } from "react"

const wrapper = cva(["relative", "flex", "gap-6", "border-b"], {
  variants: {
    layout: { line: "border-b" },
  },
})

const ContainerContext = createContext<WrapperContextInstance>({
  setCurrent: () => {},
  setHandle: () => {},
})

const Container: FC<PropsWithChildren<ContainerProps>> = ({
  active,
  children,
  className,
  items,
  layout,
}) => {
  const contentRef = useRef<HTMLDivElement>(null)
  const tabsWrapperRef = useRef<HTMLDivElement>(null)
  const handleRef = useRef<
    ((tab: string, container: HTMLElement) => void) | null
  >(null)

  // 初始状态和初始动画的位置
  const [current, setCurrent] = useState(active)
  const { contextSafe } = useGSAP(
    () => {
      const parentElem = contentRef.current
      const activeBtn = parentElem?.querySelector(
        `button[data-tab-name="${active}"]`
      )
      const indicator = parentElem?.querySelector(`[data-tab-indicator]`)

      if (
        parentElem &&
        activeBtn instanceof HTMLElement &&
        indicator instanceof HTMLElement
      ) {
        const parentRect = parentElem.getBoundingClientRect()
        const rect = activeBtn.getBoundingClientRect()

        gsap.set(indicator, {
          left: rect.left - parentRect.left,
          width: rect.width,
        })
      }
    },
    { scope: contentRef, dependencies: [] }
  )

  const handleClick = useCallback(
    (selectkey: string) => {
      if (selectkey === current || !tabsWrapperRef.current) return
      setCurrent(selectkey)
      handleRef.current?.(selectkey, tabsWrapperRef.current)
    },
    [current]
  )

  const setHandle = useCallback(
    (callback: (tab: string, container: HTMLElement) => void) => {
      handleRef.current = contextSafe(callback)
    },
    [contextSafe]
  )

  // 内容 stagger 入场，active变化触发
  useGSAP(
    () => {
      const { children } = contentRef.current ?? {}
      if (children) {
        gsap.fromTo(
          children,
          { opacity: 0, y: 20 },
          {
            duration: 0.35,
            ease: "power2.out",
            opacity: 1,
            stagger: 0.08,
            y: 0,
          }
        )
      }
    },
    {
      scope: contentRef,
      dependencies: [current],
    }
  )

  return (
    <ContainerContext.Provider
      value={{ current, contextSafe, setCurrent, setHandle }}
    >
      <div className="w-full">
        <div
          ref={tabsWrapperRef}
          className={wrapper({ className, layout })}
          onClick={(event) => {
            const { target } = event
            const { tabName } =
              target instanceof HTMLElement ? target.dataset : {}
            if (tabName && tabName !== current) {
              handleClick(tabName)
            }
          }}
        >
          {items}
        </div>
        <div ref={contentRef} className="space-y-3">
          {children}
        </div>
      </div>
    </ContainerContext.Provider>
  )
}

export { ContainerContext }

export default Container

export interface WrapperContextInstance {
  setCurrent: (val: string) => void
  setHandle: (callback: (tab: string, container: HTMLElement) => void) => void
  current?: string
  contextSafe?: ContextSafeFunc
}

interface ContainerProps extends VariantProps<typeof wrapper> {
  active?: string
  className?: string
  items?: ReactNode
}
