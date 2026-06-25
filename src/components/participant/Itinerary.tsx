import React, { useState, useEffect } from 'react';
import { MapPin, Coffee, Sunrise, Sun, Sunset, Info, ZoomIn, ZoomOut, RotateCcw, Play, Pause, X, GripHorizontal, Minimize2 } from 'lucide-react';
import { doc, getDoc, setDoc, onSnapshot, collection } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useLanguage } from '../../contexts/LanguageContext';

interface LocationCoords {
  lat: number;
  lng: number;
  elevation: number;
}

const locations: Record<string, LocationCoords> = {
  oslo: { lat: 59.91, lng: 10.75, elevation: 20 },
  fla: { lat: 60.42, lng: 9.47, elevation: 150 },
  gol: { lat: 60.70, lng: 8.95, elevation: 200 },
  geilo: { lat: 60.53, lng: 8.21, elevation: 800 },
  laerdal: { lat: 61.10, lng: 7.48, elevation: 50 },
  boyabreen: { lat: 61.48, lng: 6.74, elevation: 20 },
  stryn: { lat: 61.90, lng: 6.72, elevation: 10 },
  valldal: { lat: 62.30, lng: 7.26, elevation: 5 },
  trollstigen: { lat: 62.45, lng: 7.67, elevation: 850 },
  geiranger: { lat: 62.10, lng: 7.20, elevation: 10 },
  dalsnibba: { lat: 62.05, lng: 7.27, elevation: 1500 },
  lom: { lat: 61.84, lng: 8.57, elevation: 380 },
  lillehammer: { lat: 61.11, lng: 10.47, elevation: 180 },
  bergen: { lat: 60.39, lng: 5.32, elevation: 5 },
  drammen: { lat: 59.74, lng: 10.20, elevation: 10 },
  alesund: { lat: 62.47, lng: 6.15, elevation: 5 },
  stavanger: { lat: 58.97, lng: 5.73, elevation: 5 }
};

const iconMap: Record<string, React.ComponentType<any>> = {
  MapPin,
  Coffee,
  Sunrise,
  Sun,
  Sunset
};

