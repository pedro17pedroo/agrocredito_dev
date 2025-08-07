import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./use-auth";

export interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
  action: string;
}

export function usePermissions() {
  const { user } = useAuth();
  
  const { data: permissionsResponse, isLoading } = useQuery<{permissions: string[]}>({
    queryKey: ["/api/auth/permissions"],
    enabled: !!user,
  });

  // Convert permission names to Permission objects for backward compatibility
  const userPermissions: Permission[] = (permissionsResponse?.permissions || []).map(name => ({
    id: name,
    name,
    description: name,
    module: name.split('.')[0],
    action: name.split('.')[1],
  }));

  const hasPermission = (permissionName: string): boolean => {
    if (!user) return false;
    
    // Admin has all permissions
    if (user.userType === "admin") return true;
    
    // Check if user has specific permission
    return (permissionsResponse?.permissions || []).includes(permissionName);
  };

  const hasAnyPermission = (permissionNames: string[]): boolean => {
    return permissionNames.some(permission => hasPermission(permission));
  };

  const hasAllPermissions = (permissionNames: string[]): boolean => {
    return permissionNames.every(permission => hasPermission(permission));
  };

  return {
    permissions: userPermissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isLoading,
  };
}