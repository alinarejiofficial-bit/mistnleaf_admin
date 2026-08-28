import { RoleDetailManager } from "@/components/users/RoleDetailManager";
import { roles, type RoleId } from "@/lib/roles";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ roleId: string }> };

export async function generateMetadata({ params }: Props) {
  const { roleId } = await params;
  const role = roles.find((item) => item.id === roleId);
  return { title: role ? `${role.name} · Roles` : "Role" };
}

export default async function RoleDetailPage({ params }: Props) {
  const { roleId } = await params;
  const valid = roles.some((role) => role.id === roleId);
  if (!valid) notFound();
  return <RoleDetailManager roleId={roleId as RoleId} />;
}
