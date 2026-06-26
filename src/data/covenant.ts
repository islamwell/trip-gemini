export interface CovenantItem {
  id: string;
  en: string;
  no: string;
  ur: string;
}

export interface CovenantSection {
  id: number;
  title: {
    en: string;
    no: string;
    ur: string;
  };
  iconName: string;
  items: CovenantItem[];
  quote?: {
    en: string;
    no: string;
    ur: string;
  };
  quranAyat?: string;
}

export const covenantData: CovenantSection[] = [
  {
    id: 1,
    title: {
      en: "Our Intention (Niyyah)",
      no: "Vår Intensjon (Niyyah)",
      ur: "ہماری نیت (Niyyah)"
    },
    iconName: "Heart",
    quranAyat: "قُلْ إِنَّ صَلَاتِي وَنُسُكِي وَمَحْيَايَ وَمَمَاتِي لِلَّهِ رَبِّ الْعَالَمِينَ",
    items: [
      { id: "1_1", en: "We travel seeking Allah's pleasure.", no: "Vi reiser for å søke Allahs velbehag.", ur: "ہم اللہ کی رضا کے لیے سفر کر رہے ہیں۔" },
      { id: "1_2", en: "We remember that enjoying nature is worship when accompanied by gratitude.", no: "Vi husker at det å nyte naturen er tilbedelse når det ledsages av takknemlighet.", ur: "ہم یاد رکھیں گے کہ شکر گزاری کے ساتھ قدرت سے لطف اندوز ہونا بھی عبادت ہے۔" },
      { id: "1_3", en: "We will not allow vacation to weaken our prayers or character.", no: "Vi vil ikke la ferien svekke våre bønner eller karakter.", ur: "ہم چھٹیوں کو اپنی نماز یا اخلاق کو کمزور نہیں کرنے دیں گے۔" },
      { id: "1_4", en: "We will return closer to Allah and closer to one another.", no: "Vi vil vende tilbake nærmere Allah og nærmere hverandre.", ur: "ہم اللہ کے اور ایک دوسرے کے قریب ہو کر واپس آئیں گے۔" }
    ]
  },
  {
    id: 2,
    title: {
      en: "Salah Comes Before Everything",
      no: "Salah kommer før alt annet",
      ur: "نماز ہر چیز پر مقدم ہے"
    },
    iconName: "Clock",
    quranAyat: "إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَوْقُوتًا",
    items: [
      { id: "2_1", en: "No activity, sightseeing, restaurant, or schedule is more important than prayer.", no: "Ingen aktivitet, sightseeing, restaurant eller tidsplan er viktigere enn bønn.", ur: "کوئی بھی سرگرمی، سیر و تفریح، ریستوراں یا شیڈول نماز سے زیادہ اہم نہیں ہے۔" },
      { id: "2_2", en: "We will pray every salah on time.", no: "Vi vil be hver salah i tide.", ur: "ہم ہر نماز وقت پر ادا کریں گے۔" },
      { id: "2_3", en: "We will use the traveler concessions (qasr and combining prayers) properly.", no: "Vi vil bruke reisekonsesjonene (qasr og sammenslåing av bønner) på riktig måte.", ur: "ہم مسافر کی رعایتوں (قصر اور جمع) کا درست استعمال کریں گے۔" },
      { id: "2_4", en: "At least one person will monitor prayer times.", no: "Minst én person vil overvåke bønnetidene.", ur: "کم از کم ایک شخص نماز کے اوقات کی نگرانی کرے گا۔" },
      { id: "2_5", en: "Everyone helps find suitable prayer places.", no: "Alle hjelper til med å finne passende bønnesteder.", ur: "ہر کوئی نماز کے لیے موزوں جگہیں تلاش کرنے میں مدد کرے گا۔" },
      { id: "2_6", en: "We stop the car if necessary for salah.", no: "Vi stopper bilen om nødvendig for salah.", ur: "ہم نماز کے لیے ضرورت پڑنے پر گاڑی روکیں گے۔" },
      { id: "2_7", en: "Fajr has the highest priority.", no: "Fajr har høyest prioritet.", ur: "فجر کو سب سے زیادہ ترجیح حاصل ہے۔" },
      { id: "2_8", en: "We will pray together in congregation whenever possible.", no: "Vi vil be sammen i fellesskap når det er mulig.", ur: "ہم جب بھی ممکن ہو جماعت کے ساتھ مل کر نماز ادا کریں گے۔" }
    ]
  },
  {
    id: 3,
    title: {
      en: "Quran and Dhikr",
      no: "Koranen og Dhikr",
      ur: "قرآن اور ذکر"
    },
    iconName: "BookOpen",
    quranAyat: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ",
    items: [
      { id: "3_1", en: "Begin every day with Quran.", no: "Start hver dag med Koranen.", ur: "ہر دن کا آغاز قرآن سے کریں۔" },
      { id: "3_2", en: "Read or listen to Quran during driving.", no: "Les eller lytt to Koranen under kjøring.", ur: "کوشش کریں کہ گاڑی چلاتے وقت قرآن پڑھیں یا سنیں۔" },
      { id: "3_3", en: "Make dhikr frequently (SubhanAllah, Alhamdulillah, Allahu Akbar, La ilaha illa Allah).", no: "Gjør dhikr ofte (SubhanAllah, Alhamdulillah, Allahu Akbar, La ilaha illa Allah).", ur: "کثرت سے ذکر کریں (سبحان اللہ، الحمد للہ، اللہ اکبر، لا الہ الا اللہ)۔" },
      { id: "3_4", en: "Read morning and evening adhkar.", no: "Les morgen- og kveldsadhkar.", ur: "صبح اور شام کے اذکار پڑھیں۔" },
      { id: "3_5", en: "Make dua before departing and entering destinations.", no: "Gjør dua før avreise og ankomst.", ur: "سفر پر روانہ ہونے اور منزل میں داخل ہونے سے پہلے دعا کریں۔" }
    ]
  },
  {
    id: 4,
    title: {
      en: "Character Rules",
      no: "Karakterregler",
      ur: "اخلاق کے قوانین"
    },
    iconName: "Smile",
    quranAyat: "وَقُولُوا لِلنَّاسِ حُسْنًا",
    items: [
      { id: "4_1", en: "No shouting, sarcasm, insults, or mockery.", no: "Ingen roping, sarkasme, fornærmelser eller spott.", ur: "کوئی چیخ و پکار، طنز، توہین یا مذاق اڑانا نہیں ہوگا۔" },
      { id: "4_2", en: "No complaining excessively.", no: "Ingen overdreven klaging.", ur: "حد سے زیادہ شکایتیں کرنے سے گریز کریں۔" },
      { id: "4_3", en: "No backbiting anyone.", no: "Ingen baksnakking av noen.", ur: "کسی کی غیبت نہیں کی جائے گی۔" },
      { id: "4_4", en: "Speak gently, assume good intentions, and forgive quickly.", no: "Snakk pent, anta gode hensikter og tilgi raskt.", ur: "نرمی سے بات کریں، نیک گمان رکھیں اور جلدی معاف کریں۔" },
      { id: "4_5", en: "Say 'JazakAllahu khairan' often.", no: "Si 'JazakAllahu khairan' ofte.", ur: "اکثر 'جزاک اللہ خیراً' کہیں۔" }
    ]
  },
  {
    id: 5,
    title: {
      en: "Family Unity",
      no: "Familiesamhold",
      ur: "خاندانی اتحاد"
    },
    iconName: "Users",
    quranAyat: "وَاعْتَصِمُوا بِحَبْلِ اللَّهِ جَمِيعًا وَلَا تَفَرَّقُوا",
    items: [
      { id: "5_1", en: "Nobody walks alone without informing others.", no: "Ingen går alene uten å informere andre.", ur: "کوئی بھی دوسروں کو بتائے بغیر اکیلا نہیں چلے گا۔" },
      { id: "5_2", en: "Nobody disappears without communication.", no: "Ingen forsvinner uten kommunikasjon.", ur: "کوئی भी رابطے کے بغیر غائب نہیں ہوگا۔" },
      { id: "5_3", en: "We move together as a family and help elderly members first.", no: "Vi beveger oss sammen som en familie og hjelper eldre medlemmer først.", ur: "ہم ایک خاندان کے طور پر مل کر چلیں گے اور پہلے بزرگوں کی مدد کریں گے۔" },
      { id: "5_4", en: "Children are everyone's responsibility and parents are respected.", no: "Barn er alles ansvar og foreldre respekteres.", ur: "بچے سب کی ذمہ داری ہیں اور والدین کا احترام کیا جائے گا۔" },
      { id: "5_5", en: "Decisions are made with shura (consultation).", no: "Avgjørelser tas med shura (konsultasjon).", ur: "فیصلے شوریٰ (مشورے) سے کیے جائیں گے۔" },
      { id: "5_6", en: "Winning arguments is less important than preserving love.", no: "Å vinne diskusjoner er mindre viktig enn å bevare kjærligheten.", ur: "بحث جیتنا پیار بچانے سے زیادہ اہم نہیں ہے۔" }
    ]
  },
  {
    id: 6,
    title: {
      en: "Discipline",
      no: "Disiplin",
      ur: "نظم و ضبط"
    },
    iconName: "FileCheck",
    quranAyat: "وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ",
    items: [
      { id: "6_1", en: "Be punctual and ready on time.", no: "Vær punktlig og klar i tide.", ur: "وقت کے پابند رہیں اور وقت پر تیار رہیں۔" },
      { id: "6_2", en: "Respect agreed departure times.", no: "Respekter avtalte avreisetider.", ur: "طے شدہ روانگی کے اوقات کا احترام کریں۔" },
      { id: "6_3", en: "Keep luggage organized and leave places cleaner than we found them.", no: "Hold bagasjen organisert og forlat steder renere enn vi fant dem.", ur: "سامان کو منظم رکھیں اور جگہوں کو پہلے سے زیادہ صاف چھوڑیں۔" },
      { id: "6_4", en: "Everyone helps with loading, unloading, and chores.", no: "Alle hjelper til med lasting, lossing og gjøremål.", ur: "ہر کوئی لوڈنگ، ان لوڈنگ اور کاموں میں مدد کرے گا۔" },
      { id: "6_5", en: "Nobody acts like a guest.", no: "Ingen oppfører seg som en gjest.", ur: "کوئی بھی مہمان کی طرح برتاؤ نہیں کرے گا۔" }
    ]
  },
  {
    id: 7,
    title: {
      en: "Car Etiquette",
      no: "Biletikette",
      ur: "گاڑی کے آداب"
    },
    iconName: "Car",
    quranAyat: "وَاقْصِدْ فِي مَشْيِكَ وَاغْضُضْ مِنْ صَوْتِكَ",
    items: [
      { id: "7_1", en: "Driver is never distracted and passenger assists with navigation.", no: "Føreren blir aldri avsporet og passasjeren hjelper til med navigasjon.", ur: "ڈرائیور کا دھیان کبھی نہ بٹے اور مسافر نیویگیشن میں مدد کرے۔" },
      { id: "7_2", en: "No unnecessary criticism of the driver.", no: "Ingen unødvendig kritikk av føreren.", ur: "ڈرائیور پر بلاوجہ تنقید نہ کی جائے۔" },
      { id: "7_3", en: "Keep the car clean and dispose of trash immediately.", no: "Hold bilen ren og kast søppel umiddelbart.", ur: "گاڑی کو صاف رکھیں اور کچرا فوراً پھینکیں۔" },
      { id: "7_4", en: "Use inside voices and no arguments while driving.", no: "Bruk innestemme og ingen krangling under kjøring.", ur: "دھیمی آواز میں بات کریں اور گاڑی چلاتے وقت کوئی بحث نہ کریں۔" },
      { id: "7_5", en: "Everyone wears seatbelts.", no: "Alle bruker sikkerhetsbelte.", ur: "ہر کوئی سیٹ بیلٹ پہنے گا۔" },
      { id: "7_6", en: "Take breaks when needed; safety comes before schedules.", no: "Ta pauser ved behov; sikkerhet kommer før tidsplaner.", ur: "ضرورت پڑنے پر وقفے لیں؛ حفاظت شیڈول سے پہلے ہے۔" }
    ]
  },
  {
    id: 8,
    title: {
      en: "Food Rules",
      no: "Matregler",
      ur: "کھانے کے قوانین"
    },
    iconName: "Utensils",
    quranAyat: "وَكُلُوا وَاشْرَبُوا وَلَا تُسْرِفُوا ۚ إِنَّهُ لَا يُحِبُّ الْمُسْرِفِينَ",
    items: [
      { id: "8_1", en: "Eat halal and avoid waste.", no: "Spis halal og unngå svinn.", ur: "حلال کھائیں اور ضائع کرنے سے بچیں۔" },
      { id: "8_2", en: "Begin with Bismillah and finish with Alhamdulillah.", no: "Start med Bismillah og avslutt med Alhamdulillah.", ur: "بسم اللہ سے شروع کریں اور الحمد للہ پر ختم کریں۔" },
      { id: "8_3", en: "Share food and feed birds/animals only when appropriate.", no: "Del mat og mat fugler/dyr bare når det er passende.", ur: "کھانا بانٹیں اور پرندوں/جانوروں کو صرف مناسب وقت پر کھلائیں۔" },
      { id: "8_4", en: "Avoid excessive spending.", no: "Unngå overdreven pengebruk.", ur: "فضول خرچی سے پرہیز کریں۔" },
      { id: "8_5", en: "Do not complain about food and drink enough water.", no: "Ikke klag på maten, og drikk nok vann.", ur: "کھانے کے بارے میں شکایت نہ کریں اور کافی پانی پییں۔" }
    ]
  },
  {
    id: 9,
    title: {
      en: "Phones and Media",
      no: "Telefoner og Medier",
      ur: "فون اور میڈیا"
    },
    iconName: "PhoneOff",
    quranAyat: "وَالَّذِينَ هُمْ عَنِ اللَّغْوِ مُعْرِضُونَ",
    items: [
      { id: "9_1", en: "No haram content and no music.", no: "Ingen haram innhold og ingen musikk.", ur: "کوئی حرام مواد اور کوئی موسیقی نہیں ہوگی۔" },
      { id: "9_2", en: "Quran, lectures, nasheeds, or beneficial conversations are preferred.", no: "Koranen, foredrag, nasheeds eller nyttige samtaler foretrekkes.", ur: "قرآن، لیکچرز، نعتیں یا تعمیری گفتگو کو ترجیح دی جائے گی۔" },
      { id: "9_3", en: "Put phones away during meals and family discussions.", no: "Legg bort telefoner under måltider og familiesamtaler.", ur: "کھانے اور خاندانی گفتگو کے دوران فون دور رکھیں۔" },
      { id: "9_4", en: "Avoid endless scrolling and protect eyes from inappropriate content.", no: "Unngå endeløs scrolling og beskytt øynene mot upassende innhold.", ur: "بے مقصد فون سکرولنگ سے بچیں اور نظروں کی حفاظت کریں۔" }
    ]
  },
  {
    id: 10,
    title: {
      en: "Gratitude",
      no: "Takknemlighet",
      ur: "شکر گزاری"
    },
    iconName: "Compass",
    quranAyat: "لَئِنْ شَكَرْتُمْ لَأَزِيدَنَّكُمْ",
    quote: {
      en: "\"Rabbana ma khalaqta hadha batilan.\" (Our Lord, You did not create this in vain.)",
      no: "\"Rabbana ma khalaqta hadha batilan.\" (Vår Herre, Du har ikke skapt dette forgjeves.)",
      ur: "\"رَبَّنَا مَا خَلَقْتَ هَٰذَا بَاطِلًا\" (اے ہمارے رب، تو نے یہ سب بے مقصد نہیں بنایا۔)"
    },
    items: [
      { id: "10_1", en: "Appreciate mountains, waterfalls, and scenery as signs of Allah.", no: "Sett pris på fjell, fosser og natur som tegn fra Allah.", ur: "پہاڑوں، آبشاروں اور مناظر کو اللہ کی نشانیاں سمجھ کر ان کی تعریف کریں۔" },
      { id: "10_2", en: "Take pictures, but do not live through the camera.", no: "Ta bilder, men ikke opplev alt gjennom kameraet.", ur: "تصویریں لیں، لیکن ہر چیز کیمرے کی نظر سے ہی نہ دیکھیں۔" },
      { id: "10_3", en: "Enjoy moments, not just memories.", no: "Nyt øyeblikkene, ikke bare minnene.", ur: "یادوں کے بجائے لمحوں سے لطف اندوز ہوں۔" }
    ]
  },
  {
    id: 11,
    title: {
      en: "Money",
      no: "Penger",
      ur: "مالی معاملات"
    },
    iconName: "Coins",
    quranAyat: "وَالَّذِينَ إِذَا أَنْفَقُوا لَمْ يُسْرِفُوا وَلَمْ يَقْتُرُوا وَكَانَ بَيْنَ ذَٰلِكَ قَوَامًا",
    items: [
      { id: "11_1", en: "Spend moderately and avoid extravagance/debt.", no: "Bruk penger moderat og unngå sløsing/gjeld.", ur: "اعتدال سے خرچ کریں اور فضول خرچی/قرض سے بچیں۔" },
      { id: "11_2", en: "Share expenses fairly.", no: "Del utgifter rettferdig.", ur: "اخراجات کو انصاف کے ساتھ شیئر کریں۔" },
      { id: "11_3", en: "Keep emergency funds.", no: "Ha nødfond tilgjengelig.", ur: "ہنگامی فنڈز پاس رکھیں۔" },
      { id: "11_4", en: "Value experiences over shopping.", no: "Verdsett opplevelser over shopping.", ur: "خریداری کے بجائے تجربات کو اہمیت دیں۔" }
    ]
  },
  {
    id: 12,
    title: {
      en: "Time Management",
      no: "Tidsstyring",
      ur: "وقت کا انتظام"
    },
    iconName: "Calendar",
    quranAyat: "إِنَّ الْإِنْسَانَ لَفِي خُسْرٍ",
    items: [
      { id: "12_1", en: "Fajr: Wake without arguments; begin with dhikr and Quran.", no: "Fajr: Våkn opp uten diskusjoner; start med dhikr og Koranen.", ur: "فجر: بغیر کسی بحث کے جاگیں؛ ذکر اور قرآن سے آغاز کریں۔" },
      { id: "12_2", en: "Driving: Productive conversation, Quran, or beneficial lectures.", no: "Kjøring: Produktiv samtale, Koranen eller nyttige foredrag.", ur: "ڈرائیونگ: تعمیری گفتگو، قرآن یا مفید لیکچرز۔" },
      { id: "12_3", en: "Stops: Stretch, pray, and appreciate Allah's creation.", no: "Stopp: Strekk på beina, be og sett pris på Allahs skaperverk.", ur: "اسٹاپس: تھکن اتاریں، نماز پڑھیں اور اللہ کی تخلیق کی تعریف کریں۔" },
      { id: "12_4", en: "Night: Sleep reasonably early and prepare for Fajr.", no: "Natt: Legg deg rimelig tidlig og forbered deg til Fajr.", ur: "رات: مناسب وقت پر سوئیں اور فجر کی تیاری کریں۔" }
    ]
  },
  {
    id: 13,
    title: {
      en: "Conflict Agreement",
      no: "Konfliktavtale",
      ur: "تنازعات کا حل"
    },
    iconName: "Handshake",
    quranAyat: "فَاتَّقُوا اللَّهَ وَأَصْلِحُوا ذَاتَ بَيْنِكُمْ",
    quote: {
      en: "\"May Allah reward you. Let us solve this peacefully.\"",
      no: "\"Måtte Allah belønne deg. La oss løse dette på en fredelig måte.\"",
      ur: "\"اللہ آپ کو جزا دے، آئیے اسے امن سے حل کریں۔\""
    },
    items: [
      { id: "13_1", en: "When disagreements happen: Pause, lower voices, never say hurtful words, and do not bring up old issues.", no: "Når uenigheter oppstår: Ta en pause, senk stemmen, si aldri sårende ord, og ikke trekk frem gamle saker.", ur: "جب اختلافات ہوں: رکیں، آوازیں دھیمی کریں، کبھی تکلیف دہ الفاظ نہ کہیں اور پرانے معاملات نہ اٹھائیں۔" },
      { id: "13_2", en: "Seek compromise.", no: "Søk kompromiss.", ur: "سمجھوتہ کرنے کی کوشش کریں۔" },
      { id: "13_3", en: "Remember that family is more important than being right.", no: "Husk at familien er viktigere enn å ha rett.", ur: "یاد رکھیں کہ خاندانی رشتہ صحیح ہونے کی ضد سے زیادہ اہم ہے۔" }
    ]
  },
  {
    id: 14,
    title: {
      en: "Sunnah of Travel",
      no: "Reisens Sunnah",
      ur: "سفر کی سنتیں"
    },
    iconName: "Navigation",
    quranAyat: "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَٰذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ",
    items: [
      { id: "14_1", en: "Read travel dua.", no: "Les reisedua.", ur: "سفر کی دعا پڑھیں۔" },
      { id: "14_2", en: "Say Takbir when ascending, and Tasbih when descending.", no: "Si Takbir ved oppstigning og Tasbih ved nedstigning.", ur: "بلندی پر جاتے ہوئے تکبیر (اللہ اکبر) اور نیچے آتے ہوئے تسبیح (سبحان اللہ) کہیں۔" },
      { id: "14_3", en: "Make dua often, for the traveler's dua is accepted.", no: "Gjør dua ofte, for den reisendes dua blir hørt.", ur: "کثرت سے دعا مانگیں کیونکہ مسافر کی دعا قبول ہوتی ہے۔" },
      { id: "14_4", en: "Help strangers if possible, smile often, and give charity.", no: "Hjelp fremmede om mulig, smil ofte og gi veldedighet.", ur: "اگر mulig ho to ajnabiyo ki madad karein, muskurayein aur sadqa dein." }
    ]
  },
  {
    id: 15,
    title: {
      en: "Emergency Rule",
      no: "Nødregel",
      ur: "ہنگامی اصول"
    },
    iconName: "AlertTriangle",
    quranAyat: "فَاتَّقُوا اللَّهَ مَا اسْتَطَعْتُمْ",
    quote: {
      en: "Nothing is more important than Taqwa! Everything else is secondary.",
      no: "Ingenting er viktigere enn Taqwa! Alt annet er sekundært.",
      ur: "تقویٰ سے زیادہ اہم کچھ نہیں! باقی سب ثانوی ہے۔"
    },
    items: [
      { id: "15_1", en: "Safety of the family and preservation of faith come first.", no: "Familiens sikkerhet og bevaring av troen kommer først.", ur: "خاندان کی حفاظت اور ایمان کی بقا سب سے پہلے ہے۔" }
    ]
  },
  {
    id: 16,
    title: {
      en: "The Zero-Regret Rule",
      no: "Null-Anger Regelen",
      ur: "زیرو ریگریٹ رول"
    },
    iconName: "Award",
    quranAyat: "وَمَنْ يُطِعِ اللَّهَ وَرَسُولَهُ فَقَدْ فَازَ فَوْزًا عَظِيمًا",
    quote: {
      en: "\"Alhamdulillah, we saw Allah's signs, prayed together, laughed together, helped one another, and returned home better Muslims and a stronger family.\"",
      no: "\"Alhamdulillah, vi så Allahs tegn, ba sammen, lo sammen, hjalp hverandre og vendte hjem som bedre muslimer og en sterkere familie.\"",
      ur: "\"الحمد للہ، ہم نے اللہ کی نشانیاں دیکھیں، اکٹھے نماز پڑھی، ہنسے، ایک دوسرے کی مدد کی اور بہتر مسلمان اور مضبوط خاندان بن کر گھر لوٹے۔\""
    },
    items: [
      { id: "16_1", en: "We do not want to end the trip saying we argued, neglected prayers, wasted time, or scrolled endlessly.", no: "Vi ønsker ikke å avslutte turen med å si at vi kranglet, forsømte bønner, kastet bort tid eller scrollet endeløst.", ur: "ہم سفر کے آخر میں یہ نہیں کہنا چاہتے کہ ہم بحث کرتے رہے، نمازیں قضا کیں، وقت ضائع کیا یا فون سکرول کرتے رہے۔" }
    ]
  },
  {
    id: 17,
    title: {
      en: "Nature & Environment Responsibility",
      no: "Natur- og miljøansvar",
      ur: "فطرت اور ماحولیات کی ذمہ داری"
    },
    iconName: "Trees",
    quranAyat: "وَلَا تُفْسِدُوا فِي الْأَرْضِ بَعْدَ إِصْلَاحِهَا",
    quote: {
      en: "\"If the Hour (Day of Judgment) is about to be established and one of you was holding a palm shoot, let him plant it if he can.\" — Prophet Muhammad ﷺ",
      no: "\"Hvis Timen (Dommedagen) er i ferd med å bli etablert og en av dere holder et palmeskudd, la ham plante det om han kan.\" — Profeten Muhammad ﷺ",
      ur: "\"اگر قیامت قائم ہونے والی ہو اور تم میں سے کسی کے ہاتھ میں کھجور کا پودا ہو تو اگر وہ اسے لگا سکے تو ضرور لگائے۔\" — نبی کریم ﷺ"
    },
    items: [
      { id: "17_1", en: "Do not litter. Leave every place cleaner than you found it.", no: "Ikke forsøpl. Forlat hvert sted renere enn du fant det.", ur: "کوڑا نہ پھیلائیں۔ ہر جگہ کو پہلے سے زیادہ صاف چھوڑ کر جائیں۔" },
      { id: "17_2", en: "Follow Norwegian friluftsliv rules — respect nature trails and marked paths.", no: "Følg norske friluftslivsregler — respekter naturstier og merkede løyper.", ur: "ناروے کے فریلوفتسلیو اصولوں کی پابندی کریں — قدرتی پگڈنڈیوں اور نشان زدہ راستوں کا احترام کریں۔" },
      { id: "17_3", en: "Do not pick flowers, break branches, or disturb wildlife.", no: "Ikke plukk blomster, brekk greiner eller forstyrr dyrelivet.", ur: "پھول نہ توڑیں، شاخیں نہ توڑیں اور جنگلی حیات کو پریشان نہ کریں۔" },
      { id: "17_4", en: "Use designated trash bins and recycling stations.", no: "Bruk tildelte søppelbøtter og gjenvinningsstasjoner.", ur: "مقررہ کوڑے دان اور ری سائیکلنگ اسٹیشنز استعمال کریں۔" },
      { id: "17_5", en: "Teach children to appreciate and protect the environment as Allah's trust (amanah).", no: "Lær barna å verdsette og beskytte miljøet som Allahs betrodd gave (amanah).", ur: "بچوں کو سکھائیں کہ ماحولیات کی حفاظت اللہ کی امانت ہے۔" }
    ]
  },
  {
    id: 18,
    title: {
      en: "Accommodation & Hygiene Rules",
      no: "Regler for overnatting og hygiene",
      ur: "قیام اور صفائی کے قوانین"
    },
    iconName: "Home",
    quranAyat: "إِنَّ اللَّهَ يُحِبُّ التَّوَّابِينَ وَيُحِبُّ الْمُتَطَهِّرِينَ",
    items: [
      { id: "18_1", en: "Keep shared cabins/rooms tidy — make beds, clean surfaces, and pack belongings neatly.", no: "Hold delte hytter/rom ryddige — re opp senger, rengjør overflater og pakk eiendelene pent.", ur: "مشترکہ کیبنز/کمرے صاف ستھرے رکھیں — بستر درست کریں، سطحیں صاف کریں اور سامان منظم رکھیں۔" },
      { id: "18_2", en: "Bathroom etiquette — leave it clean for the next person. Wipe surfaces dry after wudu.", no: "Badetikette — forlat det rent for neste person. Tørk overflater etter wudu.", ur: "باتھ روم کے آداب — اگلے شخص کے لیے صاف چھوڑیں۔ وضو کے بعد سطحیں خشک کریں۔" },
      { id: "18_3", en: "Respect quiet hours after Isha prayer. Allow others to rest.", no: "Respekter stille timer etter Isha-bønnen. La andre hvile.", ur: "عشاء کی نماز کے بعد خاموشی کے اوقات کا احترام کریں۔ دوسروں کو آرام کرنے دیں۔" },
      { id: "18_4", en: "Take off shoes at the door and keep the entrance area clean.", no: "Ta av skoene ved døren og hold inngangsområdet rent.", ur: "دروازے پر جوتے اتاریں اور داخلی جگہ کو صاف رکھیں۔" },
      { id: "18_5", en: "Report any damage or issues to the trip leader immediately.", no: "Rapporter eventuelle skader eller problemer til turlederen umiddelbart.", ur: "کسی بھی نقصان یا مسئلے کی اطلاع فوری طور پر سفر کے ذمہ دار کو دیں۔" },
      { id: "18_6", en: "Share common spaces fairly — kitchen, bathroom, and living room.", no: "Del fellesarealer rettferdig — kjøkken, bad og stue.", ur: "مشترکہ جگہیں منصفانہ طور پر استعمال کریں — باورچی خانہ، باتھ روم اور بیٹھک۔" }
    ]
  },
  {
    id: 19,
    title: {
      en: "Children's Conduct",
      no: "Barnas oppførsel",
      ur: "بچوں کا طرزِ عمل"
    },
    iconName: "Baby",
    quranAyat: "يَا أَيُّهَا الَّذِينَ آمَنُوا قُوا أَنْفُسَكُمْ وَأَهْلِيكُمْ نَارًا",
    quote: {
      en: "\"Be kind to your children and teach them beautiful manners.\" — Prophet Muhammad ﷺ",
      no: "\"Vær snill mot barna deres og lær dem vakre manerer.\" — Profeten Muhammad ﷺ",
      ur: "\"اپنے بچوں کے ساتھ شفقت سے پیش آؤ اور انہیں خوبصورت آداب سکھاؤ۔\" — نبی کریم ﷺ"
    },
    items: [
      { id: "19_1", en: "Parents are responsible for their children at all times — near water, cliffs, and roads.", no: "Foreldre er ansvarlige for barna sine til enhver tid — nær vann, stup og veier.", ur: "والدین ہر وقت اپنے بچوں کے ذمہ دار ہیں — پانی، چٹانوں اور سڑکوں کے قریب خاص طور پر۔" },
      { id: "19_2", en: "Children must follow the same respect and adab rules as adults.", no: "Barn må følge de samme reglene for respekt og adab som voksne.", ur: "بچوں کو بھی بڑوں کی طرح احترام اور آداب کے اصولوں کی پابندی کرنی ہوگی۔" },
      { id: "19_3", en: "Encourage children to participate in dhikr and short duas during the trip.", no: "Oppmuntre barna til å delta i dhikr og korte duaer under turen.", ur: "بچوں کو سفر کے دوران ذکر اور مختصر دعاؤں میں شریک ہونے کی ترغیب دیں۔" },
      { id: "19_4", en: "No excessive screen time for children — engage them with nature.", no: "Ingen overdreven skjermtid for barn — engasjer dem med naturen.", ur: "بچوں کے لیے زیادہ اسکرین ٹائم نہیں — انہیں فطرت سے جوڑیں۔" },
      { id: "19_5", en: "Children should greet others with Salam and say 'JazakAllah' when helped.", no: "Barn bør hilse andre med Salam og si 'JazakAllah' når de får hjelp.", ur: "بچوں کو دوسروں کو سلام کرنا چاہیے اور مدد ملنے پر 'جزاک اللہ' کہنا چاہیے۔" }
    ]
  },
  {
    id: 20,
    title: {
      en: "Photography & Social Media Etiquette",
      no: "Fotografering og sosiale medier-etikette",
      ur: "فوٹوگرافی اور سوشل میڈیا کے آداب"
    },
    iconName: "Camera",
    quranAyat: "يَا أَيُّهَا الَّذِينَ آمَنُوا لَا تَدْخُلُوا بُيُوتًا غَيْرَ بُيُوتِكُمْ حَتَّىٰ تَسْتَأْنِسُوا",
    items: [
      { id: "20_1", en: "Ask permission before photographing or filming other participants.", no: "Spør om tillatelse før du fotograferer eller filmer andre deltakere.", ur: "دوسرے شرکاء کی تصویر یا ویڈیو بنانے سے پہلے اجازت لیں۔" },
      { id: "20_2", en: "Do not share group photos on social media without consent of everyone visible.", no: "Ikke del gruppebilder på sosiale medier uten samtykke fra alle som er synlige.", ur: "تصویر میں نظر آنے والے ہر شخص کی اجازت کے بغیر سوشل میڈیا پر گروپ تصاویر شیئر نہ کریں۔" },
      { id: "20_3", en: "Do not post real-time location of the group for security reasons.", no: "Ikke legg ut gruppens sanntidsposisjon av sikkerhetsgrunner.", ur: "حفاظتی وجوہات کی بنا پر گروپ کی لائیو لوکیشن پوسٹ نہ کریں۔" },
      { id: "20_4", en: "Focus on experiencing moments, not staging them for social media.", no: "Fokuser på å oppleve øyeblikkene, ikke iscenesette dem for sosiale medier.", ur: "لمحوں سے لطف اندوز ہونے پر توجہ دیں، سوشل میڈیا کے لیے بناوٹ نہ کریں۔" },
      { id: "20_5", en: "Avoid excessive selfie-taking at sacred or reflective locations.", no: "Unngå overdreven selfie-taking på hellige eller kontemplative steder.", ur: "مقدس یا سوچ بچار والی جگہوں پر ضرورت سے زیادہ سیلفیاں لینے سے گریز کریں۔" }
    ]
  },
  {
    id: 21,
    title: {
      en: "Health & Safety Preparedness",
      no: "Helse- og sikkerhetsberedskap",
      ur: "صحت اور حفاظت کی تیاری"
    },
    iconName: "ShieldCheck",
    quranAyat: "وَلَا تُلْقُوا بِأَيْدِيكُمْ إِلَى التَّهْلُكَةِ",
    items: [
      { id: "21_1", en: "Inform the trip leader of any medical conditions, allergies, or dietary restrictions.", no: "Informer turlederen om eventuelle medisinske tilstander, allergier eller diettrestriksjoner.", ur: "سفر کے ذمہ دار کو کسی بھی طبی حالت، الرجی یا غذائی پابندیوں سے آگاہ کریں۔" },
      { id: "21_2", en: "Carry personal medications and a basic first aid kit.", no: "Ha med personlige medisiner og et grunnleggende førstehjelpsskrin.", ur: "ذاتی دوائیں اور ابتدائی طبی امداد کا بنیادی سامان ساتھ رکھیں۔" },
      { id: "21_3", en: "Stay hydrated and eat regular meals — do not skip meals during long drives.", no: "Hold deg hydrert og spis regelmessige måltider — ikke hopp over måltider under lange kjøreturer.", ur: "پانی پیتے رہیں اور باقاعدگی سے کھائیں — لمبے سفر میں کھانا نہ چھوڑیں۔" },
      { id: "21_4", en: "Know the emergency number in Norway: 113 (ambulance), 110 (fire), 112 (police).", no: "Kjenn nødnumrene i Norge: 113 (ambulanse), 110 (brann), 112 (politi).", ur: "ناروے کے ہنگامی نمبر جان لیں: 113 (ایمبولینس)، 110 (فائر)، 112 (پولیس)۔" },
      { id: "21_5", en: "Wear appropriate safety gear at glacier viewpoints and steep trails.", no: "Bruk passende sikkerhetsutstyr ved brevannspunkter og bratte stier.", ur: "گلیشیئر ویو پوائنٹس اور کھڑی پگڈنڈیوں پر مناسب حفاظتی سامان پہنیں۔" },
      { id: "21_6", en: "Never swim alone in fjords or rivers — cold water shock is a real danger.", no: "Svøm aldri alene i fjorder eller elver — kaldtvannssjokk er en reell fare.", ur: "فیورڈز یا دریاؤں میں کبھی اکیلے نہ تیریں — ٹھنڈے پانی کا جھٹکا ایک حقیقی خطرہ ہے۔" }
    ]
  }
];
