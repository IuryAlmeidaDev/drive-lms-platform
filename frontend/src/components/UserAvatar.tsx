import React, { useState } from "react";
import { User } from "@/types/course";
import { User as UserIcon } from "lucide-react";

interface UserAvatarProps {
  user: User | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  size = "md",
  className = "",
}) => {
  const [hasImageError, setHasImageError] = useState(false);

  const sizeClasses = {
    sm: "h-7 w-7 text-[11px]",
    md: "h-8 w-8 text-xs",
    lg: "h-11 w-11 text-sm font-semibold",
  };

  if (!user) {
    return (
      <div
        className={`${sizeClasses[size]} rounded-full bg-muted flex items-center justify-center text-muted-foreground border border-border/80 ${className}`}
      >
        <UserIcon className="h-4 w-4" />
      </div>
    );
  }

  // Se tiver imagem e não tiver dado erro de carregamento
  if (user.picture && !hasImageError) {
    return (
      <img
        src={user.picture}
        alt={user.name}
        onError={() => setHasImageError(true)}
        className={`${sizeClasses[size]} rounded-full border border-border/80 object-cover shadow-xs ${className}`}
      />
    );
  }

  // Fallback: Iniciais do nome com gradiente elegante
  const initials = user.name
    ? user.name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0].toUpperCase())
        .join("")
    : user.email?.charAt(0).toUpperCase() || "U";

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-tr from-primary/80 to-primary text-primary-foreground font-bold flex items-center justify-center border border-primary/30 shadow-xs select-none ${className}`}
      title={`${user.name} (${user.email})`}
    >
      {initials}
    </div>
  );
};
