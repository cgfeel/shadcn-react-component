import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

export function App() {
  return (
    <div className="flex min-h-svh flex-col gap-4">
      <div className="flex p-6">
        <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose">
          <div>
            <h1 className="font-medium">Project ready!</h1>
            <p>You may now add components and start building.</p>
            <p>We&apos;ve already added the button component for you.</p>
            <Button className="mt-2">Button</Button>
          </div>
          <div className="font-mono text-xs text-muted-foreground">
            (Press <kbd>d</kbd> to toggle dark mode)
          </div>
        </div>
      </div>
      <div className="p-6">
        <Card className="max-w-sm">
          <CardHeader>
            <CardTitle>Project Overview</CardTitle>
            <CardDescription>
              Track progress and recent activity for your Vite app.
            </CardDescription>
          </CardHeader>
          <CardContent>
            Your design system is ready. Start building your next component.
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
