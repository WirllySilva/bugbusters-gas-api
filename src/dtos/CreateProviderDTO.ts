export interface CreateProviderDTO {
    // === supplier_info ===
    payment_methods: string[];
    open_time: string;
    close_time: string;
    open_days: string[];
    deliveryTimes: number;

    // === adress ===
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    zip_code: string;
    latitude: number;
    longitude: number;
    label: string;
}