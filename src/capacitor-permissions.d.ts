declare module '@capacitor/permissions' {
    export interface PermissionStatus {
        state: 'granted' | 'denied' | 'prompt';
    }

    export interface Permission {
        name: string;
        status: PermissionStatus;
    }

    export const Permissions: {
        query(options: { name: string }): Promise<Permission>;
        request(options: { name: string }): Promise<Permission>;
    };
} 