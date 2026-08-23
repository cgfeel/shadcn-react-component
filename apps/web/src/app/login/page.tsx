import Login, {
  LogoContainer,
  LogoWrapper,
} from "@/registry/levi/components/blocks/login"

export default function Page() {
  return (
    <LogoContainer>
      <LogoWrapper layout="full">
        <Login />
      </LogoWrapper>
    </LogoContainer>
  )
}