// Dynamic Norway High-Latitude Prayer Calculation
function calculateTravelPrayers(locKey: string, dayOffset: number) {
  const coords = locations[locKey] || locations.oslo;
  const baseDate = new Date(2026, 5, 25 + dayOffset); // Thursday June 25, 2026 base

  const dayOfYear = Math.floor((baseDate.getTime() - new Date(baseDate.getFullYear(), 0, 0).getTime()) / 86400000);
  
  // Declination of Sun
  const decl = 23.45 * Math.sin((360 / 365) * (dayOfYear - 80) * Math.PI / 180);
  
  // Height elevation correction: horizon depression due to altitude (h in meters)
  const horizonDepression = 0.0347 * Math.sqrt(coords.elevation || 0);
  const solarAltRad = (-0.833 - horizonDepression) * Math.PI / 180;
  
  const latRad = coords.lat * Math.PI / 180;
  const declRad = decl * Math.PI / 180;
  
  const cosH = (Math.sin(solarAltRad) - Math.sin(latRad) * Math.sin(declRad)) / (Math.cos(latRad) * Math.cos(declRad));
  
  let H = 0;
  let isMidnightSun = false;

  if (cosH > 1) {
    H = 90; // Polar Night fallback
  } else if (cosH < -1) {
    isMidnightSun = true;
    H = 180; // Midnight Sun
  } else {
    H = Math.acos(cosH) * 180 / Math.PI;
  }

  // Equation of time (EOT)
  const b = (360 / 365) * (dayOfYear - 81) * Math.PI / 180;
  const eot = 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b); 
  
  // Norway Daylight Saving Time (DST) = UTC + 2
  const localNoon = 12 - (coords.lng / 15) - (eot / 60) + 2.0;

  let sunriseHours = localNoon - (H / 15);
  let sunsetHours = localNoon + (H / 15);

  if (isMidnightSun) {
    // Falls back to Oslo coordinates or reasonable summer timings
    sunriseHours = 3.0;
    sunsetHours = 23.5;
  }

  const formatHours = (h: number) => {
    let hours = Math.floor(h);
    let mins = Math.round((h - hours) * 60);
    if (mins === 60) { hours++; mins = 0; }
    hours = (hours + 24) % 24;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${String(mins).padStart(2, '0')} ${ampm}`;
  };

  return {
    fajr: formatHours(sunriseHours - 1.0), // 1 hour before sunrise
    sunset: formatHours(sunsetHours)
  };
}

export const defaultItinerary: Record<string, any[]> = {
  thursday: [
    { type: 'prayer', time: '{fajr}', label: '1. Fajr Prayer (Dawn)', desc: 'Fajr in Oslo (calculated at 1 hour before sunrise). Prayed individually before departure.', iconName: 'Sunrise' },
    { type: 'location', time: '15:00', label: 'Departure from Nurulquran', desc: 'Meet up at Jerikoveien 26, 1067 Oslo. Board the 17-seater Sprinter minibus. Ensure all gear is loaded.', iconName: 'MapPin', image: '/images/nurulquran.jpg', stopKey: 'oslo' },
    { type: 'break', time: '15:50', label: 'Rest Stop (9 mins)', desc: 'Short bathroom and stretch break after 50 minutes of driving.', iconName: 'Coffee' },
    { type: 'location', time: '16:50', label: 'Scenic Stop: Flå (Hallingdal)', desc: 'Gateway to the Hallingdal valley. Sights: The Bear Park. Driving break and leg stretch.', iconName: 'MapPin', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Flaa_Kommune_Verwaltung.jpg/960px-Flaa_Kommune_Verwaltung.jpg', stopKey: 'fla' },
    { type: 'location', time: '17:00', label: 'Stop: Hallingdal Islamic Center (Gol Mosque)', desc: 'Located at Furuvegen 5, 3550 Gol. We stop at the mosque for prayers and wudu.', iconName: 'MapPin', image: '/images/gol_mosque.jpg', stopKey: 'gol' },
    { type: 'prayer', time: '17:15', label: '2 & 3. Combined Zuhr & Asr (Jam\' Qasr)', desc: 'Combined afternoon prayers prayed in Gol Mosque. Shortened to 2 Raka\'at each.', iconName: 'Sun' },
    { type: 'break', time: '18:15', label: 'Rest Stop (9 mins)', desc: 'Short bathroom and stretch break.', iconName: 'Coffee' },
    { type: 'location', time: '20:30', label: 'Arrival in Geilo (Mountain Cabins)', desc: 'Check into the cabins. Address: Gamlevegen 32, 3580 Geilo, Norway. Geilo is a prominent mountain resort town.', iconName: 'MapPin', image: '/images/geilo_cabins.jpg', stopKey: 'geilo' },
    { type: 'prayer', time: '{sunset}', label: '4 & 5. Combined Maghrib & Isha (Jam\' Qasr)', desc: 'Combined night prayers prayed at the cabin. Calculated exactly at sunset.', iconName: 'Sunset' },
  ],
  friday: [
    { type: 'prayer', time: '{fajr}', label: '1. Fajr Prayer (Dawn)', desc: 'Fajr in Geilo (1 hour before sunrise). Prayed in congregation.', iconName: 'Sunrise' },
    { type: 'location', time: '09:00', label: 'Depart Geilo towards Stryn', desc: 'Driving north on Rv7/Rv52 through the dramatic Hemsedal mountain pass.', iconName: 'MapPin', image: '/images/geilo_cabins.jpg', stopKey: 'geilo' },
    { type: 'break', time: '09:50', label: 'Rest Stop (9 mins)', desc: 'Short bathroom and stretch break after 50 mins driving.', iconName: 'Coffee' },
    { type: 'location', time: '10:50', label: 'Scenic Stop: Borgund Stave Church (Lærdal)', desc: 'Built around 1180 AD. Sights: The most authentic and best-preserved of Norway\'s remaining stave churches.', iconName: 'MapPin', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Borgund_Stave_Church_in_L%C3%A6rdalen%2C_2013_June.jpg/960px-Borgund_Stave_Church_in_L%C3%A6rdalen%2C_2013_June.jpg', stopKey: 'laerdal' },
    { type: 'location', time: '12:25', label: 'Drive: Lærdal Tunnel & Rest', desc: 'The world\'s longest road tunnel (24.5 km). Sights: Glowing blue/yellow caverns. We will stop for 9 minutes inside one of the caverns.', iconName: 'MapPin', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/L%C3%A6rdalstunnelen_Norway.JPG/960px-L%C3%A6rdalstunnelen_Norway.JPG', stopKey: 'laerdal' },
    { type: 'break', time: '13:30', label: 'Ferry Crossing: Fodnes to Mannheller', desc: 'A scenic 15-minute crossing of the Sognefjord, Norway\'s deepest and longest fjord.', iconName: 'Coffee', image: 'https://upload.wikimedia.org/wikipedia/commons/4/47/Sognefjord%2C_Norway.jpg' },
    { type: 'location', time: '14:40', label: 'Scenic Stop: Bøyabreen Glacier & Lunch', desc: 'Sights: Bøyabreen, a spectacular active branch of the Jostedalsbreen Ice Cap.', iconName: 'MapPin', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/B%C3%B8yabreen_1993.jpg/960px-B%C3%B8yabreen_1993.jpg', stopKey: 'boyabreen' },
    { type: 'prayer', time: '15:00', label: '2 & 3. Combined Zuhr & Asr (Jam\' Qasr)', desc: 'Afternoon prayers combined at the Bøyabreen glacier viewing area.', iconName: 'Sun' },
    { type: 'break', time: '16:30', label: 'Rest Stop (9 mins)', desc: 'Bathroom break before the final stretch.', iconName: 'Coffee' },
    { type: 'location', time: '17:30', label: 'Arrival in Stryn & Check-in', desc: 'Arrive at the accommodation. Stryn is known for glaciers and majestic fjords.', iconName: 'MapPin', image: '/images/stryn_fjord.jpg', stopKey: 'stryn' },
    { type: 'prayer', time: '{sunset}', label: '4 & 5. Combined Maghrib & Isha (Jam\' Qasr)', desc: 'Night prayers combined at the Stryn lodge at sunset.', iconName: 'Sunset' },
  ],
  saturday: [
    { type: 'prayer', time: '{fajr}', label: '1. Fajr Prayer (Dawn)', desc: 'Fajr in Stryn (1 hour before sunrise). Prayed in congregation before departure.', iconName: 'Sunrise' },
    { type: 'location', time: '08:30', label: 'Depart Stryn towards Geiranger', desc: 'Driving north via Rv15 and Rv60 toward Stranda.', iconName: 'MapPin', image: '/images/stryn_fjord.jpg', stopKey: 'stryn' },
    { type: 'break', time: '09:20', label: 'Rest Stop (9 mins)', desc: 'Short bathroom and stretch break.', iconName: 'Coffee' },
    { type: 'location', time: '10:10', label: 'Ferry Crossing: Stranda to Liabygda', desc: 'Short car ferry across the Storfjorden.', iconName: 'Coffee', image: '/images/stryn_fjord.jpg' },
    { type: 'location', time: '11:20', label: 'Scenic Stop: Gudbrandsjuvet (Valldal)', desc: 'Sights: A spectacular mountain ravine where the Valldøla river rages through.', iconName: 'MapPin', image: '/images/gudbrandsjuvet.jpg', stopKey: 'valldal' },
    { type: 'break', time: '12:55', label: 'Rest Stop (9 mins)', desc: 'Quick rest stop.', iconName: 'Coffee' },
    { type: 'location', time: '13:50', label: 'Scenic Stop: Trollstigen (Troll\'s Ladder) Pass', desc: 'Sights: Norway\'s most famous tourist road, 11 hairpin turns.', iconName: 'MapPin', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/DSC07845-Panorama.jpg/960px-DSC07845-Panorama.jpg', stopKey: 'trollstigen' },
    { type: 'prayer', time: '14:20', label: '2 & 3. Combined Zuhr & Asr (Jam\' Qasr)', desc: 'Afternoon prayers combined on the Trollstigen plateau.', iconName: 'Sun' },
    { type: 'location', time: '15:40', label: 'Scenic Stop: Ørnevegen (Eagle Road) Viewpoint', desc: 'Sights: Looking straight down at the UNESCO World Heritage Geirangerfjord.', iconName: 'MapPin', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Geirangerfjord_.jpg/960px-Geirangerfjord_.jpg', stopKey: 'geiranger' },
    { type: 'location', time: '16:30', label: 'Arrival at Valldal Cabins', desc: 'Check in at cabins. Address: Murigjerdet 11, 6210 Sylte, Norway (Valldal).', iconName: 'MapPin', image: '/images/valldal_cabins.jpg', stopKey: 'valldal' },
    { type: 'prayer', time: '{sunset}', label: '4 & 5. Combined Maghrib & Isha (Jam\' Qasr)', desc: 'Night prayers combined at the Geiranger cabins.', iconName: 'Sunset' },
  ],
  sunday: [
    { type: 'prayer', time: '{fajr}', label: '1. Fajr Prayer (Dawn)', desc: 'Fajr in Geiranger (1 hour before sunrise). Prayed in congregation.', iconName: 'Sunrise' },
    { type: 'location', time: '09:30', label: 'Depart Geiranger towards Oslo', desc: 'Driving up the Nibbevegen road toward Grotli.', iconName: 'MapPin', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Dalsnibba.jpg/960px-Dalsnibba.jpg', stopKey: 'geiranger' },
    { type: 'location', time: '10:00', label: 'Scenic Stop: Dalsnibba Skywalk Viewpoint', desc: 'Sights: Europe\'s highest fjord view from a road.', iconName: 'MapPin', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Dalsnibba.jpg/960px-Dalsnibba.jpg', stopKey: 'dalsnibba' },
    { type: 'break', time: '11:20', label: 'Rest Stop (9 mins)', desc: 'Bathroom break after coming down the mountains.', iconName: 'Coffee' },
    { type: 'location', time: '12:20', label: 'Scenic Stop: Lom Stave Church & Lom Bakery', desc: 'Sights: Lom Stave Church and famous wood-fired bakery.', iconName: 'MapPin', image: 'https://upload.wikimedia.org/wikipedia/commons/9/9c/Stabkirche-Lom.jpg', stopKey: 'lom' },
    { type: 'break', time: '14:10', label: 'Rest Stop (9 mins)', desc: 'Short bathroom and stretch break.', iconName: 'Coffee' },
    { type: 'prayer', time: '14:30', label: '2 & 3. Combined Zuhr & Asr (Jam\' Qasr)', desc: 'Afternoon prayers combined at a quiet grassy spot near Otta.', iconName: 'Sun' },
    { type: 'break', time: '15:30', label: 'Rest Stop (9 mins)', desc: 'Short break on the E6 highway.', iconName: 'Coffee' },
    { type: 'location', time: '16:30', label: 'Scenic Stop: Lillehammer Olympic Park', desc: 'Sights: Home of the 1994 Winter Olympics. Lysgårdsbakkene ski jumping towers.', iconName: 'MapPin', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Lysg%C3%A5rd.JPG/960px-Lysg%C3%A5rd.JPG', stopKey: 'lillehammer' },
    { type: 'location', time: '17:10', label: 'Stop: Lillehammer Moské', desc: 'Sights: The local mosque in Lillehammer (Bankgata 14). Rest and prayer.', iconName: 'MapPin', image: '/images/lillehammer_mosque.jpg', stopKey: 'lillehammer' },
    { type: 'break', time: '18:15', label: 'Rest Stop (9 mins)', desc: 'Final short break before arriving in Oslo.', iconName: 'Coffee' },
    { type: 'location', time: '19:00', label: 'Arrival back at Nurulquran', desc: 'Arrived back at Jerikoveien 26, 1067 Oslo. Unload Sprinter minibus, say goodbye.', iconName: 'MapPin', image: '/images/nurulquran.jpg', stopKey: 'oslo' },
    { type: 'prayer', time: '{sunset}', label: '4 & 5. Combined Maghrib & Isha (Jam\' Qasr)', desc: 'Night prayers combined in Oslo at sunset (calculated dynamically).', iconName: 'Sunset' },
  ]
};

export function toAmPm(timeStr: string) {
  if (!timeStr.match(/^\d{1,2}:\d{2}$/)) return timeStr;
  const [h, m] = timeStr.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayHours = h % 12 || 12;
  return `${displayHours}:${String(m).padStart(2, '0')} ${ampm}`;
}

// Resolve the dynamic {fajr} and {sunset} placeholders
export function resolveStops(day: string, stops: any[]) {
  const thurTimes = calculateTravelPrayers('oslo', 0);
  const friTimes = calculateTravelPrayers('geilo', 1);
  const satTimes = calculateTravelPrayers('stryn', 2);
  const sunTimes = calculateTravelPrayers('geiranger', 3);

  const timesMap: Record<string, { fajr: string; sunset: string }> = {
    thursday: thurTimes,
    friday: friTimes,
    saturday: satTimes,
    sunday: sunTimes
  };

  const dayTimes = timesMap[day] || thurTimes;

  return stops.map(stop => {
    let resolvedTime = stop.time;
    if (stop.time === '{fajr}') {
      resolvedTime = dayTimes.fajr;
    } else if (stop.time === '{sunset}') {
      resolvedTime = dayTimes.sunset;
    } else {
      resolvedTime = toAmPm(resolvedTime);
    }
    return {
      ...stop,
      time: resolvedTime,
      icon: iconMap[stop.iconName] || MapPin
    };
  });
}

export const Itinerary: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'thursday' | 'friday' | 'saturday' | 'sunday'>('thursday');
  const [hoveredStop, setHoveredStop] = useState<string | null>(null);
  const [modalImage, setModalImage] = useState<{ src: string; alt: string } | null>(null);

  // Firestore state
  const [dbItinerary, setDbItinerary] = useState<Record<string, any[]>>(defaultItinerary);

  // Interactive zoom & pan states for route map
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Minibus animation states
  const [routePath, setRoutePath] = useState<SVGPathElement | null>(null);
  const [busDistance, setBusDistance] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [busPos, setBusPos] = useState({ x: 628, y: 383, angle: 0 }); // starts at Oslo
  const [totalPathLength, setTotalPathLength] = useState(1500); // fallback

  // Draggable and Collapsible UI Boxes states
  const [legendMinimized, setLegendMinimized] = useState(false);
  const [tooltipMinimized, setTooltipMinimized] = useState(false);
  const [legendOffset, setLegendOffset] = useState({ x: 0, y: 0 });
  const [tooltipOffset, setTooltipOffset] = useState({ x: 0, y: 0 });
  const [draggingBox, setDraggingBox] = useState<'legend' | 'tooltip' | null>(null);
  const [boxDragStart, setBoxDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!draggingBox) return;

    const handlePointerMove = (e: PointerEvent) => {
      const offset = {
        x: e.clientX - boxDragStart.x,
        y: e.clientY - boxDragStart.y
      };
      if (draggingBox === 'legend') {
        setLegendOffset(offset);
      } else {
        setTooltipOffset(offset);
      }
    };

    const handlePointerUp = () => {
      setDraggingBox(null);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [draggingBox, boxDragStart]);

  const handleBoxDragStart = (box: 'legend' | 'tooltip', e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation(); // Prevent map panning
    const currentOffset = box === 'legend' ? legendOffset : tooltipOffset;
    setDraggingBox(box);
    setBoxDragStart({
      x: e.clientX - currentOffset.x,
      y: e.clientY - currentOffset.y
    });
  };

  const getLabelProps = (dir: string = 'top', x: number, y: number): { x: number; y: number; textAnchor: 'start' | 'middle' | 'end' } => {
    switch (dir) {
      case 'bottom':
        return { x, y: y + 20, textAnchor: 'middle' };
      case 'left':
        return { x: x - 12, y: y + 4, textAnchor: 'end' };
      case 'right':
        return { x: x + 12, y: y + 4, textAnchor: 'start' };
      case 'top-left':
        return { x: x - 10, y: y - 10, textAnchor: 'end' };
      case 'top-right':
        return { x: x + 10, y: y - 10, textAnchor: 'start' };
      case 'bottom-left':
        return { x: x - 10, y: y + 16, textAnchor: 'end' };
      case 'bottom-right':
        return { x: x + 10, y: y + 16, textAnchor: 'start' };
      case 'top':
      default:
        return { x, y: y - 18, textAnchor: 'middle' };
    }
  };

  useEffect(() => {
    if (routePath) {
      setTotalPathLength(routePath.getTotalLength());
    }
  }, [routePath]);

  useEffect(() => {
    let animationId: number;
    if (!routePath || !isPlaying) return;

    const totalLength = routePath.getTotalLength();

    const animate = () => {
      setBusDistance(prev => {
        let next = prev + 0.15 * speed; // Slowed down from 0.8
        if (next >= totalLength) {
          return 0; // loop back
        }
        return next;
      });
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [routePath, isPlaying, speed]);

  useEffect(() => {
    if (!routePath) return;
    try {
      const totalLength = routePath.getTotalLength();
      const currentDist = Math.min(totalLength, Math.max(0, busDistance));
      const p = routePath.getPointAtLength(currentDist);
      
      // Calculate angle
      const lookAhead = Math.min(totalLength, currentDist + 2);
      const pAhead = routePath.getPointAtLength(lookAhead);
      const angle = Math.atan2(pAhead.y - p.y, pAhead.x - p.x) * 180 / Math.PI;
      
      setBusPos({ x: p.x, y: p.y, angle });
    } catch (e) {
      // fallback
    }
  }, [routePath, busDistance]);

  const stopToDayMap: Record<string, 'thursday' | 'friday' | 'saturday' | 'sunday'> = {
    oslo: 'thursday',
    fla: 'thursday',
    gol: 'thursday',
    geilo: 'thursday',
    laerdal: 'friday',
    boyabreen: 'friday',
    stryn: 'friday',
    valldal: 'saturday',
    trollstigen: 'saturday',
    geiranger: 'saturday',
    dalsnibba: 'sunday',
    lom: 'sunday',
    lillehammer: 'sunday'
  };

  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (e.button !== 0) return; // Only left click
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent<SVGSVGElement>) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX - position.x, y: e.touches[0].clientY - position.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent<SVGSVGElement>) => {
    if (!isDragging) return;
    if (e.touches.length === 1) {
      setPosition({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 4));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.75));
  };

  const handleResetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    const zoomFactor = 0.05;
    const direction = e.deltaY < 0 ? 1 : -1;
    setScale(prev => Math.min(Math.max(prev + direction * zoomFactor, 0.75), 4));
  };

  const handleNodeClick = (nodeKey: string) => {
    const day = stopToDayMap[nodeKey];
    if (day) {
      setActiveTab(day);
      setTimeout(() => {
        const element = document.getElementById(`stop-${nodeKey}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('bg-primary-50/50', 'dark:bg-primary-950/20', 'ring-2', 'ring-primary-500/20');
          setTimeout(() => {
            element.classList.remove('bg-primary-50/50', 'dark:bg-primary-950/20', 'ring-2', 'ring-primary-500/20');
          }, 2000);
        }
      }, 100);
    }
  };

  useEffect(() => {
    // 1. Setup listeners & Seeding for individual days if they don't exist
    const days = ['thursday', 'friday', 'saturday', 'sunday'];
    
    // Seed days if missing
    days.forEach(async (day) => {
      const docRef = doc(db, 'itinerary', day);
      try {
        const snap = await getDoc(docRef);
        if (!snap.exists()) {
          await setDoc(docRef, { stops: defaultItinerary[day] });
        }
      } catch (err) {
        console.error(`Error checking/seeding day ${day}:`, err);
      }
    });

    // 2. Real-time subscription to collection
    const unsub = onSnapshot(collection(db, 'itinerary'), (snap) => {
      const data: Record<string, any[]> = {};
      snap.forEach(docSnap => {
        data[docSnap.id] = docSnap.data().stops;
      });
      
      // Update state when all 4 days are present
      if (Object.keys(data).length === 4) {
        setDbItinerary(data);
      }
    }, (error) => {
      console.error("Firestore onSnapshot error:", error);
    });

    return () => unsub();
  }, []);

  const itineraryData = {
    thursday: resolveStops('thursday', dbItinerary.thursday || defaultItinerary.thursday),
    friday: resolveStops('friday', dbItinerary.friday || defaultItinerary.friday),
    saturday: resolveStops('saturday', dbItinerary.saturday || defaultItinerary.saturday),
    sunday: resolveStops('sunday', dbItinerary.sunday || defaultItinerary.sunday)
  };

  const currentItinerary = itineraryData[activeTab];

  // SVG Coordinates mapping for interactive vector map
  const mapNodes: Array<{ key: string; name: string; x: number; y: number; info: string; labelDir?: string; isReference?: boolean }> = [
    { key: 'oslo', name: 'Oslo (Nurulquran)', x: 628, y: 383, info: 'Departure & Return: Jerikoveien 26', labelDir: 'right' },
    { key: 'fla', name: 'Flå', x: 516, y: 326, info: 'Bear Park scenic stop', labelDir: 'top-left' },
    { key: 'gol', name: 'Gol Mosque', x: 470, y: 294, info: 'Hallingdal Islamic Center (Furuvegen 5)', labelDir: 'top-right' },
    { key: 'geilo', name: 'Geilo', x: 405, y: 313, info: 'Mountain cabins check-in', labelDir: 'bottom' },
    { key: 'laerdal', name: 'Lærdal Tunnel', x: 341, y: 250, info: 'World longest tunnel (24.5km)', labelDir: 'left' },
    { key: 'boyabreen', name: 'Bøyabreen Glacier', x: 276, y: 207, info: 'Active branch of Jostedalsbreen', labelDir: 'left' },
    { key: 'stryn', name: 'Stryn', x: 275, y: 160, info: 'Glacier and fjord region lodging', labelDir: 'left' },
    { key: 'valldal', name: 'Valldal (Sylte)', x: 322, y: 116, info: 'Murigjerdet 11 accommodation', labelDir: 'top' },
    { key: 'trollstigen', name: 'Trollstigen', x: 358, y: 99, info: '11 spectacular hairpin turns', labelDir: 'right' },
    { key: 'geiranger', name: 'Geiranger', x: 317, y: 138, info: 'UNESCO fjord view & Eagle Road', labelDir: 'left' },
    { key: 'dalsnibba', name: 'Dalsnibba Skywalk', x: 323, y: 144, info: 'Europe\'s highest fjord view (1500m)', labelDir: 'bottom-right' },
    { key: 'lom', name: 'Lom', x: 437, y: 167, info: 'Lom Stave Church & famous bakery', labelDir: 'right' },
    { key: 'lillehammer', name: 'Lillehammer', x: 603, y: 249, info: 'Olympic park & Lillehammer Mosque', labelDir: 'right' },
    { key: 'bergen', name: 'Bergen', x: 152, y: 329, info: 'Major coastal city', labelDir: 'left', isReference: true },
    { key: 'drammen', name: 'Drammen', x: 580, y: 402, info: 'Major city near Oslo', labelDir: 'left', isReference: true },
    { key: 'alesund', name: 'Ålesund', x: 225, y: 97, info: 'Coastal Art Nouveau city', labelDir: 'left', isReference: true },
    { key: 'stavanger', name: 'Stavanger', x: 188, y: 488, info: 'Major southwestern city', labelDir: 'left', isReference: true }
  ];

  const getClosestStop = () => {
    let minD = Infinity;
    let closest = mapNodes.find(n => !n.isReference) || mapNodes[0];
    for (const node of mapNodes) {
      if (node.isReference) continue;
      const d = Math.hypot(busPos.x - node.x, busPos.y - node.y);
      if (d < minD) {
        minD = d;
        closest = node;
      }
    }
    return { ...closest, distance: minD };
  };

  const closestStop = getClosestStop();
  const currentElevation = locations[closestStop.key]?.elevation || 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6 px-4">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('itinerary.title', 'Itinerary & Schedule')}</h1>
          <p className="text-slate-500 mt-2">{t('itinerary.subtitle', 'Oslo → Geilo → Stryn → Valldal → Geiranger')}</p>
        </div>
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 p-4 rounded-2xl max-w-md">
          <h4 className="text-sm font-bold text-amber-800 dark:text-amber-400 mb-1 flex items-center gap-2">
            <Info className="w-4 h-4" />
            {t('itinerary.travelerRulesTitle', '⏱️ High-Latitude Traveler Rules Applied')}
          </h4>
          <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
            {t('itinerary.travelerRulesDesc', 'Fajr is calculated exactly **1 hour before sunrise** each day. Zuhr/Asr combined at Gol/Bøyabreen (14:00-15:00). Maghrib/Isha combined at **exact local sunset** (approx. 22:45-23:30).')}
          </p>
        </div>
      </div>

      {/* SVG Interactive Route Map */}
      <div className="glass rounded-3xl p-6 shadow-md border border-card-border overflow-hidden">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          {t('itinerary.routeProgress', '🗺️ Interactive Route Progress')}
        </h3>
        
        <div className="relative w-full h-[400px] md:h-[500px] bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border border-card-border overflow-hidden select-none">
          {/* Zoom & Reset Overlay Controls */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 z-30">
            <button 
              onClick={handleZoomIn}
              className="w-10 h-10 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-card-border rounded-xl flex items-center justify-center shadow-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              title={t('itinerary.zoomIn', 'Zoom In')}
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            <button 
              onClick={handleZoomOut}
              className="w-10 h-10 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-card-border rounded-xl flex items-center justify-center shadow-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              title={t('itinerary.zoomOut', 'Zoom Out')}
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <button 
              onClick={handleResetZoom}
              className="w-10 h-10 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-card-border rounded-xl flex items-center justify-center shadow-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              title={t('itinerary.resetMap', 'Reset Map')}
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>

          <svg 
            className={`w-full h-full ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            viewBox="0 0 800 600" 
            fill="none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onWheel={handleWheel}
          >
            <g transform={`translate(${position.x}, ${position.y}) scale(${scale})`} className="transition-transform duration-75 ease-out">
              {/* Stylized Southern Norway Outline */}
              <path
                d="M 150 80 
                   C 130 120, 120 160, 140 200 
                   C 150 250, 170 300, 190 350 
                   C 200 400, 190 450, 210 500 
                   C 250 580, 320 620, 420 620 
                   C 500 620, 560 590, 580 560 
                   C 590 530, 580 500, 608 480 
                   C 620 500, 630 530, 640 560 
                   C 660 520, 680 400, 700 300 
                   C 720 200, 740 100, 750 50 Z"
                fill="currentColor"
                className="fill-slate-100/60 dark:fill-slate-800/10 stroke-slate-200/80 dark:stroke-slate-700/40"
                strokeWidth="3"
                strokeLinejoin="round"
              />

              {/* Draw base route paths */}
              <path
                d="M 628 383 L 516 326 L 470 294 L 405 313 L 341 250 L 276 207 L 275 160 L 322 116 L 358 99 L 317 138 L 323 144 L 437 167 L 603 249 L 628 383"
                stroke="var(--color-primary-100)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="opacity-40 dark:opacity-20"
              />
              {/* Draw active animated path */}
              <path
                ref={setRoutePath}
                d="M 628 383 L 516 326 L 470 294 L 405 313 L 341 250 L 276 207 L 275 160 L 322 116 L 358 99 L 317 138 L 323 144 L 437 167 L 603 249 L 628 383"
                stroke="url(#route-gradient)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="1500"
                strokeDashoffset="0"
                className="animate-[dash_15s_linear_infinite]"
              />
              
              {/* Gradients */}
              <defs>
                <linearGradient id="route-gradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="50%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>

              {/* Moving Minibus */}
              <g 
                transform={`translate(${busPos.x}, ${busPos.y}) rotate(${busPos.angle})`}
              >
                {/* Glowing drop shadow */}
                <circle cx="0" cy="0" r="12" fill="#3b82f6" className="opacity-40 blur-xs" />
                {/* Bus chassis shape */}
                <rect x="-9" y="-6" width="18" height="12" rx="2" fill="#3b82f6" stroke="#ffffff" strokeWidth="1.5" />
                {/* Windows */}
                <rect x="2" y="-4" width="4" height="8" rx="0.5" fill="#e2e8f0" />
                <rect x="-3" y="-4" width="4" height="8" rx="0.5" fill="#e2e8f0" />
                <rect x="-8" y="-4" width="4" height="8" rx="0.5" fill="#e2e8f0" />
                {/* Headlights */}
                <circle cx="9" cy="-3" r="1" fill="#eab308" />
                <circle cx="9" cy="3" r="1" fill="#eab308" />
              </g>

              {/* Render Nodes */}
              {mapNodes.map((node) => {
                if (node.isReference) {
                  const labelProps = getLabelProps(node.labelDir || 'left', node.x, node.y);
                  return (
                    <g 
                      key={node.key}
                      className="pointer-events-none select-none opacity-60"
                    >
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r="4"
                        fill="#94a3b8"
                      />
                      <text
                        x={labelProps.x}
                        y={labelProps.y}
                        textAnchor={labelProps.textAnchor}
                        fill="#94a3b8"
                        className="text-xs font-bold tracking-wider uppercase"
                      >
                        {t('itinerary.map.' + node.key + '.name', node.name)}
                      </text>
                    </g>
                  );
                }

                const isHovered = hoveredStop === node.key;
                const isCurrentDayStop = currentItinerary.some(item => (item as any).stopKey === node.key);
                
                const scaledX = node.x;
                const scaledY = node.y;

                // Elevation Heatmap properties
                const elevation = locations[node.key]?.elevation || 0;
                
                // Heatmap color logic
                let elevationColor = '#10b981'; // low (green)
                let haloColor = 'rgba(16, 185, 129, 0.2)';
                let pulseClass = '';
                if (elevation >= 1000) {
                  elevationColor = '#a855f7'; // extreme (purple)
                  haloColor = 'rgba(168, 85, 247, 0.4)';
                  pulseClass = 'animate-pulse';
                } else if (elevation >= 500) {
                  elevationColor = '#ef4444'; // high (red)
                  haloColor = 'rgba(239, 68, 68, 0.35)';
                } else if (elevation >= 100) {
                  elevationColor = '#f97316'; // medium (orange)
                  haloColor = 'rgba(249, 115, 22, 0.25)';
                }
                
                const haloRadius = 12 + Math.min(20, (elevation / 1500) * 18);
                const labelProps = getLabelProps(node.labelDir || 'top', scaledX, scaledY);

                return (
                  <g 
                    key={node.key}
                    onMouseEnter={() => setHoveredStop(node.key)}
                    onMouseLeave={() => setHoveredStop(null)}
                    onClick={() => handleNodeClick(node.key)}
                    className="cursor-pointer group"
                  >
                    {/* Heatmap Halo */}
                    <circle
                      cx={scaledX}
                      cy={scaledY}
                      r={haloRadius}
                      fill={haloColor}
                      className={pulseClass}
                    />

                    {isCurrentDayStop && (
                      <circle
                        cx={scaledX}
                        cy={scaledY}
                        r={haloRadius + 4}
                        fill="#10b981"
                        className="opacity-25 animate-ping"
                      />
                    )}
                    <circle
                      cx={scaledX}
                      cy={scaledY}
                      r={isHovered ? 12 : 8}
                      fill={elevationColor}
                      className={`transition-[r,fill] duration-300 shadow-lg`}
                      style={{ filter: `drop-shadow(0 0 5px ${elevationColor}80)` }}
                    />
                    <circle
                      cx={scaledX}
                      cy={scaledY}
                      r={isHovered ? 18 : 13}
                      stroke={isCurrentDayStop ? '#10b981' : '#3b82f6'}
                      strokeWidth="2"
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    />
                    <text
                      x={labelProps.x}
                      y={labelProps.y}
                      textAnchor={labelProps.textAnchor}
                      fill="currentColor"
                      className="text-xs font-bold select-none drop-shadow-sm opacity-80 dark:opacity-90 fill-slate-700 dark:fill-slate-300"
                    >
                      {t('itinerary.map.' + node.key + '.name', node.name)}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>

          {/* Elevation Heatmap Legend */}
          {legendMinimized ? (
            <button 
              onClick={() => setLegendMinimized(false)}
              className="absolute bottom-4 right-4 bg-white/95 dark:bg-slate-800/95 p-2.5 rounded-full shadow-lg border border-card-border text-xs z-20 flex items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-all hover:scale-105"
              style={{ transform: `translate(${legendOffset.x}px, ${legendOffset.y}px)` }}
              title="Show Altitude Legend"
            >
              🏔️ <span className="font-bold text-slate-700 dark:text-slate-300">Legend</span>
            </button>
          ) : (
            <div 
              className="absolute bottom-4 right-4 bg-white/90 dark:bg-slate-800/90 px-3 py-2 rounded-xl shadow-md border border-card-border backdrop-blur text-xs space-y-1 z-20 w-44 select-none"
              style={{ transform: `translate(${legendOffset.x}px, ${legendOffset.y}px)` }}
            >
              {/* Header bar for drag and minimize */}
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700/50 pb-1 mb-1.5">
                <div 
                  onPointerDown={(e) => handleBoxDragStart('legend', e)}
                  className="flex items-center gap-1 cursor-move text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex-1 py-0.5"
                  title="Drag to move"
                >
                  <GripHorizontal className="w-3.5 h-3.5" />
                  <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">
                    {t('itinerary.elevationLegend', 'Altitude')}
                  </span>
                </div>
                <button 
                  onClick={() => setLegendMinimized(true)}
                  className="p-0.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  title="Minimize"
                >
                  <Minimize2 className="w-3.5 h-3.5" />
                </button>
              </div>
              
              <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                <span>Low (&lt; 100m)</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                <span>Med (100m - 500m)</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
                <span>High (500m - 1000m)</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block animate-pulse"></span>
                <span>Extreme (&gt; 1000m)</span>
              </div>
            </div>
          )}

          {/* Map Tooltip Box */}
          {tooltipMinimized ? (
            <button 
              onClick={() => setTooltipMinimized(false)}
              className="absolute bottom-4 left-4 bg-white/95 dark:bg-slate-800/95 p-2.5 rounded-full shadow-lg border border-card-border text-xs z-20 flex items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-all hover:scale-105"
              style={{ transform: `translate(${tooltipOffset.x}px, ${tooltipOffset.y}px)` }}
              title="Show Status & Details"
            >
              🚌 <span className="font-bold text-slate-700 dark:text-slate-300">
                {hoveredStop 
                  ? t('itinerary.map.' + hoveredStop + '.name', mapNodes.find(n => n.key === hoveredStop)?.name)
                  : (isPlaying ? t('itinerary.busDriving', 'Driving...') : t('itinerary.busParked', 'Parked'))
                }
              </span>
            </button>
          ) : (
            <div 
              className="absolute bottom-4 left-4 bg-white/95 dark:bg-slate-800/95 p-4 rounded-xl shadow-lg border border-card-border w-[calc(100%-2rem)] sm:w-80 backdrop-blur z-20 select-none"
              style={{ transform: `translate(${tooltipOffset.x}px, ${tooltipOffset.y}px)` }}
            >
              {/* Header bar for drag and minimize */}
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700/50 pb-1 mb-2">
                <div 
                  onPointerDown={(e) => handleBoxDragStart('tooltip', e)}
                  className="flex items-center gap-1 cursor-move text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex-1 py-0.5"
                  title="Drag to move"
                >
                  <GripHorizontal className="w-3.5 h-3.5" />
                  <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">
                    {t('itinerary.statusAndDetails', 'Status & Details')}
                  </span>
                </div>
                <button 
                  onClick={() => setTooltipMinimized(true)}
                  className="p-0.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  title="Minimize"
                >
                  <Minimize2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {hoveredStop ? (
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200">
                    {t('itinerary.map.' + hoveredStop + '.name', mapNodes.find(n => n.key === hoveredStop)?.name)}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {t('itinerary.map.' + hoveredStop + '.info', mapNodes.find(n => n.key === hoveredStop)?.info)}
                  </p>
                  <span className="text-xs text-primary-500 font-medium mt-2 block">{t('itinerary.clickPointHint', '👉 Click point to scroll to details')}</span>
                </div>
              ) : (
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-1.5">
                    🚌 {isPlaying ? t('itinerary.busDriving', 'Minibus is driving...') : t('itinerary.busParked', 'Minibus is parked')}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {t('itinerary.nearestStop', 'Nearest Stop')}: <strong>{t('itinerary.map.' + closestStop.key + '.name', closestStop.name)}</strong>
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {t('itinerary.currentAltitude', 'Altitude')}: {currentElevation}m | {t('itinerary.mapInstructions', 'Drag to pan. Scroll to zoom.')}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Minibus Animation Playback Controls */}
        <div className="bg-slate-50 dark:bg-slate-900/30 p-4 rounded-2xl border border-card-border flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-10 h-10 bg-primary-500 hover:bg-primary-600 text-white rounded-xl flex items-center justify-center shadow-md transition-colors"
              title={isPlaying ? 'Pause Animation' : 'Start Animation'}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-white" />}
            </button>
            <button
              onClick={() => {
                setIsPlaying(false);
                setBusDistance(0);
              }}
              className="w-10 h-10 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-card-border rounded-xl flex items-center justify-center transition-colors"
              title="Reset to Oslo"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            
            {/* Speed Multiplier */}
            <div className="flex bg-slate-200 dark:bg-slate-800 p-0.5 rounded-lg border border-card-border">
              {([0.5, 1, 2] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                    speed === s 
                      ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>

          {/* Scrub Slider */}
          <div className="flex-1 w-full flex items-center gap-3">
            <span className="text-xs font-mono text-slate-400">Oslo</span>
            <input
              type="range"
              min="0"
              max={totalPathLength}
              value={busDistance}
              onChange={(e) => {
                setBusDistance(Number(e.target.value));
                setIsPlaying(false);
              }}
              className="flex-1 h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary-500"
            />
            <span className="text-xs font-mono text-slate-400">Return</span>
          </div>

          {/* Elevation Indicator Panel */}
          <div className="bg-white/80 dark:bg-slate-800/80 px-4 py-2 rounded-xl border border-card-border text-xs flex items-center gap-2 shrink-0">
            <span className="font-bold text-slate-400 uppercase tracking-wider">{t('itinerary.currentAltitude', 'Altitude')}:</span>
            <span className="font-mono font-bold text-primary-600 dark:text-primary-400">
              {currentElevation}m
            </span>
          </div>
        </div>
      </div>

      {/* Tabs and Details */}
      <div className="glass rounded-3xl overflow-hidden shadow-sm">
        <div className="flex flex-wrap border-b border-card-border pb-2 gap-2">
          {Object.keys(itineraryData).map((day) => (
            <button
              key={day}
              onClick={() => setActiveTab(day as any)}
              className={`flex-1 min-w-[100px] py-4 px-6 text-sm font-semibold capitalize transition-colors ${
                activeTab === day 
                  ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50 dark:bg-primary-900/20' 
                  : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {t('common.days.' + day, day)}
            </button>
          ))}
        </div>

        <div className="p-6 md:p-8">
          <div className="relative border-s-2 border-primary-200 dark:border-primary-900/50 ms-4 space-y-8 pb-4">
            {currentItinerary.map((item, idx) => {
              const Icon = item.icon;
              const isPrayer = item.type === 'prayer';
              const isBreak = item.type === 'break';
              const stopKey = (item as any).stopKey;
              
              return (
                <div 
                  key={idx} 
                  id={stopKey ? `stop-${stopKey}` : undefined}
                  className="relative ps-8 group rounded-3xl p-5 mb-4 glass transition-all duration-500 hover-lift animate-slide-up border border-card-border"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                  onMouseEnter={() => stopKey && setHoveredStop(stopKey)}
                  onMouseLeave={() => stopKey && setHoveredStop(null)}
                >
                  <div className={`absolute -start-[17px] top-6 w-8 h-8 rounded-full flex items-center justify-center border-4 border-card-bg transition-transform group-hover:scale-125 ${
                    isPrayer ? 'bg-amber-500 text-white' : 
                    isBreak ? 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300' : 
                    'bg-primary-500 text-white'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4 mb-1">
                    <span className={`font-mono font-bold text-lg ${isPrayer ? 'text-amber-600 dark:text-amber-400' : 'text-primary-600 dark:text-primary-400'}`}>
                      {item.time}
                    </span>
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
                      {t('itinerary.' + activeTab + '.' + idx + '.label', item.label)}
                    </h3>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base leading-relaxed">
                    {t('itinerary.' + activeTab + '.' + idx + '.desc', item.desc)}
                  </p>
                  
                  {isPrayer && (
                    <div className="mt-2 inline-flex text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200 px-3 py-1 rounded-full">
                      {t('itinerary.prayerCongregationRule', 'Men: Mandatory Congregation • Ladies: Optional')}
                    </div>
                  )}
                  
                  {(item as any).image && (
                    <div 
                      onClick={() => setModalImage({ src: (item as any).image, alt: t('itinerary.' + activeTab + '.' + idx + '.label', item.label) })}
                      className="mt-4 rounded-xl overflow-hidden max-w-sm shadow-md border border-slate-200 dark:border-slate-800/60 transition-transform hover:scale-[1.02] cursor-zoom-in"
                    >
                      <img src={(item as any).image} alt={t('itinerary.' + activeTab + '.' + idx + '.label', item.label)} className="w-full h-48 object-cover" loading="lazy" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Enlarged Image Modal */}
      {modalImage && (
        <div 
          onClick={() => setModalImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fade-in cursor-zoom-out"
        >
          <div className="relative max-w-4xl w-full max-h-[85vh] flex items-center justify-center">
            <button 
              onClick={() => setModalImage(null)}
              className="absolute -top-12 right-0 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <img 
              src={modalImage.src} 
              alt={modalImage.alt} 
              onClick={(e) => e.stopPropagation()} 
              className="max-w-full max-h-[80vh] rounded-3xl object-contain shadow-2xl border border-white/10 animate-scale-in"
            />
            {modalImage.alt && (
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md text-white text-sm px-4 py-1.5 rounded-full font-semibold pointer-events-none">
                {modalImage.alt}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
