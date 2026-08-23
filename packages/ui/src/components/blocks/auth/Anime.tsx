"use client"
import type { FC } from "react"

import { cva } from "class-variance-authority"
import { cn } from "@/registry/levi/lib/utils"
import animeImg from "./statics/anime.png"

const baseStyle = cva([
  "absolute",
  "bottom-0",
  "left-0",
  "select-none",
  "h-65",
  "z-1",
])

const earthStyle = cva(["w-full", "h-60"])

const handleStyle = cva(["w-64", "h-80", "left-[-20px]", "z-2"])

const spriteStyle = cva(["h-full", "w-full", "bg-no-repeat", "bg-contain"])

const start1Style = cva(["w-92", "h-80", "left-[-80px]", "bottom-120", "z-3"])

const start2Style = cva(["w-92", "h-60", "left-[160px]", "bottom-73", "z-3"])

const start3Style = cva(["w-62", "h-60", "left-[260px]", "bottom-143", "z-3"])

const dot1Style = cva(["w-90", "h-30", "left-[10px]", "bottom-23", "z-1"])

const dot2Style = cva(["w-50", "h-20", "left-[70px]", "bottom-83", "z-4"])

const SpriteSheet: FC<SpriteSheetProps> = ({ className }) => {
  return (
    <div
      className={spriteStyle({ className })}
      style={{ backgroundImage: `url(${animeImg.src})` }}
    />
  )
}

const Earth: FC = () => {
  return (
    <div className={cn([baseStyle(), earthStyle()])}>
      <SpriteSheet className="bg-size-[auto_300%] bg-position-[70%_60%]" />
    </div>
  )
}

const Hand: FC = () => {
  return (
    <div className={cn([baseStyle(), handleStyle()])}>
      <SpriteSheet className="rotate-[-20deg] bg-size-[auto_246%] bg-position-[6%_65%]" />
    </div>
  )
}

const Start1: FC = () => {
  return (
    <div className={cn([baseStyle(), start1Style()])}>
      <SpriteSheet className="bg-size-[auto_200%] bg-position-[0%_-20%]" />
    </div>
  )
}

const Start2: FC = () => {
  return (
    <div className={cn([baseStyle(), start2Style()])}>
      <SpriteSheet className="bg-size-[auto_180%] bg-position-[88%_-20%]" />
    </div>
  )
}

const Start3: FC = () => {
  return (
    <div className={cn([baseStyle(), start3Style()])}>
      <SpriteSheet className="bg-size-[auto_200%] bg-position-[108%_-20%]" />
    </div>
  )
}

const Small1Dot: FC = () => {
  return (
    <div className={cn([baseStyle(), dot1Style()])}>
      <SpriteSheet className="bg-size-[auto_400%] bg-position-[110%_108%]" />
    </div>
  )
}

const Small2Dot: FC = () => {
  return (
    <div className={cn([baseStyle(), dot2Style()])}>
      <SpriteSheet className="bg-size-[auto_300%] bg-position-[0%_120%]" />
    </div>
  )
}

const Anime: FC = () => {
  return (
    <>
      <Earth />
      <Hand />
      <Start1 />
      <Start2 />
      <Start3 />
      <Small1Dot />
      <Small2Dot />
    </>
  )
}

export default Anime

interface SpriteSheetProps {
  className?: string
}
