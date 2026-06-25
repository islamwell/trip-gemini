/**
 * Maps raw database duty values to their respective localization translation keys.
 * Returns the translation key, or an empty string if not found.
 */
export const getDutyTranslationKey = (dbValue: string): string => {
  const map: Record<string, string> = {
    'None - but I will make Dua': 'registration.roles.none',
    'Wake-Up Caller for Fajr (Wakes up everyone)': 'registration.roles.fajr_caller',
    'Quran tajweed teacher': 'registration.roles.quran_teacher',
    'Halal Grocery Scout & Verifier (Checks ingredients)': 'registration.roles.grocery_scout',
    'Hydration & Water helper (Distributes water)': 'registration.roles.hydration_helper',
    'Iftar/Suhoor Time Announcer': 'registration.roles.iftar_announcer',
    'Fruit & Snack Distributor': 'registration.roles.snack_distributor',
    'Bus Cleanliness Officer (Keeps bus tidy)': 'registration.roles.cleanliness_officer',
    'Trash & Recycling helper': 'registration.roles.trash_helper',
    'Sound System & Nasheed Manager (Manages audio)': 'registration.roles.audio_manager',
    'Weather & Road Commentator (Checks route updates)': 'registration.roles.weather_commentator',
    'Elderly Support team (Assists elderly)': 'registration.roles.elderly_support',
    'Halal Entertainment (Engages kids/group)': 'registration.roles.entertainment_helper',
    'Salah Garment & Cover Organiser': 'registration.roles.garment_organiser',
    'Lost & Found Custodian (Keeps track of items)': 'registration.roles.lost_found',
    'Complaint In-Charge': 'registration.roles.complaint_incharge',
    'Shared Expenses & Token Collector': 'registration.roles.token_collector',
    'Driver (Drives the minibus)': 'registration.roles.driver',
    'Map navigator GPS copilot (Guides driver)': 'registration.roles.navigator',
    'Photographer (Captures memories)': 'registration.roles.photographer',
    'Journalist (Writes trip summary)': 'registration.roles.journalist'
  };
  return map[dbValue] || '';
};
