export interface CompleteProfileDTO {
  name: string;
  email?: string;
  address?: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    zip_code: string;
    latitude?: number;
    longitude?: number;
    label?: string;
    is_default?: boolean;
  };
}
