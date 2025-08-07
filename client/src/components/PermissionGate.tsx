import { ReactNode } from "react";
import { usePermissions } from "@/hooks/use-permissions";

interface PermissionGateProps {
  permission?: string;
  anyPermissions?: string[];
  allPermissions?: string[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function PermissionGate({ 
  permission, 
  anyPermissions, 
  allPermissions, 
  children, 
  fallback = null 
}: PermissionGateProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, isLoading } = usePermissions();
  
  if (isLoading) {
    return <>{fallback}</>;
  }
  
  let hasAccess = false;
  
  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (anyPermissions) {
    hasAccess = hasAnyPermission(anyPermissions);
  } else if (allPermissions) {
    hasAccess = hasAllPermissions(allPermissions);
  }
  
  return hasAccess ? <>{children}</> : <>{fallback}</>;
}