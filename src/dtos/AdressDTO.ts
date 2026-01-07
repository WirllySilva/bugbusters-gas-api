export interface  CreateAddressDTO {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    zip_cod: string;
    latitude: number;
    longitude: number;
    label: string;
    is_default: Boolean;
}