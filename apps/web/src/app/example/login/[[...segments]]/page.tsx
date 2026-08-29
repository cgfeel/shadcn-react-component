import { Repeat } from "lucide-react"
import { notFound } from "next/navigation"
import {
  AuthAnime,
  AuthBanner,
  AuthContainer,
  AuthGroup,
  AuthItem,
  AuthWrapper,
} from "@/registry/levi/components/blocks/auth"
import { Button } from "@/registry/levi/components/button"
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/registry/levi/components/card"
import { Input } from "@/registry/levi/components/input"
import { Label } from "@/registry/levi/components/label"
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
          <AuthGroup layout="start">
            <AuthBanner>
              <AuthAnime />
            </AuthBanner>
          </AuthGroup>
        )}
        <AuthGroup>
          <AuthItem>
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
                <CardAction>
                  <Button variant="link">
                    <Repeat data-icon="inline-start" />
                    Sign Up
                  </Button>
                </CardAction>
              </CardHeader>
              <CardContent>
                <form>
                  <div className="flex flex-col gap-6">
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        autoComplete="email"
                        id="email"
                        placeholder="xxx@example.com"
                        type="email"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <div className="flex items-center">
                        <Label htmlFor="password">Password</Label>
                        <a
                          href="#"
                          className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                        >
                          Forgot your password?
                        </a>
                      </div>
                      <Input
                        autoComplete="current-password"
                        id="password"
                        type="password"
                        required
                      />
                    </div>
                  </div>
                </form>
              </CardContent>
              <CardFooter className="flex-col gap-4">
                <Button
                  type="submit"
                  className="h-12 w-full rounded-full bg-teal-300"
                >
                  Login
                </Button>
                <div>
                  <Button>1</Button>
                </div>
              </CardFooter>
            </Card>
          </AuthItem>
        </AuthGroup>
      </AuthWrapper>
    </AuthContainer>
  )
}
