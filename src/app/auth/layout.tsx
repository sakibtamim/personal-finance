import { AuthRouteGuard } from "@/components/auth/auth-route-guard";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AuthRouteGuard>{children}</AuthRouteGuard>;
}
