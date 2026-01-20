export const INDIAN_LOCATIONS: Record<string, string[]> = {
    "Tamil Nadu": [
        "Chennai North", "Chennai South", "Chennai Central",
        "Coimbatore", "Madurai", "Salem", "Tiruchirapalli", "Tirunelveli",
        "Vellore", "Erode", "Tiruppur", "Dindigul", "Thanjavur",
        "Cuddalore", "Nagapattinam", "Mayiladuthurai", "Ariyalur",
        "Kancheepuram", "Thiruvallur", "Krishnagiri"
    ],
    "Delhi": [
        "Central Delhi", "East Delhi", "North East Delhi",
        "North West Delhi", "New Delhi", "South Delhi", "West Delhi"
    ],
    "Maharashtra": [
        "Mumbai North", "Mumbai North West", "Mumbai North East",
        "Mumbai North Central", "Mumbai South Central", "Mumbai South",
        "Pune", "Nagpur", "Thane", "Nashik", "Aurangabad"
    ],
    "Karnataka": [
        "Bangalore North", "Bangalore Central", "Bangalore South",
        "Mysore", "Mangalore", "Hubli-Dharwad", "Belgaum"
    ],
    "Kerala": [
        "Thiruvananthapuram", "Kochi", "Kozhikode", "Kollam", "Thrissur"
    ],
    "Telangana": [
        "Hyderabad", "Secunderabad", "Malkajgiri", "Chevella", "Medak"
    ],
    "Gujarat": [
        "Ahmedabad East", "Ahmedabad West", "Gandhinagar", "Surat", "Vadodara"
    ],
    "West Bengal": [
        "Kolkata North", "Kolkata South", "Jadavpur", "Howrah", "Darjeeling"
    ],
    "Uttar Pradesh": [
        "Varanasi", "Lucknow", "Kanpur", "Agra", "Ghaziabad", "Noida"
    ]
};

export const getAllConstituencies = () => {
    return Object.values(INDIAN_LOCATIONS).flat().sort();
};

export const getStates = () => {
    return Object.keys(INDIAN_LOCATIONS).sort();
};
