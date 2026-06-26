export interface PackingItem {
  id: string;
  category: 'clothing' | 'spiritual' | 'electronics' | 'health' | 'documents' | 'comfort';
  name: { en: string; no: string; ur: string };
  desc: { en: string; no: string; ur: string };
  store: { en: string; no: string; ur: string };
  imageUrl?: string;
}

export const defaultPackingList: PackingItem[] = [
  {
    "id": "c1",
    "category": "clothing",
    "name": {
      "en": "Waterproof Jacket",
      "no": "Vanntett jakke",
      "ur": "واٹر پروف جیکٹ"
    },
    "desc": {
      "en": "A high-quality windproof and waterproof jacket. Mountain weather is highly unpredictable.",
      "no": "En vindtett og vanntett jakke av høy kvalitet. Fjellværet er svært uforutsigbart.",
      "ur": "ایک معیاری ہوا اور پانی روکنے والی جیکٹ۔ ناروے کا پہاڑی موسم غیر متوقع ہوتا ہے۔"
    },
    "store": {
      "en": "XXL Sport / Stormberg Store",
      "no": "XXL Sport / Stormberg-butikk",
      "ur": "ایکس ایکس ایل اسپورٹس یا اسٹورمبرگ اسٹور"
    },
    "imageUrl": "https://images.unsplash.com/photo-1544923246-77307dd654cb?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "c2",
    "category": "clothing",
    "name": {
      "en": "Hiking Boots",
      "no": "Fjellstøvler",
      "ur": "ہائیکنگ بوٹس"
    },
    "desc": {
      "en": "Sturdy, waterproof trail boots with good ankle support for glacier and ravine stops.",
      "no": "Solide, vanntette tursko med god ankelstøtte for stopp ved breer og juv.",
      "ur": "گلیشیر، چٹانوں اور آبشاروں پر چلنے کے لیے مضبوط، واٹر پروف اور ٹخنوں کی سپورٹ والے جوتے۔"
    },
    "store": {
      "en": "XXL Sport / Sport 1",
      "no": "XXL Sport / Sport 1",
      "ur": "ایکس ایکس ایل اسپورٹس یا اسپورٹ 1"
    },
    "imageUrl": "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "c3",
    "category": "clothing",
    "name": {
      "en": "Thermal Base Layers",
      "no": "Termisk undertøy",
      "ur": "تھرمل اندرونی لباس"
    },
    "desc": {
      "en": "Merino wool or warm base layers (top and bottom). Temperatures can drop below 8°C in passes.",
      "no": "Merinoull eller varmt superundertøy (overdel og underdel). Temperaturen kan falle under 8°C på fjelloverganger.",
      "ur": "اون یا گرم تھرمل لباس (اوپری اور نچلا حصہ)۔ پہاڑی راستوں پر درجہ حرارت 8 ڈگری سے نیچے جا سکتا ہے۔"
    },
    "store": {
      "en": "Kiwi, Rema 1000, or XXL",
      "no": "Kiwi, Rema 1000 eller XXL",
      "ur": "کیوی، ریما 1000، یا ایکس ایکس ایل"
    },
    "imageUrl": "https://images.unsplash.com/photo-1508216813474-05d11f10dedc?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "c4",
    "category": "clothing",
    "name": {
      "en": "Extra Merino Socks",
      "no": "Ekstra sokker i merinoull",
      "ur": "اضافی اونی جرابیں"
    },
    "desc": {
      "en": "Keeps feet warm and dry even if damp. Pack at least 3-4 pairs.",
      "no": "Holder føttene varme og tørre. Pakk minst 3-4 par.",
      "ur": "پاؤں کو گرم اور خشک رکھنے کے لیے اونی جرابیں، کم از کم 3-4 جوڑے۔"
    },
    "store": {
      "en": "Any supermarket / Online",
      "no": "Hvilken som helst matbutikk / Online",
      "ur": "کوئی بھی سپر مارکیٹ یا آن لائن"
    },
    "imageUrl": "https://images.unsplash.com/photo-1582966772680-860e372bb558?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "s1",
    "category": "spiritual",
    "name": {
      "en": "Travel Prayer Mat",
      "no": "Reisebønnematte",
      "ur": "سفری جائے نماز"
    },
    "desc": {
      "en": "Lightweight, waterproof pocket prayer mat for praying in scenic outdoor locations.",
      "no": "Lett, vanntett bønneteppe i lommeformat for bønn utendørs.",
      "ur": "قدرتی مناظر کے درمیان نماز پڑھنے کے لیے ہلکی اور واٹر پروف پاکٹ جائے نماز۔"
    },
    "store": {
      "en": "Islamic bookstore / Online",
      "no": "Islamsk bokhandel / Online",
      "ur": "اسلامک بک اسٹور یا آن لائن"
    },
    "imageUrl": "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "s2",
    "category": "spiritual",
    "name": {
      "en": "Wudu Spray Bottle",
      "no": "Sprayflaske til wudu",
      "ur": "وضو اسپرے بوتل"
    },
    "desc": {
      "en": "A small spray bottle to easily perform wudu inside the Sprinter bus or on the road.",
      "no": "En liten sprayflaske for enkelt å utføre wudu i minibussen eller på veien.",
      "ur": "بس میں یا سڑک کنارے آسانی سے وضو کرنے کے لیے ایک چھوٹی اسپرے بوتل۔"
    },
    "store": {
      "en": "Clas Ohlson / Biltema",
      "no": "Clas Ohlson / Biltema",
      "ur": "کلاس اوہلسن یا بلتیما"
    },
    "imageUrl": "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "s3",
    "category": "spiritual",
    "name": {
      "en": "Pocket Quran / App",
      "no": "Lomme-Koran / App",
      "ur": "پاکٹ قرآن / ایپ"
    },
    "desc": {
      "en": "For daily spiritual recitations and travel reflections.",
      "no": "For daglig lesing og refleksjon.",
      "ur": "سفر کے دوران روزانہ کی تلاوت، ذکر اور غور و فکر کے لیے۔"
    },
    "store": {
      "en": "App Store / Google Play",
      "no": "App Store / Google Play",
      "ur": "ایپ اسٹور یا گوگل پلے"
    },
    "imageUrl": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "e1",
    "category": "electronics",
    "name": {
      "en": "Heavy-Duty Power Bank",
      "no": "Kraftig powerbank",
      "ur": "پاور بینک"
    },
    "desc": {
      "en": "At least 15,000 mAh to keep your phone charged. GPS and camera drain battery quickly.",
      "no": "Minst 15 000 mAh for å holde telefonen ladet. GPS og kamera bruker mye strøm.",
      "ur": "کم از کم 15000 ایم اے ایچ پاور بینک، کیونکہ جی پی ایس اور کیمرے سے بیٹری جلدی ختم ہوتی ہے۔"
    },
    "store": {
      "en": "Clas Ohlson / Kjell & Co",
      "no": "Clas Ohlson / Kjell & Co",
      "ur": "کلاس اوہلسن یا شیل اینڈ کمپنی"
    },
    "imageUrl": "https://images.unsplash.com/photo-1609592806453-6a991a03eefb?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "e2",
    "category": "electronics",
    "name": {
      "en": "Thermos Flask",
      "no": "Termos",
      "ur": "تھرماس"
    },
    "desc": {
      "en": "For keeping water or tea hot during long driving days.",
      "no": "For å holde vann eller te varmt på lange kjøredager.",
      "ur": "طویل سفر کے دوران گرم پانی، چائے یا کافی کے لیے۔"
    },
    "store": {
      "en": "Clas Ohlson / Biltema / Jula",
      "no": "Clas Ohlson / Biltema / Jula",
      "ur": "کلاس اوہلسن یا بلتیما"
    },
    "imageUrl": "https://images.unsplash.com/photo-1576016770956-debb63d900cc?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "e3",
    "category": "electronics",
    "name": {
      "en": "Travel Neck Pillow",
      "no": "Reisenakkepute",
      "ur": "سفری گردن کا تکیہ"
    },
    "desc": {
      "en": "Provides neck support during the multi-hour Sprinter minibus drives.",
      "no": "Gir god nakkestøtte under lange timer i minibussen.",
      "ur": "منی بس میں طویل گھنٹوں کے سفر کے دوران گردن کے آرام اور مدد کے لیے۔"
    },
    "store": {
      "en": "Any supermarket / Online",
      "no": "Hvilken som helst matbutikk / Online",
      "ur": "کوئی بھی سپر مارکیٹ یا آن لائن"
    },
    "imageUrl": "https://images.unsplash.com/photo-1520038410233-7141be7e6f97?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "h1",
    "category": "health",
    "name": {
      "en": "Motion Sickness Pills",
      "no": "Reisesyketabletter",
      "ur": "سفر کی الٹی کی گولیاں"
    },
    "desc": {
      "en": "Crucial for the winding hairpin turns of Trollstigen and Eagle Road.",
      "no": "Avgjørende for de svingete hårnålssvingene i Trollstigen og Ørnevegen.",
      "ur": "ٹرولسٹائگن اور ایگل روڈ کے موڑ دار راستوں پر چکر اور الٹی سے بچنے کی دوا (لازمی)۔"
    },
    "store": {
      "en": "Pharmacy (Apotek 1 / Vitusapotek)",
      "no": "Apotek (Apotek 1 / Vitusapotek)",
      "ur": "فارمیسی (اپوتیک 1)"
    },
    "imageUrl": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "h2",
    "category": "health",
    "name": {
      "en": "Sunscreen & Lip Balm",
      "no": "Solkrem og leppebalm",
      "ur": "سن اسکرین اور ہونٹ بام"
    },
    "desc": {
      "en": "High-factor UV protection. Glaciers and snowy peaks amplify solar rays intensely.",
      "no": "Høy solfaktor. Isbreer og snødekte topper reflekterer solstrålene intenst.",
      "ur": "تیز دھوپ سے بچنے کے لیے سن اسکرین۔ گلیشیرز اور برفیلے پہاڑ دھوپ کی شدت کو بڑھاتے ہیں۔"
    },
    "store": {
      "en": "Pharmacy / Kiwi / Rema 1000",
      "no": "Apotek / Kiwi / Rema 1000",
      "ur": "ایم آئی ایم آر پی یا سپر مارکیٹ"
    },
    "imageUrl": "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "h3",
    "category": "health",
    "name": {
      "en": "Wet Wipes & Sanitizer",
      "no": "Våtservietter og håndsprit",
      "ur": "گیلے ٹشوز اور سینیٹائزر"
    },
    "desc": {
      "en": "For quick hygiene, cleaning hands on the road, and wudu cleanups.",
      "no": "For rask hygiene og vask av hender på veien.",
      "ur": "سفر کے دوران فوری صفائی، ہاتھ دھونے اور وضو کے بعد خشک کرنے کے لیے۔"
    },
    "store": {
      "en": "Kiwi / Rema 1000 / Coop Extra",
      "no": "Kiwi / Rema 1000 / Coop Extra",
      "ur": "کیوی، ریما 1000 یا کوپ ایکسٹرا"
    },
    "imageUrl": "https://images.unsplash.com/photo-1614859324967-bdf461f57e2c?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "c5",
    "category": "clothing",
    "name": {
      "en": "Rain Pants",
      "no": "Regnbukser",
      "ur": "بارش کی پتلون"
    },
    "desc": {
      "en": "Waterproof over-trousers for hiking in rain. Norwegian mountain weather changes fast.",
      "no": "Vanntette overtrekksbukser for fotturer i regn. Det norske fjellværet skifter fort.",
      "ur": "بارش میں پیدل چلنے کے لیے واٹر پروف پتلون۔ ناروے کا پہاڑی موسم تیزی سے بدلتا ہے۔"
    },
    "store": {
      "en": "XXL Sport / Stormberg Store",
      "no": "XXL Sport / Stormberg-butikk",
      "ur": "ایکس ایکس ایل اسپورٹس یا اسٹورمبرگ اسٹور"
    },
    "imageUrl": "https://images.unsplash.com/photo-1551854838-212c50b4c184?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "c6",
    "category": "clothing",
    "name": {
      "en": "Warm Hat & Gloves",
      "no": "Varm lue & dyster/hansker",
      "ur": "گرم ٹوپی اور دستانے"
    },
    "desc": {
      "en": "Temperatures drop sharply at mountain passes and glacier viewpoints. Pack lightweight merino.",
      "no": "Temperaturene synker kraftig på fjelloverganger og utsiktspunkter ved isbreer. Pakk lett merinoull.",
      "ur": "پہاڑی راستوں اور گلیشیر کے نظاروں پر درجہ حرارت تیزی سے گرتا ہے۔ ہلکی اونی ٹوپی اور دستانے ساتھ رکھیں۔"
    },
    "store": {
      "en": "XXL / Kiwi / Rema 1000",
      "no": "XXL / Kiwi / Rema 1000",
      "ur": "ایکس ایکس ایل / کیوی / ریما 1000"
    },
    "imageUrl": "https://images.unsplash.com/photo-1576871337622-98d48d4aa53e?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "c7",
    "category": "clothing",
    "name": {
      "en": "Sunglasses",
      "no": "Solbriller",
      "ur": "دھوپ کا چشمہ"
    },
    "desc": {
      "en": "UV protection is essential near glaciers, snow, and open fjords. Polarised lenses recommended.",
      "no": "UV-beskyttelse er viktig i nærheten av breer, snø og åpne fjorder. Polariserte glass anbefales.",
      "ur": "گلیشیر، برف اور کھلی جھیلوں کے قریب دھوپ کی شعاعوں سے بچاؤ ضروری ہے۔ پولرائزڈ چشمہ تجویز کیا جاتا ہے۔"
    },
    "store": {
      "en": "Any store / Synsam",
      "no": "Hvilken som helst butikk / Synsam",
      "ur": "کوئی بھی دکان / سن سیم"
    },
    "imageUrl": "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "s4",
    "category": "spiritual",
    "name": {
      "en": "Compass / Qibla App",
      "no": "Kompass / Qibla-app",
      "ur": "قطب نما / قبلہ ایپ"
    },
    "desc": {
      "en": "For finding prayer direction in remote mountain locations where signal may be weak.",
      "no": "For å finne bønneretningen i avsidesliggende fjellområder der mobilsignalet kan være svakt.",
      "ur": "پہاڑی مقامات پر جہاں سگنل کمزور ہو سکتے ہیں، قبلہ رخ تلاش کرنے کے لیے۔"
    },
    "store": {
      "en": "App Store / Google Play",
      "no": "App Store / Google Play",
      "ur": "ایپ اسٹور یا گوگل پلے"
    },
    "imageUrl": "https://images.unsplash.com/photo-1530907851079-af602d550799?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "s5",
    "category": "spiritual",
    "name": {
      "en": "Dua Book / Fortress of the Muslim",
      "no": "Duabok / Muslimens festning",
      "ur": "دعاؤں کی کتاب / حصن المسلم"
    },
    "desc": {
      "en": "Collection of daily duas and travel supplications. Essential for morning/evening adhkar.",
      "no": "Samling av daglige duaer og reisebønner. Essensiell for morgen- og kveldsadhkar.",
      "ur": "روزانہ کی دعاؤں اور سفر کی دعاؤں کا مجموعہ۔ صبح و شام کے اذکار کے لیے ضروری۔"
    },
    "store": {
      "en": "Islamic bookstore / Online",
      "no": "Islamsk bokhandel / Online",
      "ur": "اسلامک بک اسٹور یا آن لائن"
    },
    "imageUrl": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "e4",
    "category": "electronics",
    "name": {
      "en": "USB Car Charger",
      "no": "USB-billader",
      "ur": "یو ایس بی کار چارجر"
    },
    "desc": {
      "en": "Multi-port car charger for the Sprinter minibus. Keep all devices topped up during long drives.",
      "no": "Multi-port billader til minibussen. Hold alle enheter ladet under lange kjøreturer.",
      "ur": "منی بس کے لیے ملٹی پورٹ کار چارجر۔ طویل سفر کے دوران تمام آلات کو چارج رکھیں۔"
    },
    "store": {
      "en": "Clas Ohlson / Kjell & Co",
      "no": "Clas Ohlson / Kjell & Co",
      "ur": "کلاس اوہلسن یا شیل اینڈ کمپنی"
    },
    "imageUrl": "https://images.unsplash.com/photo-1563206767-5b18f218e8de?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "e5",
    "category": "electronics",
    "name": {
      "en": "Flashlight / Head Torch",
      "no": "Lommelykt / Hodelykt",
      "ur": "ٹارچ / ہیڈ لیمپ"
    },
    "desc": {
      "en": "Essential for evening prayers outdoors, cabin walks at night, and emergency situations.",
      "no": "Nødvendig for kveldsbønner utendørs, turer mellom hytter om natten, og i nødsituasjoner.",
      "ur": "باہر رات کی نماز، اندھیرے میں چلنے اور ہنگامی حالات کے لیے ضروری۔"
    },
    "store": {
      "en": "Clas Ohlson / Biltema / Jula",
      "no": "Clas Ohlson / Biltema / Jula",
      "ur": "کلاس اوہلسن یا بلتیما"
    },
    "imageUrl": "https://images.unsplash.com/photo-1504221507732-5246c045949b?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "h4",
    "category": "health",
    "name": {
      "en": "Personal Medications",
      "no": "Personlige medisiner",
      "ur": "ذاتی ادویات"
    },
    "desc": {
      "en": "Any prescription meds, inhalers, or EpiPens. Always carry in hand luggage, not checked bags.",
      "no": "Reseptbelagte medisiner, inhalatorer eller EpiPens. Må alltid bæres i håndbagasjen.",
      "ur": "کوئی بھی تجویز کردہ ادویات، انہیلر وغیرہ۔ ہمیشہ سفری ہینڈ بیگ میں رکھیں، بڑے سامان میں نہ رکھیں۔"
    },
    "store": {
      "en": "Pharmacy (Apotek 1 / Vitusapotek)",
      "no": "Apotek (Apotek 1 / Vitusapotek)",
      "ur": "فارمیسی (اپوتیک 1)"
    },
    "imageUrl": "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "h5",
    "category": "health",
    "name": {
      "en": "Insect Repellent",
      "no": "Myggspray",
      "ur": "مچھروں سے بچاؤ کا اسپرے"
    },
    "desc": {
      "en": "Midges and mosquitoes near fjords and valleys are common in Norwegian summer.",
      "no": "Knott og mygg er vanlig nær fjorder og daler i den norske sommeren.",
      "ur": "ناروے کی گرمیوں میں جھیلوں اور وادیوں کے قریب مچھر ہونا عام بات ہے۔"
    },
    "store": {
      "en": "Pharmacy / Kiwi / Rema 1000",
      "no": "Apotek / Kiwi / Rema 1000",
      "ur": "فارمیسی یا سپر مارکیٹ"
    },
    "imageUrl": "https://images.unsplash.com/photo-1578991624414-276ef23a534f?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "h6",
    "category": "health",
    "name": {
      "en": "Basic First Aid Kit",
      "no": "Enkel førstehjelpsskrin",
      "ur": "ابتدائی طبی امدادی کٹ"
    },
    "desc": {
      "en": "Plasters, antiseptic wipes, paracetamol, ibuprofen, and blister pads for hiking.",
      "no": "Plaster, renseservietter, paracet, ibux og gnagsårplaster for fotturer.",
      "ur": "مرہم پٹی، اینٹی سیپٹک وائپس، درد کش گولیاں اور ہائیکنگ کے لیے پلاسٹر۔"
    },
    "store": {
      "en": "Apotek 1 / Vitusapotek",
      "no": "Apotek 1 / Vitusapotek",
      "ur": "اپوتیک 1 / ویتوس اپوتیک"
    },
    "imageUrl": "https://images.unsplash.com/photo-1603398938378-e54eab446dde?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "d1",
    "category": "documents",
    "name": {
      "en": "Valid ID / Passport",
      "no": "Gyldig legitimasjon / Pass",
      "ur": "شناختی کارڈ / پاسپورٹ"
    },
    "desc": {
      "en": "Required for all participants. Keep accessible for hotel check-ins and emergencies.",
      "no": "Kreves for alle deltakere. Ha det lett tilgjengelig for innsjekking og nødsituasjoner.",
      "ur": "تمام شرکاء کے لیے لازمی۔ ہوٹل چیک ان اور ہنگامی حالات کے لیے پاس رکھیں۔"
    },
    "store": {
      "en": "Already owned",
      "no": "Allerede eid",
      "ur": "پہلے سے موجود ہے"
    },
    "imageUrl": "https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "d2",
    "category": "documents",
    "name": {
      "en": "Travel Insurance Card",
      "no": "Reiseforsikringskort",
      "ur": "ٹریول انشورنس کارڈ"
    },
    "desc": {
      "en": "European Health Insurance Card (EHIC) or travel insurance document. Essential for medical coverage.",
      "no": "Europeisk helsetrygdkort (helsetrygdkort) eller reiseforsikringsbevis. Viktig for medisinsk dekning.",
      "ur": "یورپی ہیلتھ انشورنس کارڈ (EHIC) یا ٹریول انشورنس دستاویز۔ طبی کوریج کے لیے ضروری۔"
    },
    "store": {
      "en": "Insurance provider / Bank",
      "no": "Forsikringsselskap / Bank",
      "ur": "انشورنس کمپنی / بینک"
    },
    "imageUrl": "https://images.unsplash.com/photo-1589758438368-0ad531db3366?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "d3",
    "category": "documents",
    "name": {
      "en": "Driver's License",
      "no": "Førerkort",
      "ur": "ڈرائیونگ لائسنس"
    },
    "desc": {
      "en": "Required if you're one of the designated drivers. Must be valid in Norway.",
      "no": "Kreves hvis du er en av de utpekte sjåførene. Må være gyldig i Norge.",
      "ur": "اگر آپ نامزد ڈرائیوروں میں سے ایک ہیں۔ ناروے میں کارآمد ہونا ضروری ہے۔"
    },
    "store": {
      "en": "Already owned",
      "no": "Allerede eid",
      "ur": "پہلے سے موجود ہے"
    },
    "imageUrl": "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "d4",
    "category": "documents",
    "name": {
      "en": "Cash & Cards",
      "no": "Kontanter og kort",
      "ur": "کیش اور کارڈز"
    },
    "desc": {
      "en": "Have some Norwegian kroner (NOK) as backup. Not all mountain shops accept cards.",
      "no": "Ha noen norske kroner (NOK) i bakhånd. Ikke alle fjellbutikker godtar kort.",
      "ur": "مدد کے لیے کچھ نارویجن کرونر (NOK) نقد پاس رکھیں۔ تمام دکانیں کارڈ قبول نہیں کرتیں۔"
    },
    "store": {
      "en": "Bank / ATM",
      "no": "Bank / Minibank",
      "ur": "بینک / اے ٹی ایم"
    },
    "imageUrl": "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "f1",
    "category": "comfort",
    "name": {
      "en": "Reusable Water Bottle",
      "no": "Gjenbrukbar vannflaske",
      "ur": "پانی کی بوتل"
    },
    "desc": {
      "en": "Stay hydrated on hikes and drives. Norway has excellent, clean tap water everywhere.",
      "no": "Hold deg hydrert på tur. Norge har utmerket, rent drikkevann i kranene overalt.",
      "ur": "ہائیکنگ اور ڈرائیونگ کے دوران پانی پینے کے لیے۔ ناروے میں نلکے کا صاف پانی ہر جگہ دستیاب ہے۔"
    },
    "store": {
      "en": "Any store / Clas Ohlson",
      "no": "Hvilken som helst butikk / Clas Ohlson",
      "ur": "کوئی بھی دکان / کلاس اوہلسن"
    },
    "imageUrl": "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "f2",
    "category": "comfort",
    "name": {
      "en": "Snack Bag",
      "no": "Snackpose",
      "ur": "اسنیکس بیگ"
    },
    "desc": {
      "en": "Dates, nuts, energy bars, and fruit for long driving stretches between stops.",
      "no": "Daddel, nøtter, energibarer og frukt for lange kjøreetapper mellom stoppene.",
      "ur": "پڑاؤ کے درمیان طویل سفر کے لیے کھجوریں، گری دار میوے اور توانائی کی بارز۔"
    },
    "store": {
      "en": "Kiwi / Rema 1000 / Any store",
      "no": "Kiwi / Rema 1000 / Hvilken som helst butikk",
      "ur": "کیوی / ریما 1000 / کوئی بھی دکان"
    },
    "imageUrl": "https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "f3",
    "category": "comfort",
    "name": {
      "en": "Small Backpack / Daypack",
      "no": "Liten ryggsekk / Dagstursekk",
      "ur": "چھوٹا بیگ / ہینڈ بیگ"
    },
    "desc": {
      "en": "For carrying essentials (water, snacks, prayer mat) during hikes and sightseeing stops.",
      "no": "For å bære nødvendigheter (vann, snacks, bønneteppe) på turer og sightseeingstopp.",
      "ur": "ہائیکنگ اور سیر و تفریح کے دوران ضروری سامان (پانی، جائے نماز) لے جانے کے لیے۔"
    },
    "store": {
      "en": "XXL / Sport 1",
      "no": "XXL / Sport 1",
      "ur": "ایکس ایکس ایل / اسپورٹ 1"
    },
    "imageUrl": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "f4",
    "category": "comfort",
    "name": {
      "en": "Plastic Bags",
      "no": "Plastposer",
      "ur": "پلاسٹک کے تھیلے"
    },
    "desc": {
      "en": "For separating wet clothes, dirty laundry, or muddy shoes. Pack 5-10 bags.",
      "no": "For å sortere våte klær, skittentøy eller skitne sko. Pakk 5-10 poser.",
      "ur": "گیلے کپڑے، گندے کپڑے یا گندے جوتے الگ رکھنے کے لیے۔ 5 سے 10 تھیلے ساتھ رکھیں۔"
    },
    "store": {
      "en": "Any store",
      "no": "Hvilken som helst butikk",
      "ur": "کوئی भी دکان"
    },
    "imageUrl": "https://images.unsplash.com/photo-1526951521990-620dc14c214b?auto=format&fit=crop&w=600&q=80"
  }
];
