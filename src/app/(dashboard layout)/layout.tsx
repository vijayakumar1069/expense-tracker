export default function AdminDashboard_Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="bg-primary-foreground min-h-full">{children}</div>;
}
