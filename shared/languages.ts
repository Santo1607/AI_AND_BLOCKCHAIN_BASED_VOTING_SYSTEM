// Multi-language support for Indian regional languages
export interface Language {
  code: string;
  name: string;
  nativeName: string;
}

export const supportedLanguages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া' },
  { code: 'mai', name: 'Maithili', nativeName: 'मैथिली' },
  { code: 'sa', name: 'Sanskrit', nativeName: 'संस्कृतम्' },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली' },
  { code: 'si', name: 'Sinhala', nativeName: 'සිංහල' },
  { code: 'ks', name: 'Kashmiri', nativeName: 'کٲشُر' },
  { code: 'sd', name: 'Sindhi', nativeName: 'سنڌي' },
  { code: 'mni', name: 'Manipuri', nativeName: 'মৈতৈলোন্' }
];

export const translations = {
  en: {
    // Common
    'welcome': 'Welcome',
    'login': 'Login',
    'logout': 'Logout',
    'submit': 'Submit',
    'cancel': 'Cancel',
    'save': 'Save',
    'edit': 'Edit',
    'delete': 'Delete',
    'view': 'View',
    'search': 'Search',
    'filter': 'Filter',
    'loading': 'Loading...',
    'error': 'Error',
    'success': 'Success',
    'name': 'Name',
    'email': 'Email',
    'phone': 'Phone Number',
    'address': 'Address',
    'dateOfBirth': 'Date of Birth',
    'gender': 'Gender',
    'male': 'Male',
    'female': 'Female',
    'other': 'Other',
    
    // Navigation
    'adminPortal': 'Admin Portal',
    'publicPortal': 'Public Portal',
    'votingPortal': 'Voting Portal',
    'dashboard': 'Dashboard',
    'citizens': 'Citizens',
    'elections': 'Elections',
    'candidates': 'Candidates',
    'reports': 'Reports',
    
    // Admin Portal
    'adminLogin': 'Admin Login',
    'username': 'Username',
    'password': 'Password',
    'addCitizen': 'Add Citizen',
    'citizenManagement': 'Citizen Management',
    'aadharNumber': 'Aadhar Number',
    'district': 'District',
    'constituency': 'Constituency',
    'status': 'Status',
    'active': 'Active',
    'inactive': 'Inactive',
    'actions': 'Actions',
    
    // Public Portal
    'aadharVerification': 'Aadhar Verification',
    'verifyAadhar': 'Verify Aadhar',
    'enterAadhar': 'Enter Aadhar Number',
    'enterDOB': 'Enter Date of Birth',
    'verify': 'Verify',
    'verificationSuccessful': 'Verification Successful',
    'verificationFailed': 'Verification Failed',
    'ageRequirement': 'You must be 18 years or older to register',
    
    // Voting Portal
    'voteNow': 'Vote Now',
    'registerToVote': 'Register to Vote',
    'viewResults': 'View Results',
    'voterRegistration': 'Voter Registration',
    'biometricVerification': 'Biometric Verification',
    'faceVerification': 'Face Verification',
    'fingerprintVerification': 'Fingerprint Verification',
    'selectCandidate': 'Select Candidate',
    'castVote': 'Cast Vote',
    'voteSubmitted': 'Vote Submitted Successfully',
    'alreadyVoted': 'You have already voted in this election',
    'votingClosed': 'Voting is currently closed',
    
    // Age Verification
    'ageVerificationRequired': 'Age Verification Required',
    'mustBe18': 'You must be 18 years or older to proceed',
    'ageVerified': 'Age verified successfully',
    'underAge': 'Sorry, you are under 18 years old and cannot proceed',
    
    // Elections
    'electionName': 'Election Name',
    'electionDate': 'Election Date',
    'startTime': 'Start Time',
    'endTime': 'End Time',
    'description': 'Description',
    'upcoming': 'Upcoming',
    'ongoing': 'Ongoing',
    'completed': 'Completed',
    
    // Results
    'electionResults': 'Election Results',
    'totalVotes': 'Total Votes',
    'winner': 'Winner',
    'votePercentage': 'Vote Percentage',
    
    // Language Selection
    'selectLanguage': 'Select Language',
    'languageChanged': 'Language changed successfully'
  },
  
  hi: {
    // Common
    'welcome': 'स्वागत',
    'login': 'लॉगिन',
    'logout': 'लॉगआउट',
    'submit': 'जमा करें',
    'cancel': 'रद्द करें',
    'save': 'सहेजें',
    'edit': 'संपादित करें',
    'delete': 'हटाएं',
    'view': 'देखें',
    'search': 'खोजें',
    'filter': 'फ़िल्टर',
    'loading': 'लोड हो रहा है...',
    'error': 'त्रुटि',
    'success': 'सफलता',
    'name': 'नाम',
    'email': 'ईमेल',
    'phone': 'फोन नंबर',
    'address': 'पता',
    'dateOfBirth': 'जन्म तिथि',
    'gender': 'लिंग',
    'male': 'पुरुष',
    'female': 'महिला',
    'other': 'अन्य',
    
    // Navigation
    'adminPortal': 'प्रशासक पोर्टल',
    'publicPortal': 'सार्वजनिक पोर्टल',
    'votingPortal': 'मतदान पोर्टल',
    'dashboard': 'डैशबोर्ड',
    'citizens': 'नागरिक',
    'elections': 'चुनाव',
    'candidates': 'उम्मीदवार',
    'reports': 'रिपोर्ट',
    
    // Admin Portal
    'adminLogin': 'प्रशासक लॉगिन',
    'username': 'उपयोगकर्ता नाम',
    'password': 'पासवर्ड',
    'addCitizen': 'नागरिक जोड़ें',
    'citizenManagement': 'नागरिक प्रबंधन',
    'aadharNumber': 'आधार संख्या',
    'district': 'जिला',
    'constituency': 'निर्वाचन क्षेत्र',
    'status': 'स्थिति',
    'active': 'सक्रिय',
    'inactive': 'निष्क्रिय',
    'actions': 'कार्य',
    
    // Public Portal
    'aadharVerification': 'आधार सत्यापन',
    'verifyAadhar': 'आधार सत्यापित करें',
    'enterAadhar': 'आधार संख्या दर्ज करें',
    'enterDOB': 'जन्म तिथि दर्ज करें',
    'verify': 'सत्यापित करें',
    'verificationSuccessful': 'सत्यापन सफल',
    'verificationFailed': 'सत्यापन असफल',
    'ageRequirement': 'पंजीकरण के लिए आपकी आयु 18 वर्ष या अधिक होनी चाहिए',
    
    // Voting Portal
    'voteNow': 'अभी वोट करें',
    'registerToVote': 'वोट के लिए पंजीकरण करें',
    'viewResults': 'परिणाम देखें',
    'voterRegistration': 'मतदाता पंजीकरण',
    'biometricVerification': 'बायोमेट्रिक सत्यापन',
    'faceVerification': 'चेहरा सत्यापन',
    'fingerprintVerification': 'फिंगरप्रिंट सत्यापन',
    'selectCandidate': 'उम्मीदवार चुनें',
    'castVote': 'वोट डालें',
    'voteSubmitted': 'वोट सफलतापूर्वक जमा किया गया',
    'alreadyVoted': 'आपने इस चुनाव में पहले से ही वोट दिया है',
    'votingClosed': 'वोटिंग वर्तमान में बंद है',
    
    // Age Verification
    'ageVerificationRequired': 'आयु सत्यापन आवश्यक',
    'mustBe18': 'आगे बढ़ने के लिए आपकी आयु 18 वर्ष या अधिक होनी चाहिए',
    'ageVerified': 'आयु सफलतापूर्वक सत्यापित',
    'underAge': 'खुशी, आप 18 वर्ष से कम आयु के हैं और आगे नहीं बढ़ सकते',
    
    // Elections
    'electionName': 'चुनाव का नाम',
    'electionDate': 'चुनाव तिथि',
    'startTime': 'प्रारंभ समय',
    'endTime': 'समाप्ति समय',
    'description': 'विवरण',
    'upcoming': 'आगामी',
    'ongoing': 'चालू',
    'completed': 'पूर्ण',
    
    // Results
    'electionResults': 'चुनाव परिणाम',
    'totalVotes': 'कुल वोट',
    'winner': 'विजेता',
    'votePercentage': 'वोट प्रतिशत',
    
    // Language Selection
    'selectLanguage': 'भाषा चुनें',
    'languageChanged': 'भाषा सफलतापूर्वक बदली गई'
  }
  
  // Additional languages can be added here following the same pattern
};

export type TranslationKey = keyof typeof translations.en;

export function getTranslation(key: TranslationKey, language: string = 'en'): string {
  const lang = translations[language as keyof typeof translations] || translations.en;
  return lang[key] || translations.en[key] || key;
}

export function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

export function isEligibleAge(dateOfBirth: string): boolean {
  return calculateAge(dateOfBirth) >= 18;
}