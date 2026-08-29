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

const mask = cva([
  "hidden",
  "w-full",
  "h-40",
  "z-10",
  "bg-gradient-to-t",
  "from-black",
  "to-transparent",
  "group-data-[layout=full]/auth-container:[@media(min-height:1729px)]:block",
])

const earthContainer = cva(["w-full", "h-auto"])

const earthInner = cva(["max-w-260", "h-60"])

const handleStyle = cva(["w-64", "h-100", "left-[-20px]", "z-2"])

const spriteStyle = cva(["h-full", "w-full", "bg-no-repeat", "bg-contain"])

const planetRed = cva(["w-87", "h-56", "left-[-80px]", "bottom-[64%]", "z-3"])

const planetBlue = cva(["left-[30%]", "bottom-[38%]", "z-3", "h-50", "w-60"])

const planetDark = cva(["w-42", "h-34", "left-[54%]", "bottom-[74%]", "z-3"])

const dot1Style = cva(["w-70", "h-20", "left-[40px]", "bottom-33", "z-1"])

const dot2Style = cva(["w-54", "h-10", "left-[16%]", "bottom-[46%]", "z-4"])

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
    <div className={cn([baseStyle(), earthContainer()])}>
      <div className={earthInner()}>
        <SpriteSheet className="bg-size-[auto_300%] bg-position-[-377px_-290px]" />
      </div>
    </div>
  )
}

const Hand: FC = () => {
  return (
    <div className={cn([baseStyle(), handleStyle()])}>
      <SpriteSheet className="bg-size-[490%_246%] bg-position-[-70px_65%]" />
    </div>
  )
}

const StarRed: FC = () => {
  return (
    <div className={cn([baseStyle(), planetRed()])}>
      <SpriteSheet className="bg-size-[auto_270%] bg-position-[0%_-10px]" />
    </div>
  )
}

const StarBlue: FC = () => {
  return (
    <div className={cn([baseStyle(), planetBlue()])}>
      <SpriteSheet className="bg-size-[auto_270%] bg-position-[-308px_-24px]" />
    </div>
  )
}

const StarDark: FC = () => {
  return (
    <div className={cn([baseStyle(), planetDark()])}>
      <SpriteSheet className="bg-size-[auto_320%] bg-position-[-470px_-36px]" />
    </div>
  )
}

const Small1Dot: FC = () => {
  return (
    <div className={cn([baseStyle(), dot1Style()])}>
      <SpriteSheet className="bg-size-[auto_590%] bg-position-[-420px_-380px]" />
    </div>
  )
}

const Small2Dot: FC = () => {
  return (
    <div className={cn([baseStyle(), dot2Style()])}>
      <SpriteSheet className="bg-size-[auto_600%] bg-position-[0_-192px]" />
    </div>
  )
}

const Anime: FC = () => {
  return (
    <>
      <Earth />
      <Hand />
      <StarRed />
      <StarBlue />
      <StarDark />
      <Small1Dot />
      <Small2Dot />
      <div className={cn([baseStyle(), mask()])} />
    </>
  )
}

export default Anime

interface SpriteSheetProps {
  className?: string
}
