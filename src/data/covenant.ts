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
    items: [
      { id: "3_1", en: "Begin every day with Quran.", no: "Start hver dag med Koranen.", ur: "ہر دن کا آغاز قرآن سے کریں۔" },
      { id: "3_2", en: "Read or listen to Quran during driving.", no: "Les eller lytt til Koranen under kjøring.", ur: "کوشش کریں کہ گاڑی چلاتے وقت قرآن پڑھیں یا سنیں۔" },
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
    items: [
      { id: "5_1", en: "Nobody walks alone without informing others.", no: "Ingen går alene uten å informere andre.", ur: "کوئی بھی دوسروں کو بتائے بغیر اکیلا نہیں چلے گا۔" },
      { id: "5_2", en: "Nobody disappears without communication.", no: "Ingen forsvinner uten kommunikasjon.", ur: "کوئی بھی رابطے کے بغیر غائب نہیں ہوگا۔" },
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
    items: [
      { id: "14_1", en: "Read travel dua.", no: "Les reisedua.", ur: "سفر کی دعا پڑھیں۔" },
      { id: "14_2", en: "Say Takbir when ascending, and Tasbih when descending.", no: "Si Takbir ved oppstigning og Tasbih ved nedstigning.", ur: "بلندی پر جاتے ہوئے تکبیر (اللہ اکبر) اور نیچے آتے ہوئے تسبیح (سبحان اللہ) کہیں۔" },
      { id: "14_3", en: "Make dua often, for the traveler's dua is accepted.", no: "Gjør dua ofte, for den reisendes dua blir hørt.", ur: "کثرت سے دعا مانگیں کیونکہ مسافر کی دعا قبول ہوتی ہے۔" },
      { id: "14_4", en: "Help strangers if possible, smile often, and give charity.", no: "Hjelp fremmede om mulig, smil ofte og gi veldedighet.", ur: "اگر ممکن ہو تو اجنبیوں کی مدد کریں، مسکرائیں اور صدقہ دیں۔" }
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
    quote: {
      en: "\"Alhamdulillah, we saw Allah's signs, prayed together, laughed together, helped one another, and returned home better Muslims and a stronger family.\"",
      no: "\"Alhamdulillah, vi så Allahs tegn, ba sammen, lo sammen, hjalp hverandre og vendte hjem som bedre muslimer og en sterkere familie.\"",
      ur: "\"الحمد للہ، ہم نے اللہ کی نشانیاں دیکھیں، اکٹھے نماز پڑھی، ہنسے، ایک دوسرے کی مدد کی اور بہتر مسلمان اور مضبوط خاندان بن کر گھر لوٹے۔\""
    },
    items: [
      { id: "16_1", en: "We do not want to end the trip saying we argued, neglected prayers, wasted time, or scrolled endlessly.", no: "Vi ønsker ikke å avslutte turen med å si at vi kranglet, forsømte bønner, kastet bort tid eller scrollet endeløst.", ur: "ہم سفر کے آخر میں یہ نہیں کہنا چاہتے کہ ہم بحث کرتے رہے، نمازیں قضا کیں، وقت ضائع کیا یا فون سکرول کرتے رہے۔" }
    ]
  }
];
