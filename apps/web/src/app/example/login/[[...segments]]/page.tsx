import { notFound } from "next/navigation"
import Auth, {
  AuthAnime,
  AuthBanner,
  AuthContainer,
  AuthGroup,
  AuthWrapper,
} from "@/registry/levi/components/blocks/auth"
import { isItem, layouts, variants } from "./_utils"

export const dynamicParams = false

export function generateStaticParams() {
  return layouts.flatMap((layout) =>
    variants.map((variant) => ({ layout, variant }))
  )
}

export default async function Page({
  params,
}: {
  params: Promise<{
    segments?: string[]
  }>
}) {
  const { segments = [] } = await params
  const [layout, variant] = segments

  if (!isItem(layout, layouts) || !isItem(variant, variants)) {
    notFound()
  }

  return (
    <AuthContainer layout={layout}>
      <AuthWrapper>
        {variant === "spread" && (
          <AuthGroup>
            <AuthBanner>
              <AuthAnime />
            </AuthBanner>
          </AuthGroup>
        )}
        <AuthGroup>
          <Auth />
        </AuthGroup>
      </AuthWrapper>
    </AuthContainer>
  )
}
