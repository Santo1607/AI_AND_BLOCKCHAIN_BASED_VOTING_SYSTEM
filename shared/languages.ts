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
    'publicPortal': 'Voter Registration',
    'votingPortal': 'Voting Portal',
    'dashboard': 'Dashboard',
    'citizens': 'Citizens',
    'elections': 'Elections',
    'candidates': 'Candidates',
    'reports': 'Reports',

    // Voting Portal
    'digitalVotingSystem': 'Digital Voting System',
    'votingPlatformDescription': 'Secure, transparent, and accessible voting platform powered by Aadhar verification. Exercise your democratic right with confidence and convenience.',
    'electionSchedule': 'Election Schedule',
    'currentTime': 'Current Time',
    'votingActive': 'Voting Active',
    'votingClosedStatus': 'Voting Closed',
    'voterRegistrationTitle': 'Voter Registration',
    'voterRegistrationDesc': 'Register as a voter with Aadhar verification',
    'castVoteTitle': 'Cast Your Vote',
    'castVoteDesc': 'Secure blockchain-enabled voting process',
    'viewResultsTitle': 'View Results',
    'viewResultsDesc': 'Real-time election results and analytics',
    'secureVotingProcess': 'Secure Voting Process',
    'votingSystemDescription': 'Our voting system uses advanced encryption and Aadhar-based verification to ensure your vote is secure, anonymous, and counted accurately. Each vote is cryptographically protected and linked to verified citizen identity.',
    'aadharIntegration': 'Aadhar Integration',
    'aadharIntegrationDesc': 'Seamlessly integrated with the Aadhar management system for instant voter verification. Your existing Aadhar registration serves as the foundation for secure democratic participation.',
    'digitalVotingPortal': 'Digital Voting Portal',
    'governmentOfIndia': 'Government of India - Election Commission',
    'currentElectionTitle': 'General Election 2024 - NOW ACTIVE',
    'currentElectionDescription': 'National Parliamentary Election is currently open for voting. Make your voice heard in shaping the future of our nation.',
    'viewLiveResults': 'View Live Results',

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

    // Voting Process
    'voteNow': 'Vote Now',
    'registerToVote': 'Register to Vote',
    'biometricVerification': 'Biometric Verification',
    'faceVerification': 'Face Verification',
    'fingerprintVerification': 'Fingerprint Verification',
    'selectCandidate': 'Select Candidate',
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

    // Voting completion translations
    'voteCastSuccessfully': 'Vote Cast Successfully!',
    'thankYouParticipating': 'Thank you for participating in the democratic process',
    'voteCertificate': 'Digital Vote Certificate',
    'voteId': 'Vote ID',
    'voteStatus': 'Vote Status',
    'successfullyRecorded': 'Successfully Recorded',
    'timestamp': 'Timestamp',
    'important': 'Important',
    'voteRecordedMessage': 'Your vote has been permanently recorded. This certificate serves as proof of your participation in the democratic process.',
    'votingComplete': 'Voting Complete',
    'votingCompleteMessage': 'Your vote has been cast and cannot be changed. The voting process is complete and secure. Results will be available to election officials at 6:00 PM.',
    'returnToPortal': 'Return to Portal',

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
    'publicPortal': 'मतदाता पंजीकरण',
    'votingPortal': 'मतदान पोर्टल',
    'dashboard': 'डैशबोर्ड',
    'citizens': 'नागरिक',
    'elections': 'चुनाव',
    'candidates': 'उम्मीदवार',
    'reports': 'रिपोर्ट',

    // Voting Portal
    'digitalVotingSystem': 'डिजिटल मतदान प्रणाली',
    'votingPlatformDescription': 'आधार सत्यापन द्वारा संचालित सुरक्षित, पारदर्शी और सुलभ मतदान मंच। आत्मविश्वास और सुविधा के साथ अपने लोकतांत्रिक अधिकार का प्रयोग करें।',
    'electionSchedule': 'चुनाव कार्यक्रम',
    'currentTime': 'वर्तमान समय',
    'votingActive': 'मतदान सक्रिय',
    'votingClosedStatus': 'मतदान बंद',
    'voterRegistrationTitle': 'मतदाता पंजीकरण',
    'voterRegistrationDesc': 'आधार सत्यापन के साथ मतदाता के रूप में पंजीकरण करें',
    'castVoteTitle': 'अपना मत डालें',
    'castVoteDesc': 'सुरक्षित ब्लॉकचेन-सक्षम मतदान प्रक्रिया',
    'viewResultsTitle': 'परिणाम देखें',
    'viewResultsDesc': 'वास्तविक समय चुनाव परिणाम और विश्लेषण',
    'secureVotingProcess': 'सुरक्षित मतदान प्रक्रिया',
    'votingSystemDescription': 'हमारी मतदान प्रणाली उन्नत एन्क्रिप्शन और आधार-आधारित सत्यापन का उपयोग करती है ताकि आपका मत सुरक्षित, गुमनाम और सटीक रूप से गिना जा सके। प्रत्येक मत क्रिप्टोग्राफिक रूप से सुरक्षित है और सत्यापित नागरिक पहचान से जुड़ा है।',
    'aadharIntegration': 'आधार एकीकरण',
    'aadharIntegrationDesc': 'तत्काल मतदाता सत्यापन के लिए आधार प्रबंधन प्रणाली के साथ निर्बाध रूप से एकीकृत। आपका मौजूदा आधार पंजीकरण सुरक्षित लोकतांत्रिक भागीदारी की नींव के रूप में कार्य करता है।',
    'digitalVotingPortal': 'डिजिटल मतदान पोर्टल',
    'governmentOfIndia': 'भारत सरकार - चुनाव आयोग',
    'currentElectionTitle': 'आम चुनाव 2024 - अब सक्रिय',
    'currentElectionDescription': 'राष्ट्रीय संसदीय चुनाव वर्तमान में मतदान के लिए खुला है। हमारे राष्ट्र का भविष्य आकार देने में अपनी आवाज सुनाएं।',
    'viewLiveResults': 'लाइव परिणाम देखें',

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
  },

  // Bengali translations
  bn: {
    'welcome': 'স্বাগতম',
    'login': 'লগইন',
    'logout': 'লগআউট',
    'digitalVotingSystem': 'ডিজিটাল ভোটিং সিস্টেম',
    'votingPlatformDescription': 'আধার যাচাইকরণ দ্বারা চালিত নিরাপদ, স্বচ্ছ এবং অ্যাক্সেসযোগ্য ভোটিং প্ল্যাটফর্ম। আত্মবিশ্বাস এবং সুবিধার সাথে আপনার গণতান্ত্রিক অধিকার প্রয়োগ করুন।',
    'digitalVotingPortal': 'ডিজিটাল ভোটিং পোর্টাল',
    'governmentOfIndia': 'ভারত সরকার - নির্বাচন কমিশন',
    'electionSchedule': 'নির্বাচনের সময়সূচী',
    'currentTime': 'বর্তমান সময়',
    'votingActive': 'ভোটিং সক্রিয়',
    'votingClosedStatus': 'ভোটিং বন্ধ',
    'voterRegistrationTitle': 'ভোটার নিবন্ধন',
    'voterRegistrationDesc': 'আধার যাচাইকরণের সাথে ভোটার হিসেবে নিবন্ধন করুন',
    'castVoteTitle': 'আপনার ভোট দিন',
    'castVoteDesc': 'নিরাপদ ব্লকচেইন-সক্ষম ভোটিং প্রক্রিয়া',
    'viewResultsTitle': 'ফলাফল দেখুন',
    'viewResultsDesc': 'রিয়েল-টাইম নির্বাচনের ফলাফল এবং বিশ্লেষণ',
    'secureVotingProcess': 'নিরাপদ ভোটিং প্রক্রিয়া',
    'votingSystemDescription': 'আমাদের ভোটিং সিস্টেম উন্নত এনক্রিপশন এবং আধার-ভিত্তিক যাচাইকরণ ব্যবহার করে যাতে আপনার ভোট নিরাপদ, বেনামী এবং সঠিকভাবে গণনা করা হয়।',
    'aadharIntegration': 'আধার একীকরণ',
    'aadharIntegrationDesc': 'তাৎক্ষণিক ভোটার যাচাইকরণের জন্য আধার ব্যবস্থাপনা সিস্টেমের সাথে নির্বিঘ্নে একীভূত।',
    'currentElectionTitle': 'সাধারণ নির্বাচন ২০২৪ - এখন সক্রিয়',
    'currentElectionDescription': 'জাতীয় সংসদীয় নির্বাচন বর্তমানে ভোটের জন্য খোলা। আমাদের জাতির ভবিষ্যৎ গঠনে আপনার কণ্ঠস্বর শোনান।',
    'voteNow': 'এখনই ভোট দিন',
    'registerToVote': 'ভোট দেওয়ার জন্য নিবন্ধন করুন',
    'viewLiveResults': 'লাইভ ফলাফল দেখুন',
    'votingClosed': 'ভোটিং বর্তমানে বন্ধ',
    'publicPortal': 'ভোটার নিবন্ধন',
    'adminPortal': 'অ্যাডমিন পোর্টাল'
  },

  // Additional languages following same pattern for Telugu, Tamil, etc.
  te: {
    'welcome': 'స్వాగతం',
    'login': 'లాగిన్',
    'logout': 'లాగ్ అవుట్',
    'digitalVotingSystem': 'డిజిటల్ ఓటింగ్ సిస్టమ్',
    'votingPlatformDescription': 'ఆధార్ ధృవీకరణతో నడిచే సురక్షిత, పారదర్శక మరియు అందుబాటులో ఉన్న ఓటింగ్ ప్లాట్‌ఫారమ్। నమ్మకం మరియు సౌలభ్యంతో మీ ప్రజాస్వామ్య హక్కును ఉపయోగించండి।',
    'digitalVotingPortal': 'డిజిటల్ ఓటింగ్ పోర్టల్',
    'governmentOfIndia': 'భారత ప్రభుత్వం - ఎన్నికల కమిషన్',
    'electionSchedule': 'ఎన్నికల షెడ్యూల్',
    'currentTime': 'ప్రస్తుత సమయం',
    'votingActive': 'ఓటింగ్ క్రియాశీలం',
    'votingClosedStatus': 'ఓటింగ్ మూసివేయబడింది',
    'voterRegistrationTitle': 'ఓటరు నమోదు',
    'voterRegistrationDesc': 'ఆధార్ ధృవీకరణతో ఓటరుగా నమోదు చేసుకోండి',
    'castVoteTitle': 'మీ ఓటు వేయండి',
    'castVoteDesc': 'సురక్షిత బ్లాక్‌చెయిన్-ప్రారంభ ఓటింగ్ ప్రక్రియ',
    'viewResultsTitle': 'ఫలితాలను చూడండి',
    'viewResultsDesc': 'రియల్-టైమ్ ఎన్నికల ఫలితాలు మరియు విశ్లేషణ',
    'secureVotingProcess': 'సురక్షిత ఓటింగ్ ప్రక్రియ',
    'votingSystemDescription': 'మా ఓటింగ్ సిస్టమ్ అధునాతన ఎన్క్రిప్షన్ మరియు ఆధార్ ఆధారిత ధృవీకరణను ఉపయోగిస్తుంది.',
    'aadharIntegration': 'ఆధార్ ఏకీకరణ',
    'aadharIntegrationDesc': 'తక్షణ ఓటరు ధృవీకరణ కోసం ఆధార్ నిర్వహణ వ్యవస్థతో సజావుగా ఏకీకృతం.',
    'currentElectionTitle': 'సాధారణ ఎన్నికలు 2024 - ఇప్పుడు క్రియాశీలం',
    'currentElectionDescription': 'జాతీయ పార్లమెంట్ ఎన్నికలు ప్రస్తుతం ఓటింగ్ కోసం తెరిచి ఉన్నాయి। మా దేశ భవిష్యత్తును రూపొందించడంలో మీ స్వరాన్ని వినిపించండి।',
    'voteNow': 'ఇప్పుడే ఓటు వేయండి',
    'registerToVote': 'ఓటు వేయడానికి నమోదు చేసుకోండి',
    'viewLiveResults': 'లైవ్ ఫలితాలను చూడండి',
    'votingClosed': 'ఓటింగ్ ప్రస్తుతం మూసివేయబడింది',
    'publicPortal': 'ఓటరు నమోదు',
    'adminPortal': 'అడ్మిన్ పోర్టల్'
  },

  // Tamil translations
  ta: {
    'welcome': 'வரவேற்கிறோம்',
    'login': 'உள்நுழைய',
    'logout': 'வெளியேற',
    'digitalVotingSystem': 'டிஜிட்டல் வாக்களிப்பு அமைப்பு',
    'votingPlatformDescription': 'ஆதார் சரிபார்ப்பால் இயக்கப்படும் பாதுகாப்பான, வெளிப்படையான மற்றும் அணுகக்கூடிய வாக்களிப்பு தளம். நம்பிக்கை மற்றும் வசதியுடன் உங்கள் ஜனநாயக உரிமையைப் பயன்படுத்துங்கள்.',
    'digitalVotingPortal': 'டிஜிட்டல் வாக்களிப்பு இணையதளம்',
    'governmentOfIndia': 'இந்திய அரசு - தேர்தல் ஆணையம்',
    'electionSchedule': 'தேர்தல் கால அட்டவணை',
    'currentTime': 'தற்போதைய நேரம்',
    'votingActive': 'வாக்களிப்பு செயலில்',
    'votingClosedStatus': 'வாக்களிப்பு மூடப்பட்டது',
    'voterRegistrationTitle': 'வாக்காளர் பதிவு',
    'voterRegistrationDesc': 'ஆதார் சரிபார்ப்புடன் வாக்காளராக பதிவு செய்யுங்கள்',
    'castVoteTitle': 'உங்கள் வாக்கைப் போடுங்கள்',
    'castVoteDesc': 'பாதுகாப்பான பிளாக்செயின்-இயக்கப்படும் வாக்களிப்பு செயல்முறை',
    'viewResultsTitle': 'முடிவுகளைப் பார்க்கவும்',
    'viewResultsDesc': 'நிகழ்நேர தேர்தல் முடிவுகள் மற்றும் பகுப்பாய்வு',
    'secureVotingProcess': 'பாதுகாப்பான வாக்களிப்பு செயல்முறை',
    'votingSystemDescription': 'எங்கள் வாக்களிப்பு அமைப்பு மேம்பட்ட குறியாக்கம் மற்றும் ஆதார் அடிப்படையிலான சரிபார்ப்பைப் பயன்படுத்துகிறது.',
    'aadharIntegration': 'ஆதார் ஒருங்கிணைப்பு',
    'aadharIntegrationDesc': 'உடனடி வாக்காளர் சரிபார்ப்புக்கான ஆதார் மேலாண்மை அமைப்புடன் தடையின்றி ஒருங்கிணைக்கப்பட்டது.',
    'currentElectionTitle': 'பொதுத் தேர்தல் 2024 - இப்போது செயலில்',
    'currentElectionDescription': 'தேசிய நாடாளுமன்றத் தேர்தல்கள் தற்போது வாக்களிப்புக்காக திறந்துள்ளன. நமது நாட்டின் எதிர்காலத்தை வடிவமைப்பதில் உங்கள் குரலைக் கேட்கச் செய்யுங்கள்.',
    'voteNow': 'இப்போது வாக்களியுங்கள்',
    'registerToVote': 'வாக்களிக்க பதிவு செய்யுங்கள்',
    'viewLiveResults': 'நேரடி முடிவுகளைப் பார்க்கவும்',
    'votingClosed': 'வாக்களிப்பு தற்போது மூடப்பட்டுள்ளது',
    'publicPortal': 'வாக்காளர் பதிவு',
    'adminPortal': 'நிர்வாக இணையதளம்',

    // Voting completion translations in Tamil
    'voteCastSuccessfully': 'வாக்கு வெற்றிகரமாக பதிவு செய்யப்பட்டது!',
    'thankYouParticipating': 'ஜனநாயக செயல்முறையில் பங்கேற்றதற்கு நன்றி',
    'voteCertificate': 'டிஜிட்டல் வாக்கு சான்றிதழ்',
    'voteId': 'வாக்கு அடையாள எண்',
    'voteStatus': 'வாக்கு நிலை',
    'successfullyRecorded': 'வெற்றிகரமாக பதிவு செய்யப்பட்டது',
    'timestamp': 'நேர முத்திரை',
    'important': 'முக்கியம்',
    'voteRecordedMessage': 'உங்கள் வாக்கு நிரந்தரமாக பதிவு செய்யப்பட்டுள்ளது. இந்த சான்றிதழ் ஜனநாயக செயல்முறையில் உங்கள் பங்கேற்பின் ஆதாரமாக செயல்படுகிறது.',
    'votingComplete': 'வாக்களிப்பு முடிந்தது',
    'votingCompleteMessage': 'உங்கள் வாக்கு பதிவு செய்யப்பட்டு மாற்ற முடியாது. வாக்களிப்பு செயல்முறை முடிந்து பாதுகாப்பானது. முடிவுகள் மாலை 6:00 மணிக்கு தேர்தல் அதிகாரிகளுக்கு கிடைக்கும்.',
    'returnToPortal': 'இணையதளத்திற்கு திரும்பு'
  }
};

export type TranslationKey = keyof typeof translations.en;

export function getTranslation(key: TranslationKey, language: string = 'en'): string {
  const lang = (translations as any)[language] || translations.en;
  return lang[key] || (translations.en as any)[key] || key;
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