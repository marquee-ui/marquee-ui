import { Avatar, AvatarImage, AvatarBadge } from "@/components/ui/avatar";
export default function AvatarExample() {
  const ink = getComputedStyle(document.documentElement).getPropertyValue("--primary").trim();
  const image = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="20" fill="${ink}" /></svg>`)}`;
  return (
    <div className="flex items-center gap-4">
      <Avatar className="size-16">
        <AvatarImage src={image} alt="" />
        <AvatarBadge>S</AvatarBadge>
      </Avatar>
      <span>Studio member</span>
    </div>
  );
}
